import { KeywordDetector } from '@/utils/keywords';
import { UserCache } from '@/utils/cache';
import { FilterSettings } from '@/types';

export class ContentFilter {
  private detector: KeywordDetector;
  private userCache: UserCache;
  private settings: FilterSettings;
  
  constructor() {
    this.detector = new KeywordDetector();
    this.userCache = new UserCache();
    this.settings = {
      enabled: true,
      filterMode: 'blur',
      strictness: 'moderate',
      whitelist: [],
      keywords: []
    };
  }
  
  updateSettings(settings: FilterSettings) {
    this.settings = settings;
    settings.keywords.forEach(keyword => {
      this.detector.addCustomKeyword(keyword);
    });
  }
  
  processTweet(tweet: HTMLElement) {
    // Skip if already processed and not manually unblurred
    if (tweet.hasAttribute('data-cf-processed') && !tweet.hasAttribute('data-cf-manually-unblurred')) {
      return;
    }
    
    // Check if this is a re-process after navigation (thread view)
    const wasManuallyUnblurred = tweet.hasAttribute('data-cf-manually-unblurred');
    
    tweet.setAttribute('data-cf-processed', 'true');
    
    // If it was manually unblurred, remove that flag so it gets filtered again
    if (wasManuallyUnblurred) {
      tweet.removeAttribute('data-cf-manually-unblurred');
    }
    
    const username = this.extractUsername(tweet);
    const tweetText = this.extractTweetText(tweet);
    const bioText = this.extractBioText(tweet);
    
    if (username && this.settings.whitelist.includes(username)) {
      return;
    }
    
    if (username) {
      const cached = this.userCache.get(username);
      if (cached) {
        if (cached.isFiltered) {
          this.applyFilter(tweet, cached.reason);
        }
        return;
      }
    }
    
    // Check username first
    if (username) {
      const usernameResult = this.detector.detectUsername(username);
      if (usernameResult.shouldFilter) {
        this.applyFilter(tweet, usernameResult.reason || 'NSFW username');
        this.userCache.set(username, {
          username,
          isFiltered: true,
          reason: usernameResult.reason || 'NSFW username',
          checkedAt: Date.now()
        });
        return;
      }
    }
    
    // Check tweet content and bio
    const textToCheck = `${tweetText} ${bioText}`.trim();
    const result = this.detector.detect(textToCheck);
    
    // Debug logging (remove in production)
    if (tweetText || bioText || username) {
      console.log('CleanFeed checking:', {
        username,
        tweetText: tweetText.substring(0, 100),
        bioText: bioText.substring(0, 50),
        shouldFilter: result.shouldFilter,
        reason: result.reason
      });
    }
    
    if (result.shouldFilter) {
      this.applyFilter(tweet, result.reason || 'Filtered content');
      
      if (username) {
        this.userCache.set(username, {
          username,
          isFiltered: true,
          reason: result.reason || 'Filtered content',
          checkedAt: Date.now()
        });
      }
    } else if (username) {
      this.userCache.set(username, {
        username,
        isFiltered: false,
        reason: '',
        checkedAt: Date.now()
      });
    }
  }
  
