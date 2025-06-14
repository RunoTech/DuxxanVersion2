import { useState, useEffect } from 'react';
import { walletService, type WalletConnection } from '@/lib/wallet';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useWallet() {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if demo wallet was previously connected
    const isDemoConnected = localStorage.getItem('demo_wallet_connected');
    const savedAddress = localStorage.getItem('demo_wallet_address');
    const savedUser = localStorage.getItem('demo_user_data');
    
    if (isDemoConnected === 'true' && savedAddress) {
      const demoConnection = {
        address: savedAddress,
        provider: null as any,
        signer: null as any
      };
      setConnection(demoConnection);
      
      // Use cached user data first
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          fetchUser(savedAddress);
        }
      } else {
        fetchUser(savedAddress);
      }
    }
  }, []);

  const fetchUser = async (walletAddress: string) => {
    // Sadece user yoksa fetch et
    if (user) return;
    
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'x-wallet-address': walletAddress,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Cache user data
        localStorage.setItem('demo_user_data', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const connectMetaMask = async () => {
    setIsConnecting(true);
    
    // Demo mode - simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Demo wallet data
      const demoWallets = [
        { address: '0x1234567890123456789012345678901234567890', balance: '2.45 BNB' },
        { address: '0x2345678901234567890123456789012345678901', balance: '5.89 BNB' },
        { address: '0x3456789012345678901234567890123456789012', balance: '1.23 BNB' },
        { address: '0x4567890123456789012345678901234567890123', balance: '8.76 BNB' },
        { address: '0x5678901234567890123456789012345678901234', balance: '3.14 BNB' }
      ];
      
      const randomWallet = demoWallets[Math.floor(Math.random() * demoWallets.length)];
      
      // Create demo connection object
      const demoConnection = {
        address: randomWallet.address,
        provider: null as any,
        signer: null as any
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
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const connectTrustWallet = async () => {
    setIsConnecting(true);
    
    // Demo mode - simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Demo wallet data
      const demoWallets = [
        { address: '0x1234567890123456789012345678901234567890', balance: '2.45 BNB' },
        { address: '0x2345678901234567890123456789012345678901', balance: '5.89 BNB' },
        { address: '0x3456789012345678901234567890123456789012', balance: '1.23 BNB' },
        { address: '0x4567890123456789012345678901234567890123', balance: '8.76 BNB' },
        { address: '0x5678901234567890123456789012345678901234', balance: '3.14 BNB' }
      ];
      
      const randomWallet = demoWallets[Math.floor(Math.random() * demoWallets.length)];
      
      // Create demo connection object
      const demoConnection = {
        address: randomWallet.address,
        provider: null as any,
        signer: null as any
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
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const createOrGetUser = async (walletAddress: string) => {
    try {
      const response = await apiRequest('POST', '/api/users', {
        walletAddress,
        username: `user_${walletAddress.slice(-8)}`, // Default username
      });
      
      const userData = await response.json();
      setUser(userData);
      // Cache user data
      localStorage.setItem('demo_user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to create/get user:', error);
    }
  };

  const disconnect = async () => {
    setConnection(null);
    setUser(null);
    
    // Clear all demo wallet data including cache
    localStorage.removeItem('demo_wallet_connected');
    localStorage.removeItem('demo_wallet_address');
    localStorage.removeItem('demo_user_data');
    
    toast({
      title: 'Demo Wallet Disconnected',
      description: 'Your demo wallet has been disconnected',
    });
  };

  const updateUser = async (updates: any) => {
    if (!connection) return;
    
    try {
      const response = await apiRequest('PUT', '/api/users/me', updates);
      const updatedUser = await response.json();
      setUser(updatedUser);
      // Cache updated user data
      localStorage.setItem('demo_user_data', JSON.stringify(updatedUser));
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const getApiHeaders = () => {
    if (!connection) return {};
    
    return {
      'x-wallet-address': connection.address,
    };
  };

  return {
    connection,
    user,
    isConnected: !!connection,
    isConnecting,
    connectMetaMask,
    connectTrustWallet,
    disconnect,
    updateUser,
    getApiHeaders,
  };
}
