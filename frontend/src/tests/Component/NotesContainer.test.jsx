// src/__tests__/components/NotesContainer.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotesContainer from '../../components/NotesContainer';
import { mockNotes, mockApiResponse } from '../Utils/testUtils';

describe('NotesContainer Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'mock-token');
    fetch.mockClear();
  });

  // TEST 6: Fetches and displays notes on mount
  test('should fetch and display notes when component mounts', async () => {
    global.fetch = jest.fn(() => 
      mockApiResponse({ notes: mockNotes })
    );

    render(<NotesContainer />);

    // Initially shows loading
    expect(screen.getByText(/gathering your notes/i)).toBeInTheDocument();

    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('Test Note')).toBeInTheDocument();
      expect(screen.getByText('Another Note')).toBeInTheDocument();
      expect(screen.getByText('Third Note')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/notes'),
      expect.any(Object)
    );
  });

  // TEST 7: Search functionality filters notes correctly
  test('should filter notes based on search query', async () => {
    global.fetch = jest.fn(() => 
      mockApiResponse({ notes: mockNotes })
    );

    render(<NotesContainer />);

    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });

    // Get search input and type
    const searchInput = screen.getByPlaceholderText(/search through your notes/i);
    fireEvent.change(searchInput, { target: { value: 'Another' } });

    // Should show filtered result
    await waitFor(() => {
      expect(screen.getByText('Another Note')).toBeInTheDocument();
      expect(screen.queryByText('Test Note')).not.toBeInTheDocument();
    });

    // Should show search results count
    expect(screen.getByText(/found 1 note matching/i)).toBeInTheDocument();
  });

  // TEST 8: Shows empty state when no notes exist
  test('should display empty state when no notes are available', async () => {
    global.fetch = jest.fn(() => 
      mockApiResponse({ notes: [] })
    );

    render(<NotesContainer />);

    await waitFor(() => {
      expect(screen.getByText(/your forest awaits/i)).toBeInTheDocument();
      expect(screen.getByText(/start your journey by planting your first note/i)).toBeInTheDocument();
    });
  });
});