// background.js — StrapyATS Chrome Extension Service Worker
// Powered by CierraLab (@realstrapy)

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';

chrome.runtime.onInstalled.addListener(() => {
  // Create Context Menu item
  chrome.contextMenus.create({
    id: 'strapyats_optimize_selection',
    title: '🎯 Optimizar oferta seleccionada con StrapyATS',
    contexts: ['selection']
  });

  // Set default settings if not already stored
  chrome.storage.local.get(['strapyats_app_url'], (result) => {
    if (!result.strapyats_app_url) {
      chrome.storage.local.set({ strapyats_app_url: DEFAULT_FRONTEND_URL });
    }
  });

  console.log('StrapyATS Extension successfully installed.');
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'strapyats_optimize_selection' && info.selectionText) {
    const selectedText = info.selectionText.trim();
    
    // Save to storage
    chrome.storage.local.get(['strapyats_app_url'], (res) => {
      const appUrl = res.strapyats_app_url || DEFAULT_FRONTEND_URL;
      
      chrome.storage.local.set({
        strapyats_extracted_job: {
          title: 'Texto Seleccionado',
          company: 'Oferta Laboral',
          fullText: selectedText,
          url: tab ? tab.url : '',
          timestamp: Date.now()
        }
      }, () => {
        // Open StrapyATS Web Dashboard
        chrome.tabs.create({ url: `${appUrl}?fromExtension=1` });
      });
    });
  }
});

// Handle messages from Web Bridge or Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'OPEN_AND_APPLY_JOB' && request.url) {
    chrome.tabs.query({}, (tabs) => {
      const existingTab = tabs.find(t => t.url && (t.url.includes(request.url) || request.url.includes(t.url)));
      if (existingTab && existingTab.id) {
        chrome.tabs.update(existingTab.id, { active: true }, (tab) => {
          chrome.windows.update(tab.windowId, { focused: true });
          chrome.tabs.sendMessage(existingTab.id, { action: 'TRIGGER_AUTO_APPLY' });
        });
      } else {
        chrome.tabs.create({ url: request.url, active: true }, (newTab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === newTab.id && info.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              setTimeout(() => {
                chrome.tabs.sendMessage(newTab.id, { action: 'TRIGGER_AUTO_APPLY' });
              }, 1000);
            }
          });
        });
      }
    });
    sendResponse({ success: true });
  }
  return true;
});

