// faqutwo live-transcript sink — qutwo-internal fork addition (NOT in upstream TranscripTonic).
//
// Upstream captures captions live and stores the rolling `transcript` array in chrome.storage.local,
// but only fires its webhook at the END of the meeting. For faqutwo we want the transcript LIVE so the
// in-page AI has it as context during the call. This watches that storage key and debounce-POSTs the
// current transcript to the local faqutwo bridge.
//
// Deliberately self-contained and loaded via a single `importScripts("faqutwo-sink.js")` line at the top
// of background.js — it touches NONE of upstream's scraping/webhook code, so `git merge upstream/main`
// stays a clean, near-conflict-free routine. Default endpoint assumes the bridge on this machine;
// override by setting `faqutwoUrl` in chrome.storage.sync.

(function () {
  const DEFAULT_URL = "http://127.0.0.1:8765/transcript";
  const DEBOUNCE_MS = 4000;   // coalesce caption bursts; the bridge full-replaces, so latency is fine
  let timer = null;

  // Same block shape upstream uses ({personName, transcriptText, timestamp}); speaker-labelled lines.
  function fmt(transcript) {
    if (!Array.isArray(transcript)) return "";
    return transcript
      .map(b => `${(b && b.personName) || "?"}: ${(b && b.transcriptText) || ""}`.trim())
      .filter(Boolean)
      .join("\n");
  }

  function flush() {
    chrome.storage.local.get(["transcript", "meetingTitle", "meetingSoftware"], (local) => {
      const text = fmt(local && local.transcript);
      if (!text.trim()) return;
      chrome.storage.sync.get(["faqutwoUrl"], (sync) => {
        const url = (sync && sync.faqutwoUrl) || DEFAULT_URL;
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            meeting: (local && local.meetingTitle) || "",
            source: (local && local.meetingSoftware) || ""
          })
        }).catch(() => { /* bridge not running / different machine — ignore; this is best-effort */ });
      });
    });
  }

  // The content script rewrites these keys as captions arrive; debounce a POST on each change.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || (!changes.transcript && !changes.chatMessages)) return;
    clearTimeout(timer);
    timer = setTimeout(flush, DEBOUNCE_MS);
  });
})();

// Reliability fix (Firefox). Two upstream gaps break Meet capture in Firefox:
//   1. Content scripts are (re)registered only on permissions.onAdded / onInstalled — never on
//      onStartup — and Firefox doesn't reliably fire onAdded for about:addons permission toggles.
//   2. reRegisterContentScripts() gates Meet on the `wantGoogleMeet` flag, set by the popup's "Google
//      Meet" checkbox — but that checkbox enables via a background-side permissions.request(), which
//      Firefox rejects unless it comes straight from a user gesture, so the checkbox reverts and the
//      flag never sticks. Net effect: even with meet.google.com granted in about:addons, nothing
//      registers, nothing is captured.
// Fix: whenever the background loads (and on startup), if the Meet host IS granted, set
// wantGoogleMeet ourselves (via permissions.contains — no request, no gesture needed) and re-run the
// idempotent reRegisterContentScripts(). This makes "granted the host" == "capture Meet", sidestepping
// the broken checkbox. (User still needs to reload the Meet tab once so the script injects.)
(function () {
  function reassert() {
    try {
      chrome.permissions.contains({ origins: ["https://meet.google.com/*"] }, (granted) => {
        const reReg = () => { try { if (typeof reRegisterContentScripts === "function") reRegisterContentScripts(); } catch (_) {} };
        if (granted) chrome.storage.sync.set({ wantGoogleMeet: true }, reReg); else reReg();
      });
    } catch (_) {}
  }
  if (chrome.runtime && chrome.runtime.onStartup) chrome.runtime.onStartup.addListener(reassert);
  setTimeout(reassert, 3000);   // current background load: background.js (hence reRegisterContentScripts) is defined by now
})();
