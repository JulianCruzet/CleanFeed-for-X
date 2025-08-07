import './popup.css';
import { FilterSettings } from '@/types';

class PopupController {
  private settings: FilterSettings = {
    enabled: true,
    filterMode: 'blur',
    strictness: 'moderate',
    whitelist: [],
    keywords: []
  };
  
  constructor() {
    this.init();
  }
  
  private async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
    
    // Wait a bit before trying to communicate with background script
    setTimeout(() => {
      this.loadStats();
    }, 100);
  }
  
  private async loadSettings() {
    return new Promise<void>((resolve) => {
      if (chrome.runtime.lastError) {
        console.log('Chrome runtime error:', chrome.runtime.lastError);
        resolve();
        return;
      }
      
      chrome.storage.local.get(['settings'], (result) => {
        if (chrome.runtime.lastError) {
          console.log('Storage error:', chrome.runtime.lastError);
          resolve();
          return;
        }
        
        if (result.settings) {
          this.settings = { ...this.settings, ...result.settings };
        }
        resolve();
      });
    });
  }
  
  private setupEventListeners() {
    const enableToggle = document.getElementById('enableToggle') as HTMLInputElement;
    enableToggle.addEventListener('change', (e) => {
      this.settings.enabled = (e.target as HTMLInputElement).checked;
      this.saveSettings();
    });
    
    const filterModeSelect = document.getElementById('filterModeSelect') as HTMLSelectElement;
    filterModeSelect.addEventListener('change', (e) => {
      this.settings.filterMode = (e.target as HTMLSelectElement).value as 'blur' | 'remove';
      this.saveSettings();
    });
    
    document.getElementById('clearCacheBtn')?.addEventListener('click', () => {
      try {
        if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
          console.log('Chrome runtime not available');
          return;
        }
        
        chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' }, (_response) => {
          if (chrome.runtime.lastError) {
            console.log('Clear cache error:', chrome.runtime.lastError.message);
          } else {
            this.loadStats();
          }
        });
      } catch (error) {
        console.log('Clear cache button error:', error);
      }
    });
  }
  
  private updateUI() {
    const enableToggle = document.getElementById('enableToggle') as HTMLInputElement;
    enableToggle.checked = this.settings.enabled;
    
    const filterModeSelect = document.getElementById('filterModeSelect') as HTMLSelectElement;
    if (filterModeSelect) {
      filterModeSelect.value = this.settings.filterMode;
    }
  }
  
  
  private async saveSettings() {
    chrome.storage.local.set({ settings: this.settings }, () => {
      if (chrome.runtime.lastError) {
        console.log('Save settings error:', chrome.runtime.lastError);
      }
    });
  }
  
  private loadStats() {
    try {
      // Check if chrome.runtime is available
      if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        this.setDefaultStats();
        return;
      }
      
      chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Stats error:', chrome.runtime.lastError.message);
          this.setDefaultStats();
          return;
        }
        
        if (response) {
          const quickStatsText = document.getElementById('quickStatsText');
          if (quickStatsText) {
            const count = response.filteredToday || 0;
            quickStatsText.textContent = `${count} filtered`;
          }
        } else {
          this.setDefaultStats();
        }
      });
    } catch (error) {
      console.log('Stats loading error:', error);
      this.setDefaultStats();
    }
  }
  
  private setDefaultStats() {
    const quickStatsText = document.getElementById('quickStatsText');
    if (quickStatsText) {
      quickStatsText.textContent = '0 filtered';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    new PopupController();
  } catch (error) {
    console.log('Popup initialization error:', error);
    // Set basic fallback UI
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #666;">
        <h3>CleanFeed for X</h3>
        <p>Extension loading...</p>
        <small>Please reload the extension if this persists</small>
      </div>
    `;
  }
});