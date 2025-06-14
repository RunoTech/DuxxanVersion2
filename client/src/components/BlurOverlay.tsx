import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';

export function BlurOverlay() {
  const { isConnected, isConnecting, connectMetaMask, connectTrustWallet } = useWallet();

  if (isConnected) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-duxxan-surface border border-duxxan-border rounded-xl p-8 max-w-md mx-4 text-center animate-slide-up">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-duxxan-text-secondary mb-6">
          Connect your wallet to access all DUXXAN features including raffles and donations.
        </p>
        <div className="space-y-3">
          <Button
            onClick={connectMetaMask}
            disabled={isConnecting}
            className="duxxan-button-primary w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </Button>
          <Button
            onClick={connectTrustWallet}
            disabled={isConnecting}
            variant="outline"
            className="duxxan-button-secondary w-full bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          >
            {isConnecting ? 'Connecting...' : 'Connect Trust Wallet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
