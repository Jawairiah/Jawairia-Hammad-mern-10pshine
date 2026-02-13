// src/__tests__/utils/testUtils.js
import React from 'react';
import { render } from '@testing-library/react';

// Custom render function that can be extended with providers if needed
export const renderWithProviders = (ui, options = {}) => {
  return render(ui, { ...options });
};

// Mock user data
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
};

// Mock note data
export const mockNote = {
  id: 1,
  title: 'Test Note',
  content: '<p>This is a test note content</p>',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T00:00:00.000Z',
};

export const mockNotes = [
  mockNote,
  {
    id: 2,
    title: 'Another Note',
    content: '<p>Another test note</p>',
    created_at: '2024-01-03T00:00:00.000Z',
    updated_at: '2024-01-03T00:00:00.000Z',
  },
  {
    id: 3,
    title: 'Third Note',
    content: '<p>Third note with more content that should be longer</p>',
    created_at: '2024-01-04T00:00:00.000Z',
    updated_at: '2024-01-04T00:00:00.000Z',
  },
];

// Mock API responses
export const mockApiResponse = (data, ok = true) => {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
};

// Mock successful authentication
export const mockAuthSuccess = () => {
  return mockApiResponse({
    token: 'mock-jwt-token',
    user: mockUser,
  });
};

// Mock failed authentication
export const mockAuthFailure = (message = 'Authentication failed') => {
  return mockApiResponse(
    { message },
    false
  );
};

// Wait for async updates
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));