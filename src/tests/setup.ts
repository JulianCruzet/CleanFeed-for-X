// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn((_keys, callback) => {
        if (typeof callback === 'function') {
          callback({ settings: { enabled: true } });
        }
      }),
      set: jest.fn((_items, callback) => {
        if (typeof callback === 'function') {
          callback();
        }
      })
    },
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn()
    }
  }
} as any;

// Mock performance.now for timing tests
global.performance = {
  now: jest.fn(() => Date.now())
} as any;