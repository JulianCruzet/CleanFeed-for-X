# CleanFeed for X

A Chrome extension that filters NSFW content and OnlyFans promotional posts on X (Twitter) to give you a cleaner, more professional browsing experience.

## Features

- 🛡️ **Comprehensive Filtering**: Removes OnlyFans promotions, NSFW usernames, Telegram links, and leak-related content
- 👁️ **Two Filter Modes**: Choose between blurring content (with unblur option) or completely removing it
- ⚡ **Real-time Processing**: Works seamlessly with Twitter's infinite scroll - filters tweets, replies, and comments
- 🎯 **Smart Detection**: Case-sensitive "OF" filtering, username analysis, bio text scanning
- 📊 **Daily Stats**: Track how much content is filtered each day
- 💾 **Performance Optimized**: 24-hour caching system, <1ms keyword detection
- 🔒 **Privacy-First**: All processing happens locally on your device - no data collection

## Installation

### Option 1: Chrome Web Store (Recommended)
*Coming soon - extension is under review*

### Option 2: Install from Source

**Prerequisites:**
- Node.js 16+ and npm installed
- Chrome browser
- Basic command line knowledge

**Step-by-step installation:**

1. **Download the code**
   ```bash
   git clone <this-repository-url>
   cd TwitterBlocker
   ```
   *Or download as ZIP and extract*

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```
   This creates a `dist` folder with all extension files.

4. **Load into Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Turn on **"Developer mode"** (toggle in top-right corner)
   - Click **"Load unpacked"** 
   - Select the `dist` folder from this project
   - The extension icon should appear in your toolbar

5. **Verify it's working**
   - Go to https://twitter.com or https://x.com
   - Look for inappropriate content being blurred/removed
   - Click the extension icon to open settings

## How to Use

### Basic Controls
1. **Click the extension icon** in your Chrome toolbar to open settings
2. **Toggle On/Off**: Master switch to enable/disable all filtering
3. **Choose Filter Mode**:
   - 🌫️ **Blur**: Hides content with overlay, click "Show Post" to reveal
   - 🗑️ **Remove**: Completely removes filtered content from your feed
4. **Clear Cache**: Reset user classifications (if someone's content isn't filtering properly)

### What Gets Filtered

**OnlyFans & Adult Content:**
- "OnlyFans" mentions
- "OF" in all caps (but not lowercase "of")
- "O.F" and "O F" variations
- Adult/NSFW usernames (e.g., "sexygirl123", "xxxmodel")

**Promotional Spam:**
- "Link in bio", "Link in comments"  
- "DM for prices", "Selling content"
- "Premium content", "Exclusive content"
- Payment requests (CashApp, Venmo, PayPal)

**Suspicious Content:**
- Telegram channel links
- "Leaked", "leak", "leaks" related posts
- Suspicious URL patterns

### Content Types Filtered
- ✅ **Main tweets** in timeline
- ✅ **Replies** to tweets  
- ✅ **Comments** in threads
- ✅ **Quote tweets** with filtered content

## Development

### Project Structure
```
/src
  /content      - Content scripts for Twitter pages
  /background   - Service worker for extension logic
  /popup        - Extension popup UI
  /utils        - Shared utilities (keyword detection, caching)
  /types        - TypeScript type definitions
  /tests        - Test files
/public
  /images       - Extension icons
/dist           - Built extension (generated)
```

### Commands

```bash
npm run dev        # Development build with watch
npm run build      # Production build
npm run test       # Run tests
npm run lint       # Lint code
npm run typecheck  # TypeScript type checking
```

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## Performance

- Text detection: <1ms
- Profile analysis: ~10ms
- Bio analysis: ~100-200ms (cached for 24h)
- Zero noticeable lag during scrolling

## Privacy

- No data is sent to external servers
- All filtering happens locally in your browser
- User preferences stored in Chrome's local storage
- Cache automatically clears after 24 hours

## Troubleshooting

### Extension not working?
1. **Check the website**: Only works on twitter.com and x.com
2. **Verify it's enabled**: Click extension icon, make sure toggle is ON
3. **Reload the page**: Refresh Twitter/X after enabling
4. **Developer mode**: Make sure "Developer mode" is still enabled in chrome://extensions/

### Content not being filtered?
1. **Wait a moment**: Some content is processed as you scroll
2. **Clear cache**: Click "Clear Cache" button in extension popup
3. **Check filter mode**: Make sure you're not in "Remove" mode if you want to see blurred content
4. **Manual reporting**: Some content may slip through - this is normal for AI-resistant posts

### Extension disappeared?
1. **Check extensions page**: Go to chrome://extensions/ and make sure it's still enabled
2. **Reload extension**: Toggle it off and on
3. **Rebuild**: Run `npm run build` and reload the unpacked extension

### Performance issues?
The extension is optimized for speed, but if you notice lag:
1. **Clear cache** in the extension popup
2. **Restart Chrome** 
3. **Check other extensions** that might conflict

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Disclaimer

This extension is not affiliated with Twitter/X or OnlyFans. It's a personal productivity tool for content filtering.