  private extractUsername(tweet: HTMLElement): string | null {
    const userLink = tweet.querySelector('a[href^="/"][role="link"] span');
    if (userLink && userLink.textContent) {
      return userLink.textContent.replace('@', '');
    }
    
    const timeLink = tweet.querySelector('time')?.closest('a');
    if (timeLink) {
      const href = timeLink.getAttribute('href');
      if (href) {
        const match = href.match(/^\/([^\/]+)\//);
        if (match) return match[1];
      }
    }
    
    return null;
  }
  
  private extractTweetText(tweet: HTMLElement): string {
    const textElement = tweet.querySelector('[data-testid="tweetText"]');
    return textElement?.textContent || '';
  }
  
  private extractBioText(tweet: HTMLElement): string {
    // Try multiple selectors for bio text
    const selectors = [
      '[data-testid="UserDescription"]',
      '[data-testid="userDescription"]', 
      '.css-1dbjc4n [dir="ltr"]', // Sometimes bio is in a dir=ltr div
      '.r-37j5jr', // Twitter's bio class
      '.ProfileHeaderCard-bio', // Legacy selector
    ];
    
    for (const selector of selectors) {
      const bioElement = tweet.querySelector(selector);
      if (bioElement?.textContent?.trim()) {
        return bioElement.textContent;
      }
    }
    
    // Also check nearby elements that might contain user info
    const userInfoElements = tweet.querySelectorAll('span, div');
    for (const element of userInfoElements) {
      const text = element.textContent?.toLowerCase() || '';
      // Look for common OF bio patterns
      if (text.includes('linktree') || text.includes('allmylinks') || 
          text.includes('linktr.ee') || text.includes('onlyfans.com') ||
          text.includes('fansly.com')) {
        return element.textContent || '';
      }
    }
    
    return '';
  }
  
  private applyFilter(tweet: HTMLElement, reason: string) {
    if (this.settings.filterMode === 'remove') {
      this.hideTweet(tweet);
    } else {
      this.blurTweet(tweet, reason);
    }
  }
  
  private blurTweet(tweet: HTMLElement, reason: string) {
    if (tweet.hasAttribute('data-cf-filtered')) return;
    
    tweet.setAttribute('data-cf-filtered', 'true');
    tweet.classList.add('cf-blurred');
    tweet.classList.add(`cf-${this.settings.strictness}`);
    
    // Check if this is a small element (likely a comment/reply)
    const rect = tweet.getBoundingClientRect();
    const isCompact = rect.height < 150 || rect.width < 400;
    
    const overlay = document.createElement('div');
    overlay.className = 'cf-overlay';
    if (isCompact) {
      overlay.classList.add('cf-compact');
    }
    
    // Different layouts for compact vs regular
    if (isCompact) {
      overlay.innerHTML = `
        <div class="cf-overlay-content">
          <div class="cf-warning-icon">⚠️</div>
          <div class="cf-warning-text">Filtered</div>
          <button class="cf-unblur-btn">Show</button>
        </div>
      `;
    } else {
      overlay.innerHTML = `
        <div class="cf-overlay-content">
          <div class="cf-warning-icon">⚠️</div>
          <div class="cf-warning-text">Content filtered</div>
          <div class="cf-reason">${reason}</div>
          <button class="cf-unblur-btn">Show Content</button>
        </div>
      `;
    }
    
    overlay.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('cf-unblur-btn')) {
        this.unblurTweet(tweet);
      }
    });
    
    tweet.style.position = 'relative';
    tweet.appendChild(overlay);
  }
  
  private unblurTweet(tweet: HTMLElement) {
    // Mark as manually unblurred
    tweet.setAttribute('data-cf-manually-unblurred', 'true');
    
    // Remove blur and overlay
    tweet.classList.remove('cf-blurred');
    const overlay = tweet.querySelector('.cf-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    // Set up observer to re-blur if user navigates away and back
    this.setupReblurObserver(tweet);
  }
  
  private setupReblurObserver(tweet: HTMLElement) {
    // Use a timeout to detect when user might have navigated to thread view
    let navigationTimeout: NodeJS.Timeout;
    
    const checkForReblur = () => {
      // If the tweet is no longer visible (user navigated away)
      if (!tweet.isConnected || tweet.offsetParent === null) {
        navigationTimeout = setTimeout(() => {
          // When it becomes visible again, re-apply filter
          if (tweet.isConnected && tweet.offsetParent !== null) {
            tweet.removeAttribute('data-cf-manually-unblurred');
            tweet.removeAttribute('data-cf-processed');
            this.processTweet(tweet);
          }
        }, 1000);
      } else {
        clearTimeout(navigationTimeout);
      }
    };
    
    // Check periodically for visibility changes
    const observer = new MutationObserver(checkForReblur);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Clean up after 30 seconds
    setTimeout(() => {
      observer.disconnect();
    }, 30000);
  }
  
  private hideTweet(tweet: HTMLElement) {
    const container = tweet.closest('[data-testid="cellInnerDiv"]') || tweet;
    container.setAttribute('data-cf-hidden', 'true');
    (container as HTMLElement).style.display = 'none';
  }
  
  removeAllFilters() {
    document.querySelectorAll('.cf-blurred').forEach(element => {
      element.classList.remove('cf-blurred');
    });
    
    document.querySelectorAll('.cf-overlay').forEach(element => {
      element.remove();
    });
    
    document.querySelectorAll('[data-cf-hidden="true"]').forEach(element => {
      (element as HTMLElement).style.display = '';
      element.removeAttribute('data-cf-hidden');
    });
    
    document.querySelectorAll('[data-cf-filtered]').forEach(element => {
      element.removeAttribute('data-cf-filtered');
    });
  }
}