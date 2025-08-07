import { CacheEntry, UserClassification } from '@/types';

export class UserCache {
  private cache = new Map<string, CacheEntry<UserClassification>>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  set(username: string, classification: UserClassification) {
    this.cache.set(username, {
      data: classification,
      timestamp: Date.now()
    });
    
    this.cleanup();
  }
  
  get(username: string): UserClassification | null {
    const entry = this.cache.get(username);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(username);
      return null;
    }
    
    return entry.data;
  }
  
  has(username: string): boolean {
    const result = this.get(username);
    return result !== null;
  }
  
  clear() {
    this.cache.clear();
  }
  
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
    
    if (this.cache.size > 1000) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = sortedEntries.slice(0, 200);
      toDelete.forEach(([key]) => this.cache.delete(key));
    }
  }
  
  getStats() {
    return {
      size: this.cache.size,
      filtered: Array.from(this.cache.values()).filter(e => e.data.isFiltered).length
    };
  }
}