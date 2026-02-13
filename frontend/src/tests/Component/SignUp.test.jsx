// src/tests/Component/SignUp.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';
import { mockAuthSuccess } from '../utils/testUtils';

describe('SignUp Component', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  // TEST 4: SignUp form renders with all fields
  test('should render signup form with username, email, and password fields', async () => {
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

    const createAccountLink = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(createAccountLink);

    expect(screen.getByText('Begin Your Journey')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Choose a username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  // TEST 5: Successful signup creates account and logs in user
  test('should successfully create account and redirect to dashboard', async () => {
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

    const createAccountLink = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(createAccountLink);

    const usernameInput = screen.getByPlaceholderText('Choose a username');
    const emailInput = screen.getByPlaceholderText('Your email');
    const passwordInput = screen.getByPlaceholderText('Create a password');
    const signupButton = screen.getAllByRole('button', { name: /create account/i })[0];

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('newuser'),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/your reflections/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});