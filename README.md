<!-- ───────────────────────────────────────────────────────────────────────────
qutwo-internal FORK. Upstream: https://github.com/vivek-nexus/transcriptonic

Our only change is a live sink: `extension/faqutwo-sink.js` debounce-POSTs the rolling
transcript to the local faqutwo bridge (default http://127.0.0.1:8765/transcript) so the
in-page AI has it as live context during a call — upstream only webhooks at meeting end.
It's loaded by a single `importScripts("faqutwo-sink.js")` line at the top of background.js;
manifest.json adds 127.0.0.1:8765 to host_permissions. Nothing else upstream is touched.

Install: chrome://extensions → Developer mode → Load unpacked → pick the `extension/` dir.
Then turn on Meet captions; with the faqutwo bridge running, the transcript flows in live.
Override the endpoint with `chrome.storage.sync.set({faqutwoUrl: "..."})` if needed.

Sync upstream:  git fetch upstream && git merge upstream/main   (our delta is additive, so
this is normally clean; hand-resolve only if upstream rewrites the very top of background.js).
──────────────────────────────────────────────────────────────────────────── -->

# TranscripTonic
Simple Google Meet transcripts. Private and open source. 
> Teams and Zoom transcripts in beta. <a href="https://github.com/vivek-nexus/transcriptonic/wiki/Zoom-and-Teams-beta-testing" target="_blank">Learn
          more</a>.

![marquee-large](/assets/marquee-large.png)

Extension status: 🟢 OPERATIONAL (v3.3.5)

<br />
<br />



# Demo
View video on [YouTube](https://www.youtube.com/watch?v=ARL6HbkakX4)

![demo](/assets/demo.gif)


<br />
<br />


# Installation
<a href="https://chromewebstore.google.com/detail/ciepnfnceimjehngolkijpnbappkkiag" target="_blank">
    <img src="https://developer.chrome.com/static/docs/webstore/branding/image/iNEddTyWiMfLSwFD6qGq.png" />
</a>

<br />
<br />

# How to use TranscripTonic
![screenshot-2](/assets/screenshot-2.png)
TranscripTonic has two modes of operation.

**In both modes, transcript will be downloaded as a text file at the end of each meeting.**

- **Auto mode:** Automatically records transcripts for all meetings
- **Manual mode:** Switch on TranscripTonic by clicking on captions icon in Google Meet (CC icon)


<br />
<br />

# Integrating TranscripTonic with other tools using webhooks
You can integrate TranscripTonic with any tool that accepts data from a webhook. Refer the "Set up webhooks" page in the extension for details about the webhook body.
- [Google Docs integration guide](https://github.com/vivek-nexus/transcriptonic/wiki/Google-Docs-integration-guide?utm_source=readme)
- [n8n integration guide](https://github.com/vivek-nexus/transcriptonic/wiki/n8n-integration-guide?utm_source=readme)

<br />
<br />

# FAQs

**1. Can I change the language of the transcript?**

Yes. TranscripTonic picks up the output of Google Meet captions. Google Meet captions supports variety of languages that you can choose from. Click the settings icon when captions start showing and change the language.

**2. I did not get any transcript at the end of the meeting.**

This could happen when:
1. New errors caused by Google Meet updates
2. Any unexpected events like network drop, browser crashes etc.

When this happens, it might be possible to recover the transcript, but recovery should be done before starting another meeting.
- Open the extension and click on "last 10 meetings". Click on "Recover last meeting" button present after the table.
- TranscripTonic will also attempt to auto-recover any missed transcripts, just before a new meeting starts.

<br />
<br />

# Privacy policy
TranscripTonic Chrome extension does not collect any information from users in any manner, except anonymous errors and transcript download timestamp. All processing/transcript storage happens within the user's Chrome browser and does not leave the device, unless you configure a webhook and choose to post data to your webhook URL.

<br />
<br />

# Notice
The transcript may not always be accurate and is only intended to aid in improving productivity. It is the responsibility of the user to ensure they comply with any applicable laws/rules.

<br />
<br />
