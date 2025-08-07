// Popup script - separated from HTML for CSP compliance
(function() {
  'use strict';
  
  // Don't run if chrome isn't available
  if (typeof chrome === 'undefined' || !chrome.storage) {
    console.log('Chrome API not available');
    return;
  }
  
  let settings = { enabled: true, filterMode: 'blur' };
  
  // Load settings
  try {
    chrome.storage.local.get(['settings'], function(result) {
      if (chrome.runtime.lastError) {
        console.log('Storage error:', chrome.runtime.lastError.message);
        return;
      }
      if (result.settings) {
        settings = result.settings;
        document.getElementById('enableToggle').checked = settings.enabled;
        document.getElementById('filterModeSelect').value = settings.filterMode;
      }
    });
  } catch (e) {
    console.log('Load error:', e);
  }
  
  // Save on change
  function save() {
    try {
      chrome.storage.local.set({ settings: settings }, function() {
        if (chrome.runtime.lastError) {
          console.log('Save error:', chrome.runtime.lastError.message);
        } else {
          // Notify active tabs about settings change
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]?.id) {
              chrome.tabs.sendMessage(tabs[0].id, {
                type: 'SETTINGS_CHANGED',
                settings: settings
              }, function() {
                // Ignore errors when sending to tabs
                if (chrome.runtime.lastError) {
                  console.log('Tab message ignored:', chrome.runtime.lastError);
                }
              });
            }
          });
        }
      });
    } catch (e) {
      console.log('Save error:', e);
    }
  }
  
  // Event listeners
  document.getElementById('enableToggle').addEventListener('change', function(e) {
    settings.enabled = e.target.checked;
    save();
  });
  
  document.getElementById('filterModeSelect').addEventListener('change', function(e) {
    settings.filterMode = e.target.value;
    save();
  });
  
  // Clear cache button
  document.getElementById('clearCacheBtn').addEventListener('click', function() {
    chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' }, function(response) {
      if (chrome.runtime.lastError) {
        console.log('Clear cache error:', chrome.runtime.lastError);
      } else {
        console.log('Cache cleared');
      }
    });
  });
})();