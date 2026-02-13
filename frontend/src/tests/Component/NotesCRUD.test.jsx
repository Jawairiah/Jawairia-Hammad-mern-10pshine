// src/tests/Component/NotesCRUD.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotesContainer from '../../components/NotesContainer';
import { mockNotes, mockApiResponse } from '../utils/testUtils';

beforeAll(() => {
  document.execCommand = jest.fn();
  document.queryCommandState = jest.fn(() => false);
});

describe('Notes CRUD Operations', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'mock-token');
    fetch.mockClear();
  });

  // TEST 9: Creating a new note
  test('should create a new note successfully', async () => {
    const newNote = {
      id: 4,
      title: 'New Test Note',
      content: '<p>New note content</p>',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => mockApiResponse({ notes: mockNotes }))
      .mockImplementationOnce(() => mockApiResponse({ note: newNote }));

    render(<NotesContainer />);

    await waitFor(() => {
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });

    const newNoteButton = screen.getByRole('button', { name: /new note/i });
    fireEvent.click(newNoteButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/note title/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText(/note title/i);
    fireEvent.change(titleInput, { target: { value: 'New Test Note' } });

    const contentEditor = document.querySelector('[contentEditable="true"]');
    fireEvent.input(contentEditor, { target: { innerHTML: '<p>New note content</p>' } });

    const saveButton = screen.getAllByRole('button', { name: /save/i })[0];
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notes'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New Test Note'),
        })
      );
    });
  });

  // TEST 10: Deleting a note
  test('should delete a note when confirmed', async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => mockApiResponse({ notes: mockNotes }))
      .mockImplementationOnce(() => mockApiResponse({ message: 'Note deleted' }));

    render(<NotesContainer />);

    await waitFor(() => {
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/delete this note/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /delete forever/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notes/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});