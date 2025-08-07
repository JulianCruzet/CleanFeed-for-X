import { FilterSettings } from '@/types';

class BackgroundService {
  private stats = {
    filteredToday: 0,
    cachedUsers: 0,
    lastReset: new Date().toDateString()
  };
  
  constructor() {
    this.init();
  }
  
  private async init() {
    // Keep service worker alive
    self.addEventListener('install', () => {
      console.log('CleanFeed background service installed');
    });
    
    self.addEventListener('activate', () => {
      console.log('CleanFeed background service activated');
    });
    
    await this.loadStats();
    this.setupMessageListeners();
    this.setupAlarms();
    this.initializeSettings();
  }
  
  private async initializeSettings() {
    chrome.storage.local.get(['settings'], (result) => {
      if (!result.settings) {
        const defaultSettings: FilterSettings = {
          enabled: true,
          filterMode: 'blur',
          strictness: 'moderate',
          whitelist: [],
          keywords: []
        };
        chrome.storage.local.set({ settings: defaultSettings });
      }
    });
  }
  
  private async loadStats() {
    return new Promise<void>((resolve) => {
      chrome.storage.local.get(['stats'], (result) => {
        if (result.stats) {
          this.stats = { ...this.stats, ...result.stats };
          
          const today = new Date().toDateString();
          if (this.stats.lastReset !== today) {
            this.stats.filteredToday = 0;
            this.stats.lastReset = today;
            this.saveStats();
          }
        }
        resolve();
      });
    });
  }
  
  private saveStats() {
    chrome.storage.local.set({ stats: this.stats });
  }
  
  private setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      // Important: Return true to indicate we'll send a response asynchronously
      // This keeps the message channel open
      
      switch (request.type) {
        case 'GET_STATS':
          sendResponse(this.stats);
          break;
          
        case 'INCREMENT_FILTERED':
          this.stats.filteredToday++;
          this.saveStats();
          sendResponse({ success: true });
          break;
          
        case 'UPDATE_CACHED_USERS':
          this.stats.cachedUsers = request.count || 0;
          this.saveStats();
          sendResponse({ success: true });
          break;
          
        case 'CLEAR_CACHE':
          this.stats.cachedUsers = 0;
          this.saveStats();
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
              chrome.tabs.sendMessage(tabs[0].id, { type: 'CLEAR_CACHE' }, () => {
                // Ignore errors when sending to tabs
                if (chrome.runtime.lastError) {
                  console.log('Tab message error:', chrome.runtime.lastError);
                }
              });
            }
          });
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ error: 'Unknown message type' });
      }
      
      // Return true to keep the message channel open
      return true;
    });
  }
  
  private setupAlarms() {
    chrome.alarms.create('daily-reset', {
      when: this.getNextMidnight(),
      periodInMinutes: 24 * 60
    });
    
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'daily-reset') {
        this.stats.filteredToday = 0;
        this.stats.lastReset = new Date().toDateString();
        this.saveStats();
      }
    });
  }
  
  private getNextMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime();
  }
}

new BackgroundService();