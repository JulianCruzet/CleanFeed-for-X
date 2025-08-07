# CleanFeed for X

A Chrome extension that filters NSFW content and OnlyFans promotional posts on X (Twitter).

## Features

- 🔍 **Smart Keyword Detection**: Filters posts containing OnlyFans, promotional content, and configurable keywords
- 👁️ **Blur or Remove**: Choose between blurring content (with option to reveal) or completely removing it
- ⚡ **Real-time Filtering**: Works seamlessly with Twitter's infinite scroll
- ⚙️ **Customizable Settings**: Adjust filter strictness and add custom keywords
- 📊 **Statistics Tracking**: Monitor how much content is being filtered
- 💾 **Smart Caching**: 24-hour cache for improved performance

## Installation

### Development Build

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cleanfeed-for-x.git
   cd cleanfeed-for-x
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```
   For development with auto-rebuild:
   ```bash
   npm run dev
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

5. **Test the extension**
   - Navigate to https://twitter.com or https://x.com
   - The extension icon should appear in your toolbar
   - Click the icon to access settings

## Usage

### Settings

- **Enable/Disable**: Toggle the extension on/off
- **Filter Mode**: 
  - Blur: Hides content with an overlay, click to reveal
  - Remove: Completely removes content from feed
- **Strictness**:
  - Relaxed: Only obvious promotional content
  - Moderate: Balanced filtering (recommended)
  - Strict: Aggressive filtering
- **Custom Keywords**: Add your own keywords to filter

### Default Filtered Content

- "OnlyFans" mentions (case-insensitive)
- "OF" as a standalone word
- "Link in bio" and similar phrases
- Payment platform mentions (CashApp, Venmo)
- "Premium/Exclusive content" offers
- "DM for prices" and selling indicators

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
1. Make sure you're on twitter.com or x.com
2. Check that the extension is enabled (toggle in popup)
3. Reload the Twitter page
4. Check Chrome console for any errors

### Filters not catching content?
1. Try increasing strictness level
2. Add custom keywords for specific content
3. Clear cache and reload

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Disclaimer

This extension is not affiliated with Twitter/X or OnlyFans. It's a personal productivity tool for content filtering.