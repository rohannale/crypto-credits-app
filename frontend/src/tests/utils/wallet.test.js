import {
  connectWallet,
  getWalletAddress,
  formatAddress,
  formatEther,
  onAccountsChanged,
  onChainChanged
} from '../../utils/wallet';

// Mock window.ethereum
const mockEthereum = {
  request: jest.fn(),
  on: jest.fn(),
};

describe('Wallet Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete window.ethereum;
  });

  afterEach(() => {
    delete window.ethereum;
  });

  describe('connectWallet', () => {
    it('should return error when MetaMask is not installed', async () => {
      // Don't set window.ethereum
      const result = await connectWallet();

      expect(result).toEqual({
        success: false,
        error: 'MetaMask is not installed. Please install MetaMask to continue.'
      });
    });

    it('should successfully connect wallet', async () => {
      window.ethereum = mockEthereum;
      mockEthereum.request
        .mockResolvedValueOnce(['0x742d35Cc6644c002532c692aF58B11306b2ea524']) // eth_requestAccounts
        .mockResolvedValueOnce(null); // wallet_switchEthereumChain

      const result = await connectWallet();

      expect(result).toEqual({
        success: true,
        address: '0x742d35Cc6644c002532c692aF58B11306b2ea524'
      });

      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'eth_requestAccounts'
      });
      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }]
      });
    });

    it('should handle no accounts found', async () => {
      window.ethereum = mockEthereum;
      mockEthereum.request.mockResolvedValueOnce([]);

      const result = await connectWallet();

      expect(result).toEqual({
        success: false,
        error: 'No accounts found'
      });
    });

    it('should handle user rejection', async () => {
      window.ethereum = mockEthereum;
      mockEthereum.request.mockRejectedValueOnce({ code: 4001 });

      const result = await connectWallet();

      expect(result).toEqual({
        success: false,
        error: 'User rejected the connection request'
      });
    });

    it('should handle chain switching errors and attempt to add chain', async () => {
      window.ethereum = mockEthereum;
      mockEthereum.request
        .mockResolvedValueOnce(['0x742d35Cc6644c002532c692aF58B11306b2ea524']) // eth_requestAccounts
        .mockRejectedValueOnce({ code: 4902 }) // wallet_switchEthereumChain fails
        .mockResolvedValueOnce(null); // wallet_addEthereumChain succeeds

      const result = await connectWallet();

      expect(result).toEqual({
        success: true,
        address: '0x742d35Cc6644c002532c692aF58B11306b2ea524'
      });

      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia test network',
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          nativeCurrency: {
            name: 'SepoliaETH',
            symbol: 'SEP',
            decimals: 18,
          },
          blockExplorerUrls: ['https://sepolia.etherscan.io/'],
        }]
      });
    });

    it('should handle general errors', async () => {
      window.ethereum = mockEthereum;
      mockEthereum.request.mockRejectedValueOnce(new Error('Network error'));

      const result = await connectWallet();

      expect(result).toEqual({
        success: false,
        error: 'Network error'
      });
    });
  });

  describe('getWalletAddress', () => {
    it('should return null when MetaMask is not installed', async () => {
      const result = await getWalletAddress();
      expect(result).toBeNull();
    });

    it('should return first account when available', async () => {
      window.ethereum = mockEthereum;
      mockEthereum.request.mockResolvedValueOnce(['0x742d35Cc6644c002532c692aF58B11306b2ea524']);

      const result = await getWalletAddress();

      expect(result).toBe('0x742d35Cc6644c002532c692aF58B11306b2ea524');
      expect(mockEthereum.request).toHaveBeenCalledWith({
        method: 'eth_accounts'
      });
    });

    it('should return null when no accounts available', async () => {
      window.ethereum = mockEthereum;
      mockEthereum.request.mockResolvedValueOnce([]);

      const result = await getWalletAddress();

      expect(result).toBeNull();
    });

    it('should handle errors and return null', async () => {
      window.ethereum = mockEthereum;
      mockEthereum.request.mockRejectedValueOnce(new Error('Error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getWalletAddress();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error getting wallet address:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('formatAddress', () => {
    it('should format valid address correctly', () => {
      const address = '0x742d35Cc6644c002532c692aF58B11306b2ea524';
      const result = formatAddress(address);
      expect(result).toBe('0x742d...a524');
    });

    it('should return empty string for null address', () => {
      const result = formatAddress(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined address', () => {
      const result = formatAddress(undefined);
      expect(result).toBe('');
    });

    it('should return empty string for empty string', () => {
      const result = formatAddress('');
      expect(result).toBe('');
    });
  });

  describe('formatEther', () => {
    it('should format ether value to 4 decimal places', () => {
      expect(formatEther(0.123456789)).toBe('0.1235');
      expect(formatEther(1.0)).toBe('1.0000');
      expect(formatEther(0.1)).toBe('0.1000');
      expect(formatEther(0)).toBe('0.0000');
    });

    it('should handle string input', () => {
      expect(formatEther('0.123456789')).toBe('0.1235');
    });
  });

  describe('onAccountsChanged', () => {
    it('should set up event listener when MetaMask is available', () => {
      window.ethereum = mockEthereum;
      const callback = jest.fn();

      onAccountsChanged(callback);

      expect(mockEthereum.on).toHaveBeenCalledWith('accountsChanged', callback);
    });

    it('should not set up event listener when MetaMask is not available', () => {
      const callback = jest.fn();

      onAccountsChanged(callback);

      // No error should be thrown and no calls should be made
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('onChainChanged', () => {
    it('should set up event listener when MetaMask is available', () => {
      window.ethereum = mockEthereum;
      const callback = jest.fn();

      onChainChanged(callback);

      expect(mockEthereum.on).toHaveBeenCalledWith('chainChanged', callback);
    });

    it('should not set up event listener when MetaMask is not available', () => {
      const callback = jest.fn();

      onChainChanged(callback);

      // No error should be thrown and no calls should be made
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
