import { useState, useEffect } from 'react';
import { WalletManager, type WalletConnection } from '@/lib/wallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function useWallet() {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const createOrGetUser = async (walletAddress: string) => {
    try {
      // First try to authenticate with the wallet address
      const response = await apiRequest('POST', '/api/users/auth/wallet', {
        walletAddress: walletAddress.toLowerCase()
      });
      
      const userData = await response.json();
      
      // Store authentication state in localStorage for persistence
      if (userData && userData.success) {
        localStorage.setItem('wallet_authenticated', 'true');
        localStorage.setItem('wallet_address', walletAddress.toLowerCase());
        setUser(userData.data); // Set the user data
      }
      
      return userData;
    } catch (error: any) {
      console.error('Wallet authentication failed:', error);
      localStorage.removeItem('wallet_authenticated');
      localStorage.removeItem('wallet_address');
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    // Check for existing connection on mount
    const walletManager = WalletManager.getInstance();
    const existingConnection = walletManager.getConnection();
    
    // Also check localStorage for stored connection
    const storedConnection = localStorage.getItem('wallet_connection');
    const storedAuth = localStorage.getItem('wallet_authenticated') === 'true';
    
    if (existingConnection && storedAuth) {
      setConnection(existingConnection);
      // Restore user data from localStorage
      const storedAddress = localStorage.getItem('wallet_address');
      if (storedAddress) {
        setUser({ walletAddress: storedAddress });
      }
    } else if (storedConnection && storedAuth) {
      // Restore connection from localStorage
      try {
        const parsedConnection = JSON.parse(storedConnection);
        setConnection(parsedConnection);
        const storedAddress = localStorage.getItem('wallet_address');
        if (storedAddress) {
          setUser({ walletAddress: storedAddress });
        }
      } catch (error) {
        console.error('Failed to restore connection from localStorage:', error);
        localStorage.removeItem('wallet_connection');
      }
    }

    // Listen for connection changes - reduced logging
    const handleConnectionChange = (connected: boolean, address?: string) => {
      if (!connected) {
        setConnection(null);
        setUser(null);
        localStorage.removeItem('wallet_connection');
        localStorage.removeItem('wallet_authenticated');
        localStorage.removeItem('wallet_address');
      } else if (address) {
        const walletManager = WalletManager.getInstance();
        const currentConnection = walletManager.getConnection();
        if (currentConnection && currentConnection.address !== connection?.address) {
          setConnection(currentConnection);
        }
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
      
      // Force state update immediately
      setConnection(newConnection);

      // Create or get user
      await createOrGetUser(newConnection.address);

      toast({
        title: 'Cüzdan Bağlandı',
        description: `${newConnection.address.slice(0, 6)}...${newConnection.address.slice(-4)} adresine bağlandınız`,
      });

      // Multiple state updates with different timing to ensure UI refresh
      setTimeout(() => {
        console.log('Force updating connection state');
        setConnection(null);
        setTimeout(() => setConnection(newConnection), 50);
        setTimeout(() => setConnection({ ...newConnection }), 150);
      }, 100);

      return newConnection;
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      
      // Provide Turkish error messages based on error type
      let errorTitle = 'Bağlantı Başarısız';
      let errorDescription = 'Cüzdan bağlantısı başarısız oldu';
      
      if (error.code === 4001) {
        errorTitle = 'Bağlantı Reddedildi';
        errorDescription = 'Cüzdan bağlantı isteğini onaylamanız gerekiyor';
      } else if (error.code === -32002) {
        errorTitle = 'Bekleyen İstek';
        errorDescription = 'Cüzdan uygulamanızı kontrol edin ve bekleyen isteği onaylayın';
      } else if (error.message?.includes('iframe') || error.message?.includes('frames-disallowed')) {
        errorTitle = 'Güvenlik Kısıtlaması';
        errorDescription = 'Bu sayfayı doğrudan tarayıcınızda açmanız gerekiyor. Lütfen yeni sekmede deneyin.';
      } else if (error.message?.includes('not found') || error.message?.includes('not installed')) {
        errorTitle = 'Cüzdan Bulunamadı';
        errorDescription = 'Lütfen MetaMask veya Trust Wallet uygulamasını yükleyin';
      } else if (error.message?.includes('timeout')) {
        errorTitle = 'Zaman Aşımı';
        errorDescription = 'Bağlantı zaman aşımına uğradı, tekrar deneyin';
      } else if (error.message?.includes('User rejected')) {
        errorTitle = 'İstek Reddedildi';
        errorDescription = 'Cüzdan bağlantı isteğini onaylamanız gerekiyor';
      } else if (error.message?.includes('dapp')) {
        errorTitle = 'DApp Hatası';
        errorDescription = 'Sayfayı yeniden yükleyin ve tekrar deneyin';
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
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
              setUser({ walletAddress: connection.address.toLowerCase() });
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
      setUser(null);
      
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

  const getApiHeaders = () => {
    return connection?.address ? {
      'x-wallet-address': connection.address.toLowerCase()
    } : {};
  };

  const isConnected = !!connection;
  const address = connection?.address;
  const chainId = connection?.chainId;

  // console.log('useWallet state:', { isConnected, hasConnection: !!connection, address });

  return {
    connection,
    isConnected,
    address,
    chainId,
    user,
    isConnecting,
    connectWallet,
    disconnectWallet,
    getApiHeaders,
  };
}