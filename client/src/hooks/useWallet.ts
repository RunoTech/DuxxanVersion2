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
    // Check if wallet was previously connected
    const savedConnection = walletService.getConnection();
    if (savedConnection) {
      setConnection(savedConnection);
      fetchUser(savedConnection.address);
    }
  }, []);

  const fetchUser = async (walletAddress: string) => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'x-wallet-address': walletAddress,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const connectMetaMask = async () => {
    setIsConnecting(true);
    try {
      const walletConnection = await walletService.connectMetaMask();
      setConnection(walletConnection);
      
      // Create or get user
      await createOrGetUser(walletConnection.address);
      
      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to MetaMask',
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
    try {
      const walletConnection = await walletService.connectTrustWallet();
      setConnection(walletConnection);
      
      // Create or get user
      await createOrGetUser(walletConnection.address);
      
      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to Trust Wallet',
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
    } catch (error) {
      console.error('Failed to create/get user:', error);
    }
  };

  const disconnect = async () => {
    await walletService.disconnect();
    setConnection(null);
    setUser(null);
    
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  };

  const updateUser = async (updates: any) => {
    if (!connection) return;
    
    try {
      const response = await apiRequest('PUT', '/api/users/me', updates);
      const updatedUser = await response.json();
      setUser(updatedUser);
      
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
