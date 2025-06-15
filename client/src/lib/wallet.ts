import { BrowserProvider, JsonRpcSigner } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletConnection {
  address: string;
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  chainId: number;
}

export class WalletManager {
  private static instance: WalletManager;
  private connection: WalletConnection | null = null;
  private listeners: Set<(connected: boolean, address?: string) => void> = new Set();

  private constructor() {}

  static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }

  async connectWallet(): Promise<WalletConnection> {
    if (!window.ethereum) {
      throw new Error('MetaMask veya Trust Wallet yüklü değil. Lütfen yükleyip tekrar deneyin.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('Cüzdan bağlantısı reddedildi');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      // Verify BSC network (Chain ID 56 for mainnet, 97 for testnet)
      const chainId = Number(network.chainId);
      if (chainId !== 56 && chainId !== 97) {
        await this.switchToBSC();
      }

      this.connection = {
        address,
        provider,
        signer,
        chainId
      };

      this.notifyListeners(true, address);
      return this.connection;

    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      throw new Error(error.message || 'Cüzdan bağlantısı başarısız');
    }
  }

  async switchToBSC(): Promise<void> {
    if (!window.ethereum) return;

    try {
      // Try to switch to BSC mainnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC mainnet
      });
    } catch (switchError: any) {
      // If BSC is not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'Binance Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/']
          }],
        });
      }
    }
  }

  async disconnectWallet(): Promise<void> {
    this.connection = null;
    this.notifyListeners(false);
  }

  getConnection(): WalletConnection | null {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection !== null;
  }

  getAddress(): string | null {
    return this.connection?.address || null;
  }

  onConnectionChange(callback: (connected: boolean, address?: string) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(connected: boolean, address?: string): void {
    this.listeners.forEach(callback => callback(connected, address));
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connection) {
      throw new Error('Cüzdan bağlı değil');
    }

    return await this.connection.signer.signMessage(message);
  }

  async getBalance(): Promise<string> {
    if (!this.connection) {
      throw new Error('Cüzdan bağlı değil');
    }

    const balance = await this.connection.provider.getBalance(this.connection.address);
    return balance.toString();
  }

  // Auto-connect if previously connected
  async autoConnect(): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (accounts && accounts.length > 0) {
        await this.connectWallet();
        return true;
      }
    } catch (error) {
      console.error('Auto-connect failed:', error);
    }

    return false;
  }

  // Listen for account changes
  setupEventListeners(): void {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnectWallet();
      } else {
        this.connectWallet();
      }
    });

    window.ethereum.on('chainChanged', (chainId: string) => {
      // Reload page on chain change
      window.location.reload();
    });
  }
}

export const walletManager = WalletManager.getInstance();

// Initialize event listeners
if (typeof window !== 'undefined') {
  walletManager.setupEventListeners();
}