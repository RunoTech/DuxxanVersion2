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
      // First try to authenticate with the wallet address
      const response = await apiRequest('POST', '/api/users/auth/wallet', {
        walletAddress: walletAddress.toLowerCase()
      });
      
      // Store authentication state in localStorage for persistence
      if (response) {
        localStorage.setItem('wallet_authenticated', 'true');
        localStorage.setItem('wallet_address', walletAddress.toLowerCase());
      }
      
      return response;
    } catch (error: any) {
      console.error('Wallet authentication failed:', error);
      localStorage.removeItem('wallet_authenticated');
      localStorage.removeItem('wallet_address');
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

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const walletManager = WalletManager.getInstance();
      try {
        // Check if user was previously authenticated
        const wasAuthenticated = localStorage.getItem('wallet_authenticated') === 'true';
        const storedAddress = localStorage.getItem('wallet_address');
        
        const connected = await walletManager.autoConnect();
        if (connected) {
          const connection = walletManager.getConnection();
          if (connection) {
            setConnection(connection);
            
            // Only re-authenticate if address matches stored address
            if (wasAuthenticated && storedAddress === connection.address.toLowerCase()) {
              // User was previously authenticated with this address
              console.log('Restoring authenticated session for:', connection.address);
            } else {
              // New address or no previous authentication
              await createOrGetUser(connection.address);
            }
          }
        }
      } catch (error) {
        console.error('Auto-connect failed:', error);
        // Clear stored authentication on error
        localStorage.removeItem('wallet_authenticated');
        localStorage.removeItem('wallet_address');
      }
    };

    autoConnect();
  }, []);

  const disconnectWallet = async () => {
    try {
      const walletManager = WalletManager.getInstance();
      await walletManager.disconnectWallet();
      setConnection(null);
      
      // Clear authentication state
      localStorage.removeItem('wallet_authenticated');
      localStorage.removeItem('wallet_address');

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
    disconnectWallet,
  };
}