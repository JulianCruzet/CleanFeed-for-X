# Performance Optimization Guide

## Performance Targets
- Text detection: <1ms
- Profile analysis: ~10ms  
- Bio analysis: ~100-200ms (first time), instant when cached
- Link following: 500ms-2s (heavily cached)
- Zero noticeable lag on Twitter scrolling

## Optimization Strategies

### 1. Efficient DOM Observation

#### Use IntersectionObserver
```typescript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Process only visible content
      processContent(entry.target);
    }
  });
}, {
  rootMargin: '100px' // Start processing slightly before visible
});
```

#### MutationObserver Best Practices
```typescript
const observer = new MutationObserver((mutations) => {
  // Batch mutations
  requestAnimationFrame(() => {
    processMutations(mutations);
  });
});

// Observe with specific config
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false // Only if needed
});
```

### 2. Caching Strategy

#### User Classification Cache
```typescript
class UserCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours

  set(username: string, classification: Classification) {
    this.cache.set(username, {
      data: classification,
      timestamp: Date.now()
    });
  }

  get(username: string): Classification | null {
    const entry = this.cache.get(username);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(username);
      return null;
    }
    
    return entry.data;
  }
}
```

### 3. Debouncing & Throttling

#### Scroll Event Handling
```typescript
function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Use: throttle(handleScroll, 100)
```

### 4. Web Workers for Heavy Processing

#### Worker Setup
```typescript
// worker.ts
self.addEventListener('message', (e) => {
  const { type, data } = e.data;
  
  switch(type) {
    case 'ANALYZE_BIO':
      const result = analyzeBio(data);
      self.postMessage({ type: 'BIO_RESULT', result });
      break;
  }
});

// main.ts
const worker = new Worker('worker.js');
worker.postMessage({ type: 'ANALYZE_BIO', data: bioText });
```

### 5. Memory Management

#### DOM Reference Cleanup
```typescript
class ContentProcessor {
  private observers: IntersectionObserver[] = [];
  
  cleanup() {
    this.observers.forEach(obs => obs.disconnect());
    this.observers = [];
  }
}
```

## Performance Monitoring

### Metrics to Track
```typescript
class PerformanceMonitor {
  private metrics = {
    keywordDetection: [],
    profileAnalysis: [],
    bioAnalysis: [],
    totalProcessing: []
  };

  measure(operation: string, func: Function) {
    const start = performance.now();
    const result = func();
    const duration = performance.now() - start;
    
    this.metrics[operation].push(duration);
    
    if (duration > this.getThreshold(operation)) {
      console.warn(`Slow ${operation}: ${duration}ms`);
    }
    
    return result;
  }
}
```

## Bundle Size Optimization

### Webpack Configuration
- Use tree shaking
- Code splitting for popup vs content script
- Minimize CSS
- Use production mode for final build

### Lazy Loading
```typescript
// Load heavy features only when needed
async function loadAdvancedFilters() {
  const module = await import('./advancedFilters');
  return module.default;
}
```

## Testing Performance

### Benchmarks
```typescript
function benchmark(name: string, func: Function, iterations = 1000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    func();
  }
  const avgTime = (performance.now() - start) / iterations;
  console.log(`${name}: ${avgTime.toFixed(3)}ms average`);
}
```

### Load Testing
- Test with 100+ tweets visible
- Test rapid scrolling
- Test with slow network (Chrome DevTools throttling)
- Monitor memory usage over time