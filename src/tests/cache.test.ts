import { UserCache } from '@/utils/cache';
import { UserClassification } from '@/types';

describe('UserCache', () => {
  let cache: UserCache;
  let originalDateNow: () => number;
  let mockNow: number;

  beforeEach(() => {
    cache = new UserCache();
    mockNow = Date.now();
    originalDateNow = Date.now;
    Date.now = jest.fn(() => mockNow);
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  describe('Basic operations', () => {
    it('should store and retrieve user classification', () => {
      const classification: UserClassification = {
        username: 'testuser',
        isFiltered: true,
        reason: 'Contains keywords',
        checkedAt: mockNow
      };

      cache.set('testuser', classification);
      const retrieved = cache.get('testuser');
      
      expect(retrieved).toEqual(classification);
    });

    it('should return null for non-existent users', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should check if user exists', () => {
      const classification: UserClassification = {
        username: 'testuser',
        isFiltered: false,
        reason: '',
        checkedAt: mockNow
      };

      cache.set('testuser', classification);
      expect(cache.has('testuser')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should clear all cached data', () => {
      cache.set('user1', {
        username: 'user1',
        isFiltered: true,
        reason: 'test',
        checkedAt: mockNow
      });
      cache.set('user2', {
        username: 'user2',
        isFiltered: false,
        reason: '',
        checkedAt: mockNow
      });

      cache.clear();
      
      expect(cache.get('user1')).toBeNull();
      expect(cache.get('user2')).toBeNull();
    });
  });

  describe('TTL and expiration', () => {
    it('should expire entries after 24 hours', () => {
      const classification: UserClassification = {
        username: 'testuser',
        isFiltered: true,
        reason: 'test',
        checkedAt: mockNow
      };

      cache.set('testuser', classification);
      expect(cache.get('testuser')).toBeTruthy();

      // Fast forward 23 hours
      mockNow += 23 * 60 * 60 * 1000;
      expect(cache.get('testuser')).toBeTruthy();

      // Fast forward 2 more hours (25 total)
      mockNow += 2 * 60 * 60 * 1000;
      expect(cache.get('testuser')).toBeNull();
    });

    it('should clean up expired entries on set', () => {
      // Add old entry
      cache.set('olduser', {
        username: 'olduser',
        isFiltered: true,
        reason: 'old',
        checkedAt: mockNow
      });

      // Fast forward 25 hours
      mockNow += 25 * 60 * 60 * 1000;

      // Add new entry (should trigger cleanup)
      cache.set('newuser', {
        username: 'newuser',
        isFiltered: false,
        reason: '',
        checkedAt: mockNow
      });

      expect(cache.get('olduser')).toBeNull();
      expect(cache.get('newuser')).toBeTruthy();
    });
  });

  describe('Size management', () => {
    it('should limit cache size to prevent memory issues', () => {
      // Add 1200 entries
      for (let i = 0; i < 1200; i++) {
        cache.set(`user${i}`, {
          username: `user${i}`,
          isFiltered: i % 2 === 0,
          reason: 'test',
          checkedAt: mockNow + i // Stagger timestamps
        });
      }

      const stats = cache.getStats();
      // Should have removed oldest 200 entries
      expect(stats.size).toBeLessThanOrEqual(1000);
    });
  });

  describe('Statistics', () => {
    it('should return correct stats', () => {
      cache.set('filtered1', {
        username: 'filtered1',
        isFiltered: true,
        reason: 'keywords',
        checkedAt: mockNow
      });
      cache.set('filtered2', {
        username: 'filtered2',
        isFiltered: true,
        reason: 'links',
        checkedAt: mockNow
      });
      cache.set('clean1', {
        username: 'clean1',
        isFiltered: false,
        reason: '',
        checkedAt: mockNow
      });

      const stats = cache.getStats();
      expect(stats.size).toBe(3);
      expect(stats.filtered).toBe(2);
    });

    it('should handle empty cache stats', () => {
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.filtered).toBe(0);
    });
  });

  describe('Update behavior', () => {
    it('should update existing entries', () => {
      cache.set('testuser', {
        username: 'testuser',
        isFiltered: false,
        reason: '',
        checkedAt: mockNow
      });

      cache.set('testuser', {
        username: 'testuser',
        isFiltered: true,
        reason: 'Updated reason',
        checkedAt: mockNow + 1000
      });

      const retrieved = cache.get('testuser');
      expect(retrieved?.isFiltered).toBe(true);
      expect(retrieved?.reason).toBe('Updated reason');
    });
  });
});