import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';

export function BlurOverlay() {
  const { isConnected, isConnecting, connectMetaMask, connectTrustWallet } = useWallet();

  if (isConnected) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 max-w-md mx-4 text-center animate-slide-up">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cüzdanınızı Bağlayın</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Çekilişler ve bağışlar dahil tüm DUXXAN özelliklerine erişmek için cüzdanınızı bağlayın.
        </p>
        <div className="space-y-3">
          <Button
            onClick={connectMetaMask}
            disabled={isConnecting}
            className="bg-yellow-500 hover:bg-yellow-600 text-black w-full"
          >
            {isConnecting ? 'Bağlanıyor...' : 'MetaMask Bağla'}
          </Button>
          <Button
            onClick={connectTrustWallet}
            disabled={isConnecting}
            variant="outline"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          >
            {isConnecting ? 'Bağlanıyor...' : 'Trust Wallet Bağla'}
          </Button>
        </div>
      </div>
    </div>
  );
}
