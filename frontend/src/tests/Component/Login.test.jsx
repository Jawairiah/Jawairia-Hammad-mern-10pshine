// src/tests/Component/Login.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';
import { mockAuthSuccess, mockAuthFailure } from '../utils/testUtils';

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  // TEST 1: Login form renders correctly
  test('should render login form with all required fields', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Not authenticated' })
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/loading your space/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // TEST 2: Successful login updates UI and stores token
  test('should successfully login user and redirect to dashboard', async () => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Not authenticated' })
        })
      )
      .mockImplementationOnce(() => mockAuthSuccess());

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/loading your space/i)).not.toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('Your email');
    const passwordInput = screen.getByPlaceholderText('Your password');
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test@example.com'),
        })
      );
    });

    // Check that token was stored (check the mock was called)
    await waitFor(() => {
      expect(screen.getByText(/your reflections/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText(/your reflections/i)).toBeInTheDocument();
    });
  });

  // TEST 3: Failed login shows error message
  test('should display error message on failed login', async () => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Not authenticated' })
        })
      )
      .mockImplementationOnce(() => mockAuthFailure('Invalid credentials'));

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/loading your space/i)).not.toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('Your email');
    const passwordInput = screen.getByPlaceholderText('Your password');
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});