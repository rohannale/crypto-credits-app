import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../../components/Register';
import { useAuth } from '../../contexts/AuthContext';

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Register Component', () => {
  const mockRegister = jest.fn();
  const mockOnToggleView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      register: mockRegister,
    });
  });

  it('should render registration form correctly', () => {
    render(<Register onToggleView={mockOnToggleView} />);

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText('Join the crypto credits platform')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password (min. 6 characters)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText('Sign in here')).toBeInTheDocument();
  });

  it('should toggle password visibility for both fields', async () => {
    const user = userEvent.setup();
    render(<Register onToggleView={mockOnToggleView} />);

    const passwordInput = screen.getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i });

    // Initially passwords should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Toggle first password field
    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle second password field
    await user.click(toggleButtons[1]);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('should handle successful registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ success: true });

    render(<Register onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Fill in the form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    // Submit the form
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show success screen after successful registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({ success: true });

    render(<Register onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Fill in the form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    // Submit the form
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Registration Successful!')).toBeInTheDocument();
      expect(screen.getByText('You will be redirected to the login page shortly.')).toBeInTheDocument();
    });

    // Should call onToggleView after 2 seconds (may need to use fake timers for this)
  });

  it('should display error message on registration failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email already exists';
    mockRegister.mockResolvedValue({ success: false, error: errorMessage });

    render(<Register onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Fill in the form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    // Submit the form
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should validate password length', async () => {
    const user = userEvent.setup();
    render(<Register onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Fill in the form with short password
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');
    await user.type(confirmPasswordInput, '123');

    // Submit the form
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
    });

    // Register should not be called
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should validate password confirmation', async () => {
    const user = userEvent.setup();
    render(<Register onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Fill in the form with mismatched passwords
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');

    // Submit the form
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    // Register should not be called
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should show loading state during registration', async () => {
    const user = userEvent.setup();
    let resolveRegister;
    mockRegister.mockImplementation(() => new Promise(resolve => {
      resolveRegister = resolve;
    }));

    render(<Register onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Fill in the form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    // Submit the form
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Creating account...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    // Resolve the registration
    resolveRegister({ success: true });

    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
    });
  });

  it('should call onToggleView when sign in link is clicked', async () => {
    const user = userEvent.setup();
    render(<Register onToggleView={mockOnToggleView} />);

    const signInLink = screen.getByText('Sign in here');
    await user.click(signInLink);

    expect(mockOnToggleView).toHaveBeenCalled();
  });

  it('should clear error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<Register onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Create a validation error first
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');
    await user.type(confirmPasswordInput, '123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
    });

    // Type in email field - should clear error
    await user.type(emailInput, 'a');

    // The error should be cleared (this tests the onChange behavior)
    await waitFor(() => {
      expect(screen.queryByText('Password must be at least 6 characters long')).not.toBeInTheDocument();
    });
  });

  it('should have proper form attributes', () => {
    render(<Register onToggleView={mockOnToggleView} />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password (min. 6 characters)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(emailInput).toBeRequired();

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
    expect(passwordInput).toBeRequired();

    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
    expect(confirmPasswordInput).toBeRequired();
  });
});
