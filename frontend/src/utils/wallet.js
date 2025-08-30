// Wallet connection utilities
export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    return { 
      success: false, 
      error: 'MetaMask is not installed. Please install MetaMask to continue.' 
    };
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length === 0) {
      return { success: false, error: 'No accounts found' };
    }

    const walletAddress = accounts[0];
    
    // Switch to Ethereum Sepolia testnet for testing
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia testnet
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia test network',
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'SEP',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              },
            ],
          });
        } catch (addError) {
          console.log('Please add Sepolia testnet to your MetaMask manually');
        }
      }
    }

    return { success: true, address: walletAddress };
  } catch (error) {
    if (error.code === 4001) {
      return { success: false, error: 'User rejected the connection request' };
    }
    return { success: false, error: error.message };
  }
};

export const getWalletAddress = async () => {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return null;
  }
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const formatEther = (value) => {
  return parseFloat(value).toFixed(4);
};

// Listen for account changes
export const onAccountsChanged = (callback) => {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', callback);
  }
};

// Listen for chain changes
export const onChainChanged = (callback) => {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('chainChanged', callback);
  }
};

// Send ETH transaction
export const sendTransaction = async (to, amount) => {
  if (typeof window.ethereum === 'undefined') {
    return {
      success: false,
      error: 'MetaMask is not installed. Please install MetaMask to continue.'
    };
  }

  try {
    // Convert amount to wei (1 ETH = 10^18 wei)
    const weiAmount = '0x' + (parseFloat(amount) * Math.pow(10, 18)).toString(16);

    const transactionParameters = {
      to: to,
      from: window.ethereum.selectedAddress,
      value: weiAmount,
      gas: '0x5208', // 21000 gas
    };

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    return {
      success: true,
      txHash: txHash,
      amount: amount
    };

  } catch (error) {
    if (error.code === 4001) {
      return { success: false, error: 'Transaction rejected by user' };
    } else if (error.code === -32603) {
      return { success: false, error: 'Insufficient funds for transaction' };
    }
    return { success: false, error: error.message };
  }
};

// Get current ETH balance
export const getBalance = async (address) => {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  try {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    // Convert from wei to ETH
    const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
    return ethBalance;
  } catch (error) {
    console.error('Error getting balance:', error);
    return null;
  }
};
