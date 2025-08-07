import { DetectionResult } from '@/types';

export class KeywordDetector {
  private keywords: Set<string>;
  private wholeWordPatterns: RegExp[];
  
  constructor() {
    this.keywords = new Set([
      'onlyfans',
      'fansly',
      'link in bio',
      'links in bio',
      'check my bio',
      'exclusive content',
      'premium content',
      'paid content',
      'ppv',
      'pay per view',
      'tip menu',
      'cashapp',
      'venmo',
      'dm for prices',
      'custom content',
      'seller',
      'selling content',
      // Link services commonly used by OF accounts
      'linktree',
      'linktr.ee',
      'allmylinks',
      'beacons.ai',
      'onlyfans.com',
      'fansly.com',
      // Common OF bio phrases
      'top 1%',
      'top 5%',
      'top 10%',
      'college girl',
      'barely legal',
      'barely 18',
      'just turned 18',
      'subscribe for more',
      'sub for more',
      'unlock content',
      'see more content',
      'full video',
      'explicit content',
      'naughty content',
      'dirty content',
      // Leak-related content
      'leaked',
      'leak',
      'leaks',
      // Telegram and messaging links
      't.me/',
      'telegram.me/',
      'telegram',
      // Common username patterns
      'sexyy',
      'xxxgirl',
      'hotgirl',
      'naughty',
      'slutty',
      'daddy',
      'babygirl',
      'kitten',
      'princess',
      'goddess'
    ]);
    
    this.wholeWordPatterns = [
      /\bOF\b/,  // Case-sensitive - only uppercase OF
      /\bO\.F\b/i,  // O.F can be any case
      /\bO\s+F\b/i  // O F with any spacing, any case
    ];
  }
  
  detect(text: string): DetectionResult {
    if (!text) {
      return { shouldFilter: false, confidence: 0 };
    }
    
    const lowerText = text.toLowerCase();
    // Normalize multiple spaces to single space for better matching
    const normalizedText = lowerText.replace(/\s+/g, ' ').trim();
    
    for (const keyword of this.keywords) {
      if (normalizedText.includes(keyword)) {
        return {
          shouldFilter: true,
          reason: `Contains keyword: ${keyword}`,
          confidence: 0.9
        };
      }
    }
    
    for (const pattern of this.wholeWordPatterns) {
      if (pattern.test(text)) {
        console.log('CleanFeed OF Pattern Match:', {
          pattern: pattern.toString(),
          text: text,
          match: pattern.exec(text)
        });
        return {
          shouldFilter: true,
          reason: 'Contains OF abbreviation',
          confidence: 0.85
        };
      }
    }
    
    return { shouldFilter: false, confidence: 0 };
  }
  
  detectUsername(username: string): DetectionResult {
    if (!username) {
      return { shouldFilter: false, confidence: 0 };
    }
    
    const lowerUsername = username.toLowerCase();
    
    // Check for NSFW patterns in username
    const nsfwUsernamePatterns = [
      /xxx/i,
      /sex/i,
      /porn/i,
      /nude/i,
      /naked/i,
      /onlyfans/i,
      /slutty/i,
      /naughty/i,
      /daddy/i,
      /babygirl/i,
      /kitten/i,
      /princess/i,
      /goddess/i,
      /hotgirl/i,
      /sexyy/i,
      /\d+(girl|babe|slut)/i, // Numbers + girl/babe/slut
      /(18|19|20)(girl|babe)/i, // Age + girl/babe
      /cum/i,
      /ass/i,
      /tits/i,
      /boobs/i
    ];
    
    for (const pattern of nsfwUsernamePatterns) {
      if (pattern.test(lowerUsername)) {
        return {
          shouldFilter: true,
          reason: `NSFW username pattern: ${username}`,
          confidence: 0.95
        };
      }
    }
    
    // Check for OnlyFans-style naming patterns
    if (lowerUsername.includes('of') && (
        lowerUsername.includes('girl') || 
        lowerUsername.includes('babe') || 
        lowerUsername.includes('model')
      )) {
      return {
        shouldFilter: true,
        reason: `Suspicious username pattern: ${username}`,
        confidence: 0.8
      };
    }
    
    return { shouldFilter: false, confidence: 0 };
  }
  
  addCustomKeyword(keyword: string) {
    this.keywords.add(keyword.toLowerCase());
  }
  
  removeCustomKeyword(keyword: string) {
    this.keywords.delete(keyword.toLowerCase());
  }
  
  getKeywords(): string[] {
    return Array.from(this.keywords);
  }
}