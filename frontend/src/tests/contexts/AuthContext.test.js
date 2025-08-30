import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test component that uses the auth context
const TestComponent = () => {
  const { 
    isAuthenticated, 
    loading, 
    user, 
    credits, 
    login, 
    register, 
    logout, 
    fetchUserCredits, 
    updateWallet 
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <div data-testid="credits">{credits}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('test@example.com', 'password')}>Register</button>
      <button onClick={logout}>Logout</button>
      <button onClick={fetchUserCredits}>Fetch Credits</button>
      <button onClick={() => updateWallet('0x123')}>Update Wallet</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockedAxios.defaults = { baseURL: '', headers: { common: {} } };
    mockedAxios.post = jest.fn();
    mockedAxios.get = jest.fn();
  });

  it('should initialize with default values', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('credits')).toHaveTextContent('0');
  });

  it('should restore authentication state from localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue('fake-token');
    mockedAxios.get.mockResolvedValue({ data: { credits: 100 } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    
    // Wait for credits to be loaded asynchronously
    await waitFor(() => {
      expect(screen.getByTestId('credits')).toHaveTextContent('100');
    });
    
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/user/credits');
  });

  it('should handle successful login', async () => {
    const mockToken = 'mock-jwt-token';
    mockedAxios.post.mockResolvedValue({ data: { token: mockToken } });
    mockedAxios.get.mockResolvedValue({ data: { credits: 50 } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(screen.getByTestId('credits')).toHaveTextContent('50');
  });

  it('should handle login failure', async () => {
    mockedAxios.post.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    // Should remain unauthenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
  });

  it('should handle successful registration', async () => {
    mockedAxios.post.mockResolvedValue({ data: { message: 'User created' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await act(async () => {
      screen.getByText('Register').click();
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/signup', {
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('should handle logout', async () => {
    // Start with authenticated state
    mockLocalStorage.getItem.mockReturnValue('fake-token');
    mockedAxios.get.mockResolvedValue({ data: { credits: 100 } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('credits')).toHaveTextContent('0');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should fetch user credits', async () => {
    mockLocalStorage.getItem.mockReturnValue('fake-token');
    mockedAxios.get.mockResolvedValue({ data: { credits: 200 } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await act(async () => {
      screen.getByText('Fetch Credits').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('credits')).toHaveTextContent('200');
    });
  });

  it('should update wallet address', async () => {
    mockLocalStorage.getItem.mockReturnValue('fake-token');
    mockedAxios.post.mockResolvedValue({ 
      data: { walletAddress: '0x123', message: 'Wallet connected' } 
    });
    mockedAxios.get.mockResolvedValue({ data: { credits: 0 } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await act(async () => {
      screen.getByText('Update Wallet').click();
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/user/wallet', {
      walletAddress: '0x123'
    });
  });

  it('should handle API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    mockLocalStorage.getItem.mockReturnValue('fake-token');

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch credits:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
