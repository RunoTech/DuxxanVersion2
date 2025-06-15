import { BrowserProvider, JsonRpcSigner } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
    trustWallet?: any;
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

  async connectWallet(walletType?: 'metamask' | 'trustwallet'): Promise<WalletConnection> {
    let ethereum;
    
    // Check what's available first
    const available = this.checkAvailableWallets();
    
    if (walletType === 'trustwallet') {
      ethereum = this.getTrustWalletProvider();
      if (!ethereum) {
        if (!available.hasEthereum) {
          throw new Error('Hiçbir cüzdan bulunamadı. Lütfen Trust Wallet veya MetaMask yükleyin.');
        } else {
          throw new Error('Trust Wallet bulunamadı. Eğer yüklüyse tarayıcıyı yeniden başlatın.');
        }
      }
    } else if (walletType === 'metamask') {
      ethereum = this.getMetaMaskProvider();
      if (!ethereum) {
        if (!available.hasEthereum) {
          throw new Error('Hiçbir cüzdan bulunamadı. Lütfen MetaMask veya Trust Wallet yükleyin.');
        } else {
          throw new Error('MetaMask bulunamadı. Eğer yüklüyse tarayıcıyı yeniden başlatın.');
        }
      }
    } else {
      // Default behavior - use any available provider
      if (!window.ethereum) {
        throw new Error('Cüzdan bulunamadı. Lütfen MetaMask veya Trust Wallet yükleyin.');
      }
      ethereum = window.ethereum;
    }

    try {
      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('Cüzdan bağlantısı reddedildi');
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      // Verify BSC network (Chain ID 56 for mainnet, 97 for testnet)
      const chainId = Number(network.chainId);
      if (chainId !== 56 && chainId !== 97) {
        await this.switchToBSC(ethereum);
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

  private getMetaMaskProvider() {
    // Check if MetaMask is available
    if (typeof window !== 'undefined' && window.ethereum) {
      // Direct MetaMask check
      if (window.ethereum.isMetaMask && !window.ethereum.isTrust) {
        return window.ethereum;
      }
      
      // Check in providers array
      if (window.ethereum.providers?.length > 0) {
        const metamask = window.ethereum.providers.find((provider: any) => 
          provider.isMetaMask && !provider.isTrust
        );
        if (metamask) return metamask;
      }
      
      // Fallback: if only MetaMask is installed
      if (window.ethereum.isMetaMask) {
        return window.ethereum;
      }
    }
    return null;
  }

  private getTrustWalletProvider() {
    // Check if Trust Wallet is available
    if (typeof window !== 'undefined' && window.ethereum) {
      // Direct Trust Wallet check
      if (window.ethereum.isTrust) {
        return window.ethereum;
      }
      
      // Check in providers array
      if (window.ethereum.providers?.length > 0) {
        const trustwallet = window.ethereum.providers.find((provider: any) => 
          provider.isTrust || provider.isTrustWallet
        );
        if (trustwallet) return trustwallet;
      }
      
      // Alternative check for Trust Wallet
      if (window.ethereum.isTrustWallet) {
        return window.ethereum;
      }
      
      // Fallback: if window.ethereum exists but we can't identify Trust Wallet specifically
      // This handles cases where Trust Wallet doesn't properly set its identification flags
      if (window.ethereum && !window.ethereum.isMetaMask) {
        return window.ethereum;
      }
    }
    return null;
  }

  checkAvailableWallets() {
    const metamask = this.getMetaMaskProvider();
    const trustwallet = this.getTrustWalletProvider();
    
    // Debug information
    if (typeof window !== 'undefined') {
      console.log('Wallet Detection Debug:', {
        hasEthereum: !!window.ethereum,
        isMetaMask: window.ethereum?.isMetaMask,
        isTrust: window.ethereum?.isTrust,
        isTrustWallet: window.ethereum?.isTrustWallet,
        providers: window.ethereum?.providers?.length || 0,
        metamaskFound: !!metamask,
        trustwalletFound: !!trustwallet
      });
    }
    
    return {
      metamask: !!metamask,
      trustwallet: !!trustwallet,
      hasEthereum: !!window.ethereum
    };
  }

  async connectMetaMask(): Promise<WalletConnection> {
    return this.connectWallet('metamask');
  }

  async connectTrustWallet(): Promise<WalletConnection> {
    return this.connectWallet('trustwallet');
  }

  async switchToBSC(ethereum?: any): Promise<void> {
    const provider = ethereum || window.ethereum;
    if (!provider) return;

    try {
      // Try to switch to BSC mainnet
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC mainnet
      });
    } catch (switchError: any) {
      // If BSC is not added, add it
      if (switchError.code === 4902) {
        await provider.request({
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