import { ContentFilter } from './filter';
import { FilterSettings } from '@/types';
import './styles.css';

class ExtensionController {
  private filter: ContentFilter;
  private observer: MutationObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private settings: FilterSettings = {
    enabled: true,
    filterMode: 'blur',
    strictness: 'moderate',
    whitelist: [],
    keywords: []
  };
  
  constructor() {
    this.filter = new ContentFilter();
    this.init();
  }
  
  private async init() {
    await this.loadSettings();
    
    if (this.settings.enabled) {
      this.startObserving();
      this.processExistingContent();
    }
    
    this.listenForSettingsChanges();
    this.listenForMessages();
  }
  
  private async loadSettings() {
    return new Promise<void>((resolve) => {
      chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
          this.settings = { ...this.settings, ...result.settings };
          this.filter.updateSettings(this.settings);
        }
        resolve();
      });
    });
  }
  
  private listenForSettingsChanges() {
    chrome.storage.onChanged.addListener((changes, _namespace) => {
      if (changes.settings) {
        this.settings = { ...this.settings, ...changes.settings.newValue };
        this.filter.updateSettings(this.settings);
        
        if (this.settings.enabled && !this.observer) {
          this.startObserving();
          this.processExistingContent();
        } else if (!this.settings.enabled && this.observer) {
          this.stopObserving();
          this.filter.removeAllFilters();
        }
      }
    });
  }
  
  private startObserving() {
    this.setupIntersectionObserver();
    
    this.observer = new MutationObserver((mutations) => {
      requestAnimationFrame(() => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                this.processNewContent(node);
              }
            });
          }
        }
      });
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  private setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const tweet = entry.target as HTMLElement;
          this.filter.processTweet(tweet);
        }
      });
    }, {
      rootMargin: '100px'
    });
  }
  
  private processNewContent(element: HTMLElement) {
    const tweets = this.findTweets(element);
    tweets.forEach(tweet => {
      // Always reprocess if we're in a thread view or if element was manually unblurred
      const isThreadView = window.location.pathname.includes('/status/');
      const wasUnblurred = tweet.hasAttribute('data-cf-manually-unblurred');
      
      if (!tweet.hasAttribute('data-cf-observed') || isThreadView || wasUnblurred) {
        tweet.setAttribute('data-cf-observed', 'true');
        
        // Reset processing state for thread view or manually unblurred content
        if (isThreadView || wasUnblurred) {
          tweet.removeAttribute('data-cf-processed');
          tweet.removeAttribute('data-cf-manually-unblurred');
        }
        
        this.intersectionObserver?.observe(tweet);
      }
    });
  }
  
  private processExistingContent() {
    const tweets = this.findTweets(document.body);
    tweets.forEach(tweet => {
      if (!tweet.hasAttribute('data-cf-observed')) {
        tweet.setAttribute('data-cf-observed', 'true');
        this.intersectionObserver?.observe(tweet);
      }
    });
  }
  
  private findTweets(container: HTMLElement): HTMLElement[] {
    const tweets: HTMLElement[] = [];
    
    // Find all articles - this includes tweets, replies, and comments
    const articles = container.querySelectorAll('article');
    articles.forEach(article => {
      // Check if it has tweet-like structure (contains tweet text or is a tweet/reply)
      const hasTweetText = article.querySelector('[data-testid="tweetText"]');
      const isReply = article.querySelector('[data-testid="reply"]');
      const isTweet = article.getAttribute('data-testid') === 'tweet';
      
      // Include all articles that look like tweets or replies
      if (hasTweetText || isReply || isTweet) {
        tweets.push(article as HTMLElement);
      }
    });
    
    // Also check if the container itself is a tweet/reply
    if (container.matches('article')) {
      const hasTweetText = container.querySelector('[data-testid="tweetText"]');
      if (hasTweetText && !tweets.includes(container)) {
        tweets.push(container);
      }
    }
    
    // Check cells that might contain tweets/replies
    const cells = container.querySelectorAll('[data-testid="cellInnerDiv"]');
    cells.forEach(cell => {
      const article = cell.querySelector('article');
      if (article && !tweets.includes(article as HTMLElement)) {
        const hasTweetText = article.querySelector('[data-testid="tweetText"]');
        if (hasTweetText) {
          tweets.push(article as HTMLElement);
        }
      }
    });
    
    return tweets;
  }
  
  private listenForMessages() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      switch (message.type) {
        case 'SETTINGS_CHANGED':
          this.settings = { ...this.settings, ...message.settings };
          this.filter.updateSettings(this.settings);
          
          if (this.settings.enabled && !this.observer) {
            this.startObserving();
            this.processExistingContent();
          } else if (!this.settings.enabled && this.observer) {
            this.stopObserving();
            this.filter.removeAllFilters();
          } else if (this.settings.enabled && this.observer) {
            // Re-process all visible content with new settings
            this.processExistingContent();
          }
          
          sendResponse({ success: true });
          break;
          
        case 'CLEAR_CACHE':
          // Handle cache clearing if needed
          sendResponse({ success: true });
          break;
      }
      
      return true; // Keep message channel open
    });
  }
  
  private stopObserving() {
    this.observer?.disconnect();
    this.observer = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ExtensionController();
  });
} else {
  new ExtensionController();
}