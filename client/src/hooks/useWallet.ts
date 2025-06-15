import { useState, useEffect } from 'react';
import { WalletManager, type WalletConnection } from '@/lib/wallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function useWallet() {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const createOrGetUser = async (walletAddress: string) => {
    try {
      const response = await apiRequest('POST', '/api/users', {
        walletAddress,
        deviceType: 'web',
        deviceName: navigator.userAgent,
        ipAddress: 'auto-detect'
      });
      return response;
    } catch (error: any) {
      console.error('User creation failed:', error);
      // Don't throw error - user might already exist
      return null;
    }
  };

  useEffect(() => {
    // Check for existing connection on mount
    const walletManager = WalletManager.getInstance();
    const existingConnection = walletManager.getConnection();
    if (existingConnection) {
      setConnection(existingConnection);
    }

    // Listen for connection changes
    const handleConnectionChange = (connected: boolean, address?: string) => {
      if (!connected) {
        setConnection(null);
      }
    };

    walletManager.addListener(handleConnectionChange);

    return () => {
      walletManager.removeListener(handleConnectionChange);
    };
  }, []);

  const connectWallet = async (walletType: 'metamask' | 'trustwallet' = 'metamask') => {
    setIsConnecting(true);
    try {
      const walletManager = WalletManager.getInstance();
      const newConnection = await walletManager.connectWallet(walletType);
      setConnection(newConnection);

      // Create or get user
      await createOrGetUser(newConnection.address);

      toast({
        title: 'Wallet Connected',
        description: `Connected to ${newConnection.address.slice(0, 6)}...${newConnection.address.slice(-4)}`,
      });

      return newConnection;
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const connectDemoWallet = async () => {
    setIsConnecting(true);
    try {
      // Demo wallets for testing
      const demoWallets = [
        { address: '0x1234567890123456789012345678901234567890', balance: '2.45 BNB' },
        { address: '0x2345678901234567890123456789012345678901', balance: '5.89 BNB' },
        { address: '0x3456789012345678901234567890123456789012', balance: '1.23 BNB' },
        { address: '0x4567890123456789012345678901234567890123', balance: '8.76 BNB' },
        { address: '0x5678901234567890123456789012345678901234', balance: '3.14 BNB' }
      ];
      
      const randomWallet = demoWallets[Math.floor(Math.random() * demoWallets.length)];
      
      // Create demo connection object with chainId
      const demoConnection: WalletConnection = {
        address: randomWallet.address,
        provider: null as any,
        signer: null as any,
        chainId: 56 // BSC Mainnet for demo
      };
      
      setConnection(demoConnection);
      
      // Create or get user with demo address
      await createOrGetUser(randomWallet.address);
      
      // Store demo connection
      localStorage.setItem('demo_wallet_connected', 'true');
      localStorage.setItem('demo_wallet_address', randomWallet.address);
      
      toast({
        title: 'Demo Wallet Connected',
        description: `Connected to ${randomWallet.address.slice(0, 6)}...${randomWallet.address.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: 'Demo Connection Failed',
        description: error.message || 'Failed to connect demo wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const connectTrustWallet = async () => {
    setIsConnecting(true);
    try {
      // Trust Wallet demo wallets
      const trustWallets = [
        { address: '0x1234567890123456789012345678901234567890', balance: '2.45 BNB' },
        { address: '0x2345678901234567890123456789012345678901', balance: '5.89 BNB' },
        { address: '0x3456789012345678901234567890123456789012', balance: '1.23 BNB' },
        { address: '0x4567890123456789012345678901234567890123', balance: '8.76 BNB' },
        { address: '0x5678901234567890123456789012345678901234', balance: '3.14 BNB' }
      ];
      
      const randomWallet = trustWallets[Math.floor(Math.random() * trustWallets.length)];
      
      // Create demo connection object with chainId
      const demoConnection: WalletConnection = {
        address: randomWallet.address,
        provider: null as any,
        signer: null as any,
        chainId: 56 // BSC Mainnet for demo
      };
      
      setConnection(demoConnection);
      
      // Create or get user with demo address
      await createOrGetUser(randomWallet.address);
      
      // Store demo connection
      localStorage.setItem('demo_wallet_connected', 'true');
      localStorage.setItem('demo_wallet_address', randomWallet.address);
      
      toast({
        title: 'Demo Wallet Connected',
        description: `Connected to ${randomWallet.address.slice(0, 6)}...${randomWallet.address.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: 'Demo Connection Failed',
        description: error.message || 'Failed to connect demo wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      const walletManager = WalletManager.getInstance();
      await walletManager.disconnect();
      setConnection(null);
      
      // Clear demo connection storage
      localStorage.removeItem('demo_wallet_connected');
      localStorage.removeItem('demo_wallet_address');

      toast({
        title: 'Wallet Disconnected',
        description: 'Successfully disconnected from wallet',
      });
    } catch (error: any) {
      toast({
        title: 'Disconnection Failed',
        description: error.message || 'Failed to disconnect wallet',
        variant: 'destructive',
      });
    }
  };

  const isConnected = !!connection;
  const address = connection?.address;
  const chainId = connection?.chainId;

  return {
    connection,
    isConnected,
    address,
    chainId,
    isConnecting,
    connectWallet,
    connectDemoWallet,
    connectTrustWallet,
    disconnectWallet,
  };
}