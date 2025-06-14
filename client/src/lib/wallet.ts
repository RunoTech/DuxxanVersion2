import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletConnection {
  address: string;
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
}

export class WalletService {
  private static instance: WalletService;
  private connection: WalletConnection | null = null;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async connectMetaMask(): Promise<WalletConnection> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Switch to BSC network
      await this.switchToBSC();

      this.connection = { address, provider, signer };
      return this.connection;
    } catch (error) {
      throw new Error('Failed to connect to MetaMask');
    }
  }

  async connectTrustWallet(): Promise<WalletConnection> {
    // Trust Wallet uses the same ethereum provider interface
    return this.connectMetaMask();
  }

  private async switchToBSC(): Promise<void> {
    const BSC_CHAIN_ID = '0x38'; // BSC Mainnet
    const BSC_TESTNET_CHAIN_ID = '0x61'; // BSC Testnet
    
    // Use testnet for development
    const chainId = process.env.NODE_ENV === 'development' ? BSC_TESTNET_CHAIN_ID : BSC_CHAIN_ID;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        const chainParams = chainId === BSC_TESTNET_CHAIN_ID ? {
          chainId: BSC_TESTNET_CHAIN_ID,
          chainName: 'BSC Testnet',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
          blockExplorerUrls: ['https://testnet.bscscan.com/'],
        } : {
          chainId: BSC_CHAIN_ID,
          chainName: 'BSC Mainnet',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          rpcUrls: ['https://bsc-dataseed.binance.org/'],
          blockExplorerUrls: ['https://bscscan.com/'],
        };

        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [chainParams],
        });
      } else {
        throw switchError;
      }
    }
  }

  async disconnect(): Promise<void> {
    this.connection = null;
  }

  getConnection(): WalletConnection | null {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection !== null;
  }

  async getBalance(): Promise<string> {
    if (!this.connection) {
      throw new Error('Wallet not connected');
    }

    const balance = await this.connection.provider.getBalance(this.connection.address);
    return ethers.formatEther(balance);
  }

  async getUSDTBalance(): Promise<string> {
    if (!this.connection) {
      throw new Error('Wallet not connected');
    }

    // USDT contract address on BSC
    const USDT_CONTRACT = process.env.NODE_ENV === 'development' 
      ? '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd' // BSC Testnet USDT
      : '0x55d398326f99059fF775485246999027B3197955'; // BSC Mainnet USDT

    const usdtAbi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];

    const contract = new ethers.Contract(USDT_CONTRACT, usdtAbi, this.connection.provider);
    const balance = await contract.balanceOf(this.connection.address);
    const decimals = await contract.decimals();
    
    return ethers.formatUnits(balance, decimals);
  }
}

export const walletService = WalletService.getInstance();
