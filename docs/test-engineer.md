# Test Engineering Guide

## Test-Driven Development Approach

### Test Pyramid
1. **Unit Tests** (70%) - Fast, isolated component tests
2. **Integration Tests** (20%) - Component interaction tests  
3. **E2E Tests** (10%) - Full extension flow tests

## Test Setup

### Jest Configuration
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Test Patterns

### 1. Keyword Detection Tests
```typescript
describe('KeywordDetector', () => {
  let detector: KeywordDetector;
  
  beforeEach(() => {
    detector = new KeywordDetector();
  });

  describe('Basic keyword matching', () => {
    it('should detect "OnlyFans" case-insensitively', () => {
      expect(detector.detect('Check out my OnlyFans')).toBe(true);
      expect(detector.detect('check out my onlyfans')).toBe(true);
      expect(detector.detect('ONLYFANS link in bio')).toBe(true);
    });

    it('should detect "OF" as whole word only', () => {
      expect(detector.detect('OF link in bio')).toBe(true);
      expect(detector.detect('Link to my OF')).toBe(true);
      expect(detector.detect('OFFER expires soon')).toBe(false);
      expect(detector.detect('OFFICIAL account')).toBe(false);
    });

    it('should not match partial words', () => {
      expect(detector.detect('OnlyFanstic content')).toBe(false);
      expect(detector.detect('MyOnlyFans')).toBe(true); // This should match
    });
  });

  describe('Performance', () => {
    it('should process text under 1ms', () => {
      const text = 'Lorem ipsum dolor sit amet...'; // Long text
      const start = performance.now();
      detector.detect(text);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1);
    });
  });
});
```

### 2. DOM Manipulation Tests
```typescript
describe('ContentFilter', () => {
  let filter: ContentFilter;
  let mockTweet: HTMLElement;

  beforeEach(() => {
    filter = new ContentFilter();
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div>Check out my OnlyFans!</div>
      </article>
    `;
    mockTweet = document.querySelector('article')!;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should blur filtered content', () => {
    filter.processTweet(mockTweet);
    expect(mockTweet.classList.contains('cf-blurred')).toBe(true);
  });

  it('should add unblur button', () => {
    filter.processTweet(mockTweet);
    const button = mockTweet.querySelector('.cf-unblur-btn');
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe('Show Content');
  });

  it('should unblur on button click', () => {
    filter.processTweet(mockTweet);
    const button = mockTweet.querySelector('.cf-unblur-btn') as HTMLElement;
    button.click();
    expect(mockTweet.classList.contains('cf-blurred')).toBe(false);
  });
});
```

### 3. Mock Twitter DOM
```typescript
export function createMockTweet(content: string, username = 'testuser'): HTMLElement {
  const tweet = document.createElement('article');
  tweet.setAttribute('data-testid', 'tweet');
  tweet.innerHTML = `
    <div>
      <div>
        <a href="/${username}">@${username}</a>
      </div>
      <div>${content}</div>
    </div>
  `;
  return tweet;
}

export function createMockTimeline(tweets: string[]): HTMLElement {
  const timeline = document.createElement('div');
  timeline.setAttribute('data-testid', 'primaryColumn');
  
  tweets.forEach(content => {
    timeline.appendChild(createMockTweet(content));
  });
  
  return timeline;
}
```

### 4. Chrome API Mocks
```typescript
// tests/setup.ts
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({ filterEnabled: true });
      }),
      set: jest.fn((items, callback) => {
        callback?.();
      })
    },
    onChanged: {
      addListener: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  }
} as any;
```

### 5. Integration Tests
```typescript
describe('Extension Integration', () => {
  it('should filter timeline on load', async () => {
    document.body.appendChild(
      createMockTimeline([
        'Normal tweet',
        'Check out my OnlyFans',
        'Another normal tweet'
      ])
    );

    const extension = new ExtensionController();
    await extension.initialize();

    const tweets = document.querySelectorAll('article');
    expect(tweets[0].classList.contains('cf-blurred')).toBe(false);
    expect(tweets[1].classList.contains('cf-blurred')).toBe(true);
    expect(tweets[2].classList.contains('cf-blurred')).toBe(false);
  });
});
```

## Testing Checklist

### Before Each Feature
- [ ] Write failing tests first
- [ ] Tests cover happy path
- [ ] Tests cover edge cases
- [ ] Tests cover error conditions
- [ ] Performance benchmarks included

### Test Quality
- [ ] Tests are isolated (no dependencies between tests)
- [ ] Tests are deterministic (same result every run)
- [ ] Tests are fast (<100ms for unit tests)
- [ ] Tests have clear descriptions
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)

### Coverage Requirements
- [ ] Line coverage > 80%
- [ ] Branch coverage > 80%
- [ ] Function coverage > 80%
- [ ] Critical paths have 100% coverage

## Continuous Testing
```bash
# Run tests in watch mode during development
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test KeywordDetector

# Run tests matching pattern
npm test -- --testNamePattern="should blur"
```