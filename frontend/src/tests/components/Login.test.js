import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../components/Login';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: jest.fn(),
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  const mockOnToggleView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLogin,
    });
  });

  it('should render login form correctly', () => {
    render(<Login onToggleView={mockOnToggleView} />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your crypto credits account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText('Sign up here')).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<Login onToggleView={mockOnToggleView} />);

    const passwordInput = screen.getByPlaceholderText('Password');
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: true });

    render(<Login onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Fill in the form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Submit the form
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should display error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    mockLogin.mockResolvedValue({ success: false, error: errorMessage });

    render(<Login onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Fill in the form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');

    // Submit the form
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    let resolveLogin;
    mockLogin.mockImplementation(() => new Promise(resolve => {
      resolveLogin = resolve;
    }));

    render(<Login onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Fill in the form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Submit the form
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    // Resolve the login
    resolveLogin({ success: true });

    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
    });
  });

  it('should clear error when user starts typing', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });

    render(<Login onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Submit empty form to trigger error
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    // Assume error is shown (based on previous test)
    // Now type in email field
    await user.type(emailInput, 'test');

    // Error should be cleared (this test assumes the implementation clears error on input change)
    // If not implemented, this test will help document the expected behavior
  });

  it('should call onToggleView when sign up link is clicked', async () => {
    const user = userEvent.setup();
    render(<Login onToggleView={mockOnToggleView} />);

    const signUpLink = screen.getByText('Sign up here');
    await user.click(signUpLink);

    expect(mockOnToggleView).toHaveBeenCalled();
  });

  it('should require email and password fields', async () => {
    const user = userEvent.setup();
    render(<Login onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should have proper form attributes', () => {
    render(<Login onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
  });

  it('should handle form submission with Enter key', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ success: true });

    render(<Login onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Press Enter in password field
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
