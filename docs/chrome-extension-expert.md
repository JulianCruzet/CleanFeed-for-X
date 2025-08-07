# Chrome Extension Expert Guide

## Manifest V3 Compliance Checklist

### Required Permissions
- ✅ Use minimal permissions
- ✅ `storage` for user preferences
- ✅ `activeTab` for current tab access
- ✅ Host permissions only for twitter.com and x.com

### Service Worker Best Practices
- Use event-driven architecture
- No persistent background pages
- Implement proper event listeners
- Handle extension lifecycle events

### Content Script Guidelines
- Inject at `document_idle` for performance
- Use message passing for communication
- Avoid global namespace pollution
- Handle dynamic content injection

### Security Requirements
- Content Security Policy compliance
- No inline scripts in HTML
- No eval() or new Function()
- Sanitize all user inputs

## Performance Optimization

### Memory Management
- Remove event listeners when not needed
- Clear caches periodically
- Use chrome.storage efficiently
- Minimize DOM references

### Load Time Optimization
- Lazy load non-critical resources
- Use code splitting in webpack
- Minimize bundle sizes
- Defer non-essential initialization

## Chrome APIs Usage

### Storage API
```typescript
// Set data
chrome.storage.local.set({ key: value });

// Get data
chrome.storage.local.get(['key'], (result) => {
  console.log(result.key);
});

// Listen for changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  // Handle changes
});
```

### Message Passing
```typescript
// From content script to background
chrome.runtime.sendMessage({ type: 'ACTION' }, (response) => {
  // Handle response
});

// In background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Process message
  sendResponse({ success: true });
  return true; // For async response
});
```

## Testing in Chrome

### Local Development
1. Navigate to chrome://extensions/
2. Enable Developer mode
3. Click "Load unpacked"
4. Select extension directory

### Debugging
- Use Chrome DevTools for popup
- Inspect content scripts via page DevTools
- Check service worker in chrome://extensions/
- Monitor performance with Chrome Task Manager

## Common Pitfalls to Avoid
- Don't use document.write()
- Avoid synchronous XHR requests
- Don't rely on window object in service workers
- Handle edge cases for page navigation
- Test on both twitter.com and x.com domains