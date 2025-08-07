import { KeywordDetector } from '@/utils/keywords';

describe('KeywordDetector', () => {
  let detector: KeywordDetector;

  beforeEach(() => {
    detector = new KeywordDetector();
  });

  describe('Basic keyword matching', () => {
    it('should detect "OnlyFans" case-insensitively', () => {
      expect(detector.detect('Check out my OnlyFans').shouldFilter).toBe(true);
      expect(detector.detect('check out my onlyfans').shouldFilter).toBe(true);
      expect(detector.detect('ONLYFANS link in bio').shouldFilter).toBe(true);
      expect(detector.detect('My OnlyFans is free today').shouldFilter).toBe(true);
    });

    it('should detect "OF" (uppercase) as whole word only', () => {
      expect(detector.detect('OF link in bio').shouldFilter).toBe(true);
      expect(detector.detect('Link to my OF').shouldFilter).toBe(true);
      expect(detector.detect('Check my OF!').shouldFilter).toBe(true);
      expect(detector.detect('My O.F is free').shouldFilter).toBe(true);
      expect(detector.detect('O F link').shouldFilter).toBe(true);
    });

    it('should NOT match lowercase "of" (normal English word)', () => {
      expect(detector.detect('Thinking of you').shouldFilter).toBe(false);
      expect(detector.detect('Kind of funny').shouldFilter).toBe(false);
      expect(detector.detect('Best of luck').shouldFilter).toBe(false);
      expect(detector.detect('One of my favorites').shouldFilter).toBe(false);
      expect(detector.detect('of course!').shouldFilter).toBe(false);
    });

    it('should not match OF in other words', () => {
      expect(detector.detect('OFFER expires soon').shouldFilter).toBe(false);
      expect(detector.detect('OFFICIAL account').shouldFilter).toBe(false);
      expect(detector.detect('PROFESSOR Smith').shouldFilter).toBe(false);
    });

    it('should detect common promotional phrases', () => {
      expect(detector.detect('link in bio').shouldFilter).toBe(true);
      expect(detector.detect('Links in bio for more').shouldFilter).toBe(true);
      expect(detector.detect('Check my bio for links').shouldFilter).toBe(true);
      expect(detector.detect('Exclusive content available').shouldFilter).toBe(true);
      expect(detector.detect('Premium content here').shouldFilter).toBe(true);
    });

    it('should detect payment-related keywords', () => {
      expect(detector.detect('CashApp me').shouldFilter).toBe(true);
      expect(detector.detect('Venmo in bio').shouldFilter).toBe(true);
      expect(detector.detect('DM for prices').shouldFilter).toBe(true);
      expect(detector.detect('Selling content').shouldFilter).toBe(true);
      expect(detector.detect('Custom content available').shouldFilter).toBe(true);
    });

    it('should detect leak-related content', () => {
      expect(detector.detect('New leaked photos').shouldFilter).toBe(true);
      expect(detector.detect('Check out this leak').shouldFilter).toBe(true);
      expect(detector.detect('All her leaks here').shouldFilter).toBe(true);
      expect(detector.detect('Latest leaks available').shouldFilter).toBe(true);
    });

    it('should return false for clean content', () => {
      expect(detector.detect('Just enjoying my day').shouldFilter).toBe(false);
      expect(detector.detect('Great weather today').shouldFilter).toBe(false);
      expect(detector.detect('Love this song').shouldFilter).toBe(false);
      expect(detector.detect('').shouldFilter).toBe(false);
    });
  });

  describe('Confidence scores', () => {
    it('should return high confidence for direct keyword matches', () => {
      const result = detector.detect('Check out my OnlyFans');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should return slightly lower confidence for OF abbreviation', () => {
      const result = detector.detect('My OF is free');
      expect(result.confidence).toBeLessThan(0.9);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should return zero confidence for clean content', () => {
      const result = detector.detect('Normal tweet content');
      expect(result.confidence).toBe(0);
    });
  });

  describe('Custom keywords', () => {
    it('should add and detect custom keywords', () => {
      detector.addCustomKeyword('TestKeyword');
      expect(detector.detect('This has testkeyword in it').shouldFilter).toBe(true);
      expect(detector.detect('TESTKEYWORD here').shouldFilter).toBe(true);
    });

    it('should remove custom keywords', () => {
      detector.addCustomKeyword('CustomWord');
      expect(detector.detect('Has customword').shouldFilter).toBe(true);
      
      detector.removeCustomKeyword('CustomWord');
      expect(detector.detect('Has customword').shouldFilter).toBe(false);
    });

    it('should return list of keywords', () => {
      const keywords = detector.getKeywords();
      expect(keywords).toContain('onlyfans');
      expect(keywords).toContain('link in bio');
      expect(Array.isArray(keywords)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should process text under 1ms', () => {
      const longText = 'Lorem ipsum dolor sit amet, '.repeat(100);
      const start = performance.now();
      detector.detect(longText);
      const duration = performance.now() - start;
      
      // Allow up to 5ms in test environment
      expect(duration).toBeLessThan(5);
    });

    it('should handle multiple detections efficiently', () => {
      const texts = [
        'Check out my OnlyFans',
        'Normal content here',
        'Link in bio',
        'Just a regular tweet',
        'Premium content available'
      ];
      
      const start = performance.now();
      texts.forEach(text => detector.detect(text));
      const duration = performance.now() - start;
      
      // Should process 5 texts in under 5ms total
      expect(duration).toBeLessThan(5);
    });
  });

  describe('Username detection', () => {
    it('should detect NSFW usernames', () => {
      expect(detector.detectUsername('sexygirl123').shouldFilter).toBe(true);
      expect(detector.detectUsername('xxxmodel').shouldFilter).toBe(true);
      expect(detector.detectUsername('naughtybabe').shouldFilter).toBe(true);
      expect(detector.detectUsername('daddy_dom').shouldFilter).toBe(true);
      expect(detector.detectUsername('18girlhot').shouldFilter).toBe(true);
      expect(detector.detectUsername('onlyfansgirl').shouldFilter).toBe(true);
    });

    it('should detect suspicious OF patterns', () => {
      expect(detector.detectUsername('ofgirl123').shouldFilter).toBe(true);
      expect(detector.detectUsername('mybabe_of').shouldFilter).toBe(true);
      expect(detector.detectUsername('model_of_dreams').shouldFilter).toBe(true);
    });

    it('should not flag normal usernames', () => {
      expect(detector.detectUsername('john_doe').shouldFilter).toBe(false);
      expect(detector.detectUsername('tech_enthusiast').shouldFilter).toBe(false);
      expect(detector.detectUsername('coffee_lover').shouldFilter).toBe(false);
      expect(detector.detectUsername('musician_official').shouldFilter).toBe(false);
    });

    it('should handle edge cases in usernames', () => {
      expect(detector.detectUsername('').shouldFilter).toBe(false);
      expect(detector.detectUsername('a').shouldFilter).toBe(false);
      expect(detector.detectUsername('professional').shouldFilter).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle null and undefined gracefully', () => {
      expect(detector.detect(null as any).shouldFilter).toBe(false);
      expect(detector.detect(undefined as any).shouldFilter).toBe(false);
    });

    it('should handle special characters', () => {
      expect(detector.detect('OnlyFans! 🔥').shouldFilter).toBe(true);
      expect(detector.detect('My OF 💦').shouldFilter).toBe(true);
      expect(detector.detect('link👏in👏bio').shouldFilter).toBe(false); // Broken by emojis
    });

    it('should handle mixed case and spacing', () => {
      expect(detector.detect('oNlYfAnS').shouldFilter).toBe(true);
      // Note: Spaced out letters won't match as it's not a continuous word
      expect(detector.detect('ONLYFANS account').shouldFilter).toBe(true);
      expect(detector.detect('   link   in   bio   ').shouldFilter).toBe(true);
    });
  });
});