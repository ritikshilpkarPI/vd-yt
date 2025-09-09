// Test setup configuration

// Set test environment
process.env.NODE_ENV = 'test';
process.env.ALLOW_ALL = 'false';
process.env.LOG_LEVEL = 'silent';

// Mock yt-dlp for tests
jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

// Increase test timeout for integration tests
jest.setTimeout(10000);
