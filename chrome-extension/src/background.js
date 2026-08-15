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
