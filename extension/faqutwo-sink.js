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

// Reliability fix (Firefox): upstream only (re)registers its content scripts on permissions.onAdded
// and onInstalled — but Firefox doesn't reliably fire onAdded for about:addons permission toggles, and
// there's no onStartup handler, so after granting host access + a restart the Meet/Zoom/Teams content
// script can fail to register and nothing gets captured. Re-assert registration for already-granted
// hosts whenever the background loads (startup / event-page wake) and on browser startup.
// reRegisterContentScripts() lives in background.js (loaded right after this via importScripts) and is
// idempotent — it skips hosts whose script is already registered.
(function () {
  function reassert() { try { if (typeof reRegisterContentScripts === "function") reRegisterContentScripts(); } catch (_) {} }
  if (chrome.runtime && chrome.runtime.onStartup) chrome.runtime.onStartup.addListener(reassert);
  setTimeout(reassert, 3000);   // current background load: background.js (hence reRegisterContentScripts) is defined by now
})();
