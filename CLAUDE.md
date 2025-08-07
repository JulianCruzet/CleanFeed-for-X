# CleanFeed for X - Development Guide

## Project Overview
CleanFeed for X is a Chrome extension that filters NSFW content and OnlyFans promotional posts on Twitter/X. It uses a multi-layer detection system with real-time filtering capabilities.

## Architecture

### Detection Layers
1. **Text-based keyword detection** (<1ms)
   - Case-insensitive matching
   - Specific terms: "OnlyFans", "OF", "link in bio", etc.
   - No partial word matching to avoid false positives

2. **Profile characteristic analysis** (~10ms)
   - Account age detection
   - Follower pattern analysis
   - Username pattern recognition

3. **Bio analysis with caching** (~100-200ms first time, cached for 24h)
   - Link detection for OnlyFans/Linktree URLs
   - Suspicious URL patterns

4. **Link following** (500ms-2s, heavily cached)
   - Check destination of shortened URLs
   - Verify external links

### Performance Requirements
- Real-time filtering during infinite scroll
- Use IntersectionObserver for visible content only
- 24-hour cache for user classifications
- Web Workers for heavy processing
- No noticeable lag on Twitter browsing

## Tech Stack
- TypeScript for type safety
- Webpack for bundling
- Chrome Extension Manifest V3
- Chrome Storage API for preferences
- Jest for testing

## Key Features

### Core Functionality
- **Blur Mode**: Default behavior, shows blurred content with unblur button
- **Remove Mode**: Optional setting to completely remove filtered content
- **Whitelist System**: Allow specific accounts through filters
- **Settings Panel**: User preferences and filter sensitivity

### Filtering Rules
- Case-insensitive keyword matching
- Whole word matching (not partial)
- Special handling for abbreviations like "OF"
- Bio link analysis
- Profile pattern detection

## Development Commands
```bash
npm run dev     # Development build with watch
npm run build   # Production build
npm run test    # Run test suite
npm run lint    # Lint code
npm run typecheck # TypeScript type checking
```

## Testing Strategy
- Unit tests for keyword detection engine
- Integration tests for DOM manipulation
- Mock Twitter DOM for testing
- Performance benchmarks for each detection layer

## File Structure
```
/src
  /content      - Content scripts for Twitter pages
  /background   - Service worker for extension logic
  /popup        - Extension popup UI
  /utils        - Shared utilities and helpers
  /types        - TypeScript type definitions
  /tests        - Test files
/public
  /images       - Extension icons
/dist           - Built files (gitignored)
```

## Important Considerations

### Twitter/X DOM
- Twitter uses React with dynamic content loading
- Article tags contain tweets
- Data attributes often contain user information
- Infinite scroll requires MutationObserver
- Profile links follow pattern: /username

### Performance Optimization
- Use IntersectionObserver for viewport detection
- Cache user classifications for 24 hours
- Debounce scroll events
- Process only visible content
- Use Web Workers for heavy computations

### User Experience
- Prioritize accuracy over speed (with balance)
- Blur content by default, allow unblur
- Minimal visual disruption
- Quick settings access
- Clear feedback on filtered content

## Chrome Extension Best Practices
- Use Manifest V3 requirements
- Minimize permissions requested
- Handle content script injection carefully
- Respect user privacy
- Efficient storage usage

## Future Enhancements (Post-MVP)
- Machine learning detection (TensorFlow.js)
- Community database
- Analytics dashboard
- Custom filtering rules
- Export/import settings