// src/tests/Component/RichTextEditor.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RichTextEditor from '../../components/RichTextEditor';

beforeAll(() => {
  document.execCommand = jest.fn();
  document.queryCommandState = jest.fn(() => false);
});

describe('RichTextEditor Component', () => {
  // TEST 11: RichTextEditor renders and handles text input
  test('should render editor with toolbar and accept text input', () => {
    const mockOnChange = jest.fn();
    
    render(
      <RichTextEditor 
        value="" 
        onChange={mockOnChange} 
        placeholder="Start writing..."
      />
    );

    // Check toolbar buttons are present
    expect(screen.getByTitle(/bold/i)).toBeInTheDocument();
    expect(screen.getByTitle(/italic/i)).toBeInTheDocument();
    expect(screen.getByTitle(/bullet list/i)).toBeInTheDocument();

    // Get the contenteditable div - it has a data-placeholder attribute
    const editorContainer = document.querySelector('[contentEditable="true"]');
    expect(editorContainer).toBeInTheDocument();
    
    // Simulate typing
    fireEvent.input(editorContainer, { target: { innerHTML: '<p>Test content</p>' } });

    // onChange should be called
    expect(mockOnChange).toHaveBeenCalledWith('<p>Test content</p>');
  });

  test('should format text when toolbar buttons are clicked', () => {
    const mockOnChange = jest.fn();
    
    render(
      <RichTextEditor 
        value="<p>Some text</p>" 
        onChange={mockOnChange}
      />
    );

    // Click bold button
    const boldButton = screen.getByTitle(/bold/i);
    fireEvent.click(boldButton);

    expect(document.execCommand).toHaveBeenCalledWith('bold', false, null);
  });
});