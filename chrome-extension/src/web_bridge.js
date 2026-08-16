// web_bridge.js — StrapyATS Bridge between Next.js Web Dashboard & Chrome Extension
// Allows 1-click automated postulation triggers from StrapyATS into LinkedIn Easy Apply

(function () {
  // Notify web app that extension is active
  window.postMessage({ type: 'STRAPYATS_EXTENSION_INSTALLED', version: '1.1.0' }, '*');
  window.__STRAPYATS_EXTENSION_ACTIVE__ = true;

  // Listen for auto-apply triggers from StrapyATS dashboard
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'STRAPYATS_TRIGGER_AUTO_APPLY') {
      const payload = event.data.payload;
      
      chrome.storage.local.set({
        strapyats_auto_apply: {
          ...payload,
          status: 'pending',
          timestamp: Date.now()
        }
      }, () => {
        chrome.runtime.sendMessage({
          action: 'OPEN_AND_APPLY_JOB',
          url: payload.targetUrl
        });
      });
    }
  });
})();
