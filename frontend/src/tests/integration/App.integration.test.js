import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import axios from 'axios';
import * as walletUtils from '../../utils/wallet';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock wallet utils
jest.mock('../../utils/wallet', () => ({
  connectWallet: jest.fn(),
  getWalletAddress: jest.fn(),
  formatAddress: jest.fn(),
  onAccountsChanged: jest.fn(),
  onChainChanged: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockedAxios.defaults = { baseURL: '', headers: { common: {} } };
    mockedAxios.post = jest.fn();
    mockedAxios.get = jest.fn();
    walletUtils.getWalletAddress.mockResolvedValue(null);
    walletUtils.formatAddress.mockImplementation(addr => 
      addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : ''
    );
    walletUtils.onAccountsChanged.mockImplementation(() => {});
    walletUtils.onChainChanged.mockImplementation(() => {});
  });

  describe('Authentication Flow', () => {
    it('should show landing page when not authenticated', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('What if you could')).toBeInTheDocument();
        expect(screen.getByText('buy good luck?')).toBeInTheDocument();
      });
    });

    it('should complete full registration flow', async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockResolvedValue({ data: { message: 'User created successfully' } });

      render(<App />);

      // Click sign in on landing page
      await user.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });

      // Switch to register
      await user.click(screen.getByText('Create an account'));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
      });

      // Fill registration form
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Password (min. 6 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      // Submit registration
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Registration Successful!')).toBeInTheDocument();
      });

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/signup', {
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should complete full login flow', async () => {
      const user = userEvent.setup();
      const mockToken = 'mock-jwt-token';
      mockedAxios.post.mockResolvedValue({ data: { token: mockToken } });
      mockedAxios.get.mockResolvedValue({ data: { credits: 150 } });

      render(<App />);

      // Click sign in on landing page
      await user.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });

      // Fill login form
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');

      // Submit login
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Welcome to')).toBeInTheDocument();
        expect(screen.getAllByText('KARMA')[0]).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument(); // Karma display
      });

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    });

    it('should restore authenticated state from localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('existing-token');
      mockedAxios.get.mockResolvedValue({ data: { credits: 200 } });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to')).toBeInTheDocument();
        expect(screen.getAllByText('KARMA')[0]).toBeInTheDocument();
        expect(screen.getByText('200')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Flow', () => {
    beforeEach(() => {
      // Setup authenticated state
      mockLocalStorage.getItem.mockReturnValue('valid-token');
      mockedAxios.get.mockResolvedValue({ data: { credits: 100 } });
    });

    it('should complete full wallet connection flow', async () => {
      const user = userEvent.setup();
      const mockAddress = '0x742d35Cc6644c002532c692aF58B11306b2ea524';

      walletUtils.connectWallet.mockResolvedValue({
        success: true,
        address: mockAddress
      });
      mockedAxios.post.mockResolvedValue({
        data: { walletAddress: mockAddress.toLowerCase(), message: 'Wallet connected' }
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to')).toBeInTheDocument();
        expect(screen.getAllByText('KARMA')[0]).toBeInTheDocument();
      });

      // Connect wallet
      const connectButtons = screen.getAllByRole('button', { name: /connect wallet/i });
      await user.click(connectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Wallet Connected')).toBeInTheDocument();
      });

      expect(walletUtils.connectWallet).toHaveBeenCalled();
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/user/wallet', {
        walletAddress: mockAddress
      });
    });

    it('should handle complete purchase flow with connected wallet', async () => {
      const user = userEvent.setup();
      const mockAddress = '0x742d35Cc6644c002532c692aF58B11306b2ea524';

      // Setup connected wallet
      walletUtils.getWalletAddress.mockResolvedValue(mockAddress);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to')).toBeInTheDocument();
        expect(screen.getAllByText('KARMA')[0]).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Wallet Connected')).toBeInTheDocument();
      });

      // Select a credit tier
      const tier = screen.getByText('0.01 ETH').closest('div');
      await user.click(tier);

      // Click purchase button
      const purchaseButtons = screen.getAllByRole('button', { name: /purchase karma/i });
      await user.click(purchaseButtons[0]);

      // Should show payment instructions
      await waitFor(() => {
        expect(screen.getAllByText('Purchase Karma')[0]).toBeInTheDocument();
        expect(screen.getByText(/Send 0\.01 ETH to get 100 Karma/)).toBeInTheDocument();
      });
    });

    it('should refresh karma and show updated balance', async () => {
      const user = userEvent.setup();
      mockedAxios.get
        .mockResolvedValueOnce({ data: { credits: 100 } }) // Initial load
        .mockResolvedValueOnce({ data: { credits: 200 } }); // After refresh

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument();
      });

      // Refresh karma
      const refreshButton = screen.getByRole('button', { name: /refresh stats/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('200')).toBeInTheDocument();
      });
    });

    it('should handle logout and return to landing page', async () => {
      const user = userEvent.setup();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to')).toBeInTheDocument();
        expect(screen.getAllByText('KARMA')[0]).toBeInTheDocument();
      });

      // Logout
      const logoutButton = screen.getByRole('button', { name: /sign out/i });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('What if you could')).toBeInTheDocument();
        expect(screen.getByText('buy good luck?')).toBeInTheDocument();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('Error Handling', () => {
    it('should handle login errors gracefully', async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValue({
        response: { data: { error: 'Invalid credentials' } }
      });

      render(<App />);

      // Go to login page
      await user.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });

      // Fill and submit login form
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Should remain on login screen
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('should handle wallet connection errors', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('valid-token');
      mockedAxios.get.mockResolvedValue({ data: { credits: 100 } });

      walletUtils.connectWallet.mockResolvedValue({
        success: false,
        error: 'User rejected the connection request'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to')).toBeInTheDocument();
        expect(screen.getAllByText('KARMA')[0]).toBeInTheDocument();
      });

      const connectButtons = screen.getAllByRole('button', { name: /connect wallet/i });
      await user.click(connectButtons[0]);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('User rejected the connection request');
      });

      alertSpy.mockRestore();
    });

    it('should handle API errors during karma fetch', async () => {
      mockLocalStorage.getItem.mockReturnValue('valid-token');
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<App />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch karma:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Real-time Features', () => {
    it('should setup auto-refresh for karma', async () => {
      jest.useFakeTimers();
      mockLocalStorage.getItem.mockReturnValue('valid-token');
      mockedAxios.get
        .mockResolvedValueOnce({ data: { credits: 100 } })
        .mockResolvedValueOnce({ data: { credits: 150 } });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument();
      });

      // Fast-forward 30 seconds
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      });

      jest.useRealTimers();
    });
  });

  describe('Responsive Design', () => {
    it('should render mobile-friendly layout', async () => {
      mockLocalStorage.getItem.mockReturnValue('valid-token');
      mockedAxios.get.mockResolvedValue({ data: { credits: 100 } });

      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to')).toBeInTheDocument();
        expect(screen.getAllByText('KARMA')[0]).toBeInTheDocument();
      });

      // Check that responsive classes are applied (this would need more specific testing)
      const dashboard = screen.getByText('Welcome to').closest('div');
      expect(dashboard).toBeInTheDocument();
    });
  });
});
