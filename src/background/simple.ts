// Ultra-simple background script for debugging
console.log('CleanFeed background script loaded');

// Just handle the bare minimum
chrome.runtime.onInstalled.addListener(() => {
  console.log('CleanFeed installed');
  
  // Set default settings
  chrome.storage.local.set({
    settings: {
      enabled: true,
      filterMode: 'blur',
      strictness: 'moderate',
      whitelist: [],
      keywords: []
    }
  });
});

// Keep service worker alive
self.addEventListener('activate', () => {
  console.log('Service worker activated');
});

// Don't handle any messages for now to avoid errors
console.log('Background script ready');