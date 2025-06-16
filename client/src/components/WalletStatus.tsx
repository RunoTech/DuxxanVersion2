import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Wallet, AlertCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { WalletConnectButton } from './WalletConnectButton';

export function WalletStatus() {
  const { isConnected, address } = useWallet();

  if (!isConnected) {
    return (
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Cüzdan Bağlantısı Gerekli</h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  Platform özelliklerini kullanmak için cüzdanınızı bağlayın
                </p>
              </div>
            </div>
            <WalletConnectButton size="sm" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-green-800 dark:text-green-200">Cüzdan Bağlı</h4>
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">
                Aktif
              </Badge>
            </div>
            <p className="text-sm text-green-600 dark:text-green-300">
              <Wallet className="inline w-4 h-4 mr-1" />
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}