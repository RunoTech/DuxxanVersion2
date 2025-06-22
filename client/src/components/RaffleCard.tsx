import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { blockchainService } from '@/lib/blockchain';
import { ShareModal } from '@/components/ShareModal';
import { Link } from 'wouter';
import { Share2 } from 'lucide-react';

interface RaffleCardProps {
  raffle: {
    id: number;
    title: string;
    description: string;
    prizeValue: string;
    ticketPrice: string;
    maxTickets: number;
    ticketsSold: number;
    endDate: string;
    category: {
      name: string;
      slug: string;
    };
    creator: {
      username: string;
      rating: string;
    };
  };
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const { isConnected, getApiHeaders } = useWallet();
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);

  const progress = (raffle.ticketsSold / raffle.maxTickets) * 100;
  const endDate = new Date(raffle.endDate);
  const timeLeft = endDate.getTime() - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const getCategoryImage = (slug: string) => {
    const images: Record<string, string> = {
      'cars': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop&crop=center',
      'electronics': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=400&fit=crop&crop=center',
      'jewelry': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop&crop=center',
      'real-estate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop&crop=center',
      'art': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center',
      'home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop&crop=center',
    };
    return images[slug] || 'https://images.unsplash.com/photo-1549399597-07e1f647b045?w=600&h=400&fit=crop&crop=center';
  };

  const getCategoryColor = (slug: string) => {
    const colors: Record<string, string> = {
      'cars': 'from-red-600 to-red-800',
      'electronics': 'from-blue-600 to-blue-800',
      'jewelry': 'from-purple-600 to-purple-800',
      'real-estate': 'from-green-600 to-green-800',
      'art': 'from-pink-600 to-pink-800',
      'home': 'from-orange-600 to-orange-800',
    };
    return colors[slug] || 'from-gray-600 to-gray-800';
  };

  const buyTickets = async (quantity: number = 1) => {
    if (!isConnected) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to buy tickets',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First, handle blockchain transaction
      const transactionHash = await blockchainService.buyTickets(
        raffle.id,
        quantity,
        raffle.ticketPrice
      );

      // Then record in database
      const response = await apiRequest('POST', '/api/tickets', {
        raffleId: raffle.id,
        quantity,
        totalAmount: (parseFloat(raffle.ticketPrice) * quantity).toString(),
        transactionHash,
      });

      toast({
        title: 'Biletler Satın Alındı!',
        description: `${quantity} bilet başarıyla satın alındı`,
      });
    } catch (error: any) {
      toast({
        title: 'Satın Alma Başarısız',
        description: error.message || 'Bilet satın alma başarısız',
        variant: 'destructive',
      });
    }
  };

  return (
    <Link href={`/raffles/${raffle.id}`}>
      <Card className="border border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-400 bg-white dark:bg-gray-800 rounded-xl overflow-hidden h-[360px] flex flex-col hover:shadow-lg transition-all duration-300">
        <div className="h-16 relative overflow-hidden">
          <img 
            src={getCategoryImage(raffle.category.slug)} 
            alt={raffle.category.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <div className="absolute top-4 left-4">
              <Badge className="bg-yellow-500 text-black font-semibold px-3 py-1 rounded-md">
                {raffle.category.name}
              </Badge>
            </div>
          </div>
        </div>
      
      <CardContent className="flex-1 flex flex-col p-3">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{raffle.title}</h3>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{raffle.creator.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
          {raffle.description}
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Satılan Biletler</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {raffle.ticketsSold.toLocaleString()} / {raffle.maxTickets.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>{progress.toFixed(1)}% satıldı</span>
            <span>{progress < 50 ? 'Yeni başlıyor!' : progress < 80 ? 'Kızışıyor!' : 'Neredeyse tükendi!'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 mt-auto">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {parseFloat(raffle.ticketPrice).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Bilet Fiyatı (USDT)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {daysLeft > 0 ? daysLeft : 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Kalan Gün</div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => buyTickets(1)}
            disabled={!isConnected || daysLeft <= 0}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 rounded-lg"
          >
            Bilet Al
          </Button>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Ödül: <span className="text-gray-900 dark:text-white font-medium">
                {parseFloat(raffle.prizeValue).toLocaleString()} USDT
              </span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              <span className="text-gray-900 dark:text-white font-medium">{raffle.creator.username}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <ShareModal
      isOpen={showShareModal}
      onClose={() => setShowShareModal(false)}
      title={raffle.title}
      description={raffle.description}
      url={`/raffles/${raffle.id}`}
    />
    </Link>
  );
}
