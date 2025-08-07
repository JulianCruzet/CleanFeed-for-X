// Simple popup that only uses storage API, no messaging
import './popup.css';
import { FilterSettings } from '@/types';

class SimplePopupController {
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
    try {
      // Load settings from storage only
      await this.loadSettings();
      this.setupEventListeners();
      this.updateUI();
    } catch (error) {
      console.log('Init error:', error);
    }
  }

  private async loadSettings() {
    return new Promise<void>((resolve) => {
      chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
          this.settings = { ...this.settings, ...result.settings };
        }
        resolve();
      });
    });
  }

  private setupEventListeners() {
    const enableToggle = document.getElementById('enableToggle') as HTMLInputElement;
    if (enableToggle) {
      enableToggle.addEventListener('change', (e) => {
        this.settings.enabled = (e.target as HTMLInputElement).checked;
        this.saveSettings();
      });
    }

    const filterModeSelect = document.getElementById('filterModeSelect') as HTMLSelectElement;
    if (filterModeSelect) {
      filterModeSelect.addEventListener('change', (e) => {
        this.settings.filterMode = (e.target as HTMLSelectElement).value as 'blur' | 'remove';
        this.saveSettings();
      });
    }

    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => {
        // Just clear the stats from storage
        chrome.storage.local.remove(['stats'], () => {
          const statsText = document.getElementById('quickStatsText');
          if (statsText) {
            statsText.textContent = '0 filtered';
          }
        });
      });
    }
  }

  private updateUI() {
    const enableToggle = document.getElementById('enableToggle') as HTMLInputElement;
    if (enableToggle) {
      enableToggle.checked = this.settings.enabled;
    }

    const filterModeSelect = document.getElementById('filterModeSelect') as HTMLSelectElement;
    if (filterModeSelect) {
      filterModeSelect.value = this.settings.filterMode;
    }

    // Load stats from storage directly
    chrome.storage.local.get(['stats'], (result) => {
      const statsText = document.getElementById('quickStatsText');
      if (statsText) {
        const count = result.stats?.filteredToday || 0;
        statsText.textContent = `${count} filtered`;
      }
    });
  }

  private saveSettings() {
    chrome.storage.local.set({ settings: this.settings });
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SimplePopupController();
  });
} else {
  new SimplePopupController();
}