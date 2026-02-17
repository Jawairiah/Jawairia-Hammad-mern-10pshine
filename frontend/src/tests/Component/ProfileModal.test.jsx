// src/__tests__/components/ProfileModal.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileModal from '../../components/ProfileModal';
import { mockUser, mockApiResponse } from '../Utils/testUtils';

describe('ProfileModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    localStorage.setItem('token', 'mock-token');
    fetch.mockClear();
    mockOnClose.mockClear();
    mockOnUpdate.mockClear();
  });

  // TEST 12: ProfileModal renders user information and allows profile updates
  test('should render profile modal with user information', () => {
    render(
      <ProfileModal 
        user={mockUser} 
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Check if user info is displayed
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    // Check tabs
    expect(screen.getByText(/profile details/i)).toBeInTheDocument();
    expect(screen.getByText(/change password/i)).toBeInTheDocument();
  });

  test('should update user profile successfully', async () => {
    const updatedUser = {
      ...mockUser,
      username: 'updateduser',
      email: 'updated@example.com',
    };

    global.fetch = jest.fn(() => 
      mockApiResponse({ user: updatedUser })
    );

    render(
      <ProfileModal 
        user={mockUser} 
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Update username
    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'updateduser' } });

    // Update email
    const emailInput = screen.getByDisplayValue('test@example.com');
    fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });

    // Click save button
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/profile'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('updateduser'),
        })
      );
    });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(updatedUser);
    });
  });

  test('should switch between profile and password tabs', () => {
    render(
      <ProfileModal 
        user={mockUser} 
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    // Initially on profile tab
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();

    // Click password tab
    const passwordTab = screen.getByText(/change password/i);
    fireEvent.click(passwordTab);

    // Should show password fields
    expect(screen.getByPlaceholderText(/enter current password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm new password/i)).toBeInTheDocument();
  });

  test('should close modal when close button is clicked', () => {
    render(
      <ProfileModal 
        user={mockUser} 
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' }); // X button has no text
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});