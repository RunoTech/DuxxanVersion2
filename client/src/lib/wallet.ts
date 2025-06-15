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

  // BSC Network Configuration
  private BSC_NETWORK = {
    chainId: '0x38', // 56 in hexadecimal
    chainName: 'BNB Smart Chain',
    rpcUrls: ['https://bsc-dataseed1.binance.org/'],
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    blockExplorerUrls: ['https://bscscan.com/']
  };

  async connectWallet(walletType?: 'metamask' | 'trustwallet'): Promise<WalletConnection> {
    if (!window.ethereum) {
      throw new Error('No wallet found. Please install MetaMask or Trust Wallet.');
    }

    const ethereum = window.ethereum;
    console.log(`Attempting ${walletType || 'default'} wallet connection...`);

    try {
      // Check current network first
      let currentChainId;
      try {
        currentChainId = await ethereum.request({ method: 'eth_chainId' });
      } catch (error) {
        console.log('Could not get current chain ID, proceeding with connection...');
      }

      // If not on BSC, try to switch/add BSC network
      if (currentChainId !== this.BSC_NETWORK.chainId) {
        try {
          // Try to switch to BSC first
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: this.BSC_NETWORK.chainId }]
          });
        } catch (switchError: any) {
          // If network doesn't exist (4902), add it
          if (switchError.code === 4902) {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [this.BSC_NETWORK]
            });
          } else {
            console.warn('Network switch failed:', switchError);
            // Continue anyway - user might be on testnet or development
          }
        }
      }

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
      
      // Get final network after potential switching
      const finalChainId = await ethereum.request({ method: 'eth_chainId' });
      const chainId = parseInt(finalChainId, 16);

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
    if (typeof window !== 'undefined') {
      
      // Check for Trust Wallet specific global
      if ((window as any).trustWallet) {
        return (window as any).trustWallet;
      }
      
      // Check window.ethereum for Trust Wallet
      if (window.ethereum) {
        // Direct Trust Wallet checks
        if (window.ethereum.isTrust || window.ethereum.isTrustWallet) {
          return window.ethereum;
        }
        
        // Check provider name/brand
        if (window.ethereum.name === 'TrustWallet' || 
            window.ethereum.selectedProvider?.name === 'TrustWallet') {
          return window.ethereum;
        }
        
        // Check in providers array
        if (window.ethereum.providers?.length > 0) {
          const trustwallet = window.ethereum.providers.find((provider: any) => 
            provider.isTrust || 
            provider.isTrustWallet || 
            provider.name === 'TrustWallet' ||
            provider.selectedProvider?.name === 'TrustWallet'
          );
          if (trustwallet) return trustwallet;
        }
        
        // Check user agent for Trust Wallet browser
        if (navigator.userAgent.includes('Trust')) {
          return window.ethereum;
        }
      }
      
      // Check for Trust Wallet in window object with different names
      const trustWalletGlobals = ['trustwallet', 'TrustWallet', 'trust'];
      for (const global of trustWalletGlobals) {
        if ((window as any)[global]?.ethereum) {
          return (window as any)[global].ethereum;
        }
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
        ethereumName: window.ethereum?.name,
        selectedProvider: window.ethereum?.selectedProvider?.name,
        providers: window.ethereum?.providers?.length || 0,
        userAgent: navigator.userAgent.includes('Trust'),
        trustWalletGlobal: !!(window as any).trustWallet,
        trustwallet: !!(window as any).trustwallet,
        TrustWallet: !!(window as any).TrustWallet,
        trust: !!(window as any).trust,
        metamaskFound: !!metamask,
        trustwalletFound: !!trustwallet,
        availableGlobals: Object.keys(window).filter(key => 
          key.toLowerCase().includes('trust') || 
          key.toLowerCase().includes('wallet')
        ).slice(0, 10)
      });
      
      // Additional provider details if available
      if (window.ethereum?.providers?.length > 0) {
        console.log('Available Providers:', window.ethereum.providers.map((p: any) => ({
          isMetaMask: p.isMetaMask,
          isTrust: p.isTrust,
          isTrustWallet: p.isTrustWallet,
          name: p.name,
          selectedProvider: p.selectedProvider?.name
        })));
      }
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