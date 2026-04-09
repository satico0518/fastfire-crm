/** @type {import('jest').Config.InitialOptions } */

module.exports = {
  // Provide the path to your app files
  roots: ['<rootDir>/src'],
  
  // Module file extensions for modules that your tests should be able to import without specifying a file extension
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  
  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // An array of regexp pattern strings that are matched against all source file paths before transformation
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$'
  ],
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['text', 'lcov', 'html'],
  
  // The threshold for code coverage
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Collect coverage from files that match these glob patterns
  collectCoverageFrom: [
    'src/**/*.(js|jsx|ts|tsx)',
    '!src/**/*.d.ts',
    '!src/**/*.stories.(js|jsx|ts|tsx)',
    '!src/**/__tests__/**',
    '!src/**/*.test.(js|jsx|ts|tsx)',
    '!src/**/*.spec.(js|jsx|ts|tsx)'
  ],
  
  // Module name mapper for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Extensions to treat as ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Clear mocks
  clearMocks: true,
  
  // Reset mocks
  resetMocks: true,
  
  // Verbose output
  verbose: true
};
