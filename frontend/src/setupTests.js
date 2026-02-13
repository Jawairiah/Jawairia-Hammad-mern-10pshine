// src/setupTests.js
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  // Clear the localStorage store
  localStorageMock.clear();
  
  // Reset all mock function call history but keep the mock implementations
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  
  // Reset fetch mock
  fetch.mockClear();
});