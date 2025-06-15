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

  addListener(listener: (connected: boolean, address?: string) => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: (connected: boolean, address?: string) => void): void {
    this.listeners.delete(listener);
  }

  getConnection(): WalletConnection | null {
    return this.connection;
  }

  isConnected(): boolean {
    return !!this.connection;
  }

  // BSC Network Configuration
  private BSC_NETWORK = {
    chainId: '0x38', // 56 in hexadecimal
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed1.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/'],
  };

  async connectWallet(walletType?: 'metamask' | 'trustwallet'): Promise<WalletConnection> {
    if (walletType === 'trustwallet') {
      return this.connectTrustWallet();
    }
    return this.connectMetaMask();
  }

  private getMetaMaskProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      if (window.ethereum.isMetaMask) {
        return window.ethereum;
      }
      // Handle multiple wallet providers
      if (window.ethereum.providers) {
        return window.ethereum.providers.find((provider: any) => provider.isMetaMask);
      }
    }
    return null;
  }

  private getTrustWalletProvider() {
    if (typeof window !== 'undefined') {
      // Try multiple ways Trust Wallet might be available
      if (window.trustWallet) return window.trustWallet;
      if (window.ethereum?.isTrust) return window.ethereum;
      if (window.ethereum?.isTrustWallet) return window.ethereum;
    }
    return null;
  }

  checkAvailableWallets() {
    const hasEthereum = typeof window !== 'undefined' && !!window.ethereum;
    const isMetaMask = hasEthereum && window.ethereum.isMetaMask;
    const providers = hasEthereum && window.ethereum.providers ? window.ethereum.providers.length : 0;
    
    // Trust Wallet detection
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const trustWalletGlobal = typeof window !== 'undefined' && !!window.trustWallet;
    const trustwallet = typeof window !== 'undefined' && !!(window as any).trustwallet;  
    const TrustWallet = typeof window !== 'undefined' && !!(window as any).TrustWallet;
    const trust = typeof window !== 'undefined' && !!(window as any).trust;
    
    const metamaskFound = isMetaMask || (hasEthereum && window.ethereum.providers?.some((p: any) => p.isMetaMask));
    const trustwalletFound = trustWalletGlobal || trustwallet || TrustWallet || trust || 
                           (hasEthereum && (window.ethereum.isTrust || window.ethereum.isTrustWallet));

    const availableGlobals = [];
    if (typeof window !== 'undefined') {
      const globalKeys = Object.keys(window).filter(key => 
        key.toLowerCase().includes('trust') || 
        key.toLowerCase().includes('metamask') ||
        key.toLowerCase().includes('wallet')
      );
      availableGlobals.push(...globalKeys);
    }

    console.log('Wallet Detection Debug:', {
      hasEthereum,
      isMetaMask,
      providers,
      userAgent: userAgent.includes('trust'),
      trustWalletGlobal,
      trustwallet,
      TrustWallet,
      trust,
      metamaskFound,
      trustwalletFound,
      availableGlobals
    });

    return {
      metamask: metamaskFound,
      trustwallet: trustwalletFound,
      ethereum: hasEthereum
    };
  }

  async connectMetaMask(): Promise<WalletConnection> {
    console.log('Attempting metamask wallet connection...');
    
    const ethereum = this.getMetaMaskProvider();
    if (!ethereum) {
      throw new Error('MetaMask not found. Please install MetaMask extension.');
    }

    try {
      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your MetaMask wallet.');
      }

      // Create provider and signer
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Check and switch to BSC network
      await this.switchToBSC(ethereum);
      
      // Get chain ID after network switch
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      const connection: WalletConnection = {
        address,
        provider,
        signer,
        chainId
      };

      this.connection = connection;
      this.setupEventListeners();
      this.notifyListeners(true, address);

      return connection;
    } catch (error: any) {
      console.error('MetaMask connection failed:', error);
      throw new Error(`MetaMask connection failed: ${error.message}`);
    }
  }

  async connectTrustWallet(): Promise<WalletConnection> {
    console.log('Attempting trustwallet wallet connection...');
    
    const ethereum = this.getTrustWalletProvider() || this.getMetaMaskProvider();
    if (!ethereum) {
      throw new Error('Trust Wallet not found. Please install Trust Wallet or use Trust Wallet browser.');
    }

    try {
      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your Trust Wallet.');
      }

      // Create provider and signer
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Check and switch to BSC network
      await this.switchToBSC(ethereum);
      
      // Get chain ID after network switch
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      const connection: WalletConnection = {
        address,
        provider,
        signer,
        chainId
      };

      this.connection = connection;
      this.setupEventListeners();
      this.notifyListeners(true, address);

      return connection;
    } catch (error: any) {
      console.error('Trust Wallet connection failed:', error);
      throw new Error(`Trust Wallet connection failed: ${error.message}`);
    }
  }

  async switchToBSC(ethereum?: any): Promise<void> {
    const provider = ethereum || window.ethereum;
    if (!provider) return;

    try {
      // Try to switch to BSC network
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.BSC_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [this.BSC_NETWORK],
          });
        } catch (addError: any) {
          throw new Error(`Failed to add BSC network: ${addError.message}`);
        }
      } else {
        throw new Error(`Failed to switch to BSC network: ${switchError.message}`);
      }
    }
  }

  async disconnectWallet(): Promise<void> {
    this.connection = null;
    this.notifyListeners(false);
  }

  async disconnect(): Promise<void> {
    await this.disconnectWallet();
  }

  getAddress(): string | null {
    return this.connection?.address || null;
  }

  onConnectionChange(callback: (connected: boolean, address?: string) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(connected: boolean, address?: string): void {
    this.listeners.forEach(listener => listener(connected, address));
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connection) {
      throw new Error('Wallet not connected');
    }
    return await this.connection.signer.signMessage(message);
  }

  async getBalance(): Promise<string> {
    if (!this.connection) {
      throw new Error('Wallet not connected');
    }
    const balance = await this.connection.provider.getBalance(this.connection.address);
    return balance.toString();
  }

  async autoConnect(): Promise<boolean> {
    try {
      const ethereum = this.getMetaMaskProvider();
      if (!ethereum) return false;

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        await this.connectMetaMask();
        return true;
      }
    } catch (error) {
      console.error('Auto-connect failed:', error);
    }
    return false;
  }

  setupEventListeners(): void {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    // Listen for account changes
    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnectWallet();
      } else {
        // Reconnect with new account
        this.connectMetaMask().catch(console.error);
      }
    });

    // Listen for chain changes
    ethereum.on('chainChanged', (chainId: string) => {
      // Reload the page to reset the dapp state
      window.location.reload();
    });

    // Listen for connection
    ethereum.on('connect', (connectInfo: { chainId: string }) => {
      console.log('Wallet connected:', connectInfo);
    });

    // Listen for disconnection
    ethereum.on('disconnect', (error: { code: number; message: string }) => {
      console.log('Wallet disconnected:', error);
      this.disconnectWallet();
    });
  }
}

export const walletManager = WalletManager.getInstance();