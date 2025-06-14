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
      <Card className="bg-white dark:bg-duxxan-surface border-2 border-duxxan-yellow/80 dark:border-duxxan-border hover:shadow-lg hover:border-duxxan-yellow dark:hover:border-duxxan-yellow transition-all duration-300 cursor-pointer">
        <div className="h-48 relative overflow-hidden rounded-t-lg">
          <img 
            src={getCategoryImage(raffle.category.slug)} 
            alt={raffle.category.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Badge variant="secondary" className="bg-duxxan-yellow text-black font-semibold">
                {raffle.category.name}
              </Badge>
            </div>
          </div>
        </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{raffle.title}</h3>
          <div className="flex items-center space-x-1">
            <span className="text-duxxan-yellow text-sm">★</span>
            <span className="text-sm text-gray-600 dark:text-duxxan-text-secondary">{raffle.creator.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-duxxan-text-secondary mb-4 text-sm line-clamp-2">
          {raffle.description}
        </p>

        <div className="bg-gradient-to-r from-duxxan-yellow/10 to-duxxan-yellow/5 dark:bg-duxxan-dark rounded-lg p-4 mb-4 border border-duxxan-yellow/20 dark:border-duxxan-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-duxxan-text-secondary">Satılan Biletler</span>
            <span className="text-sm font-bold text-duxxan-success">
              {raffle.ticketsSold.toLocaleString()} / {raffle.maxTickets.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="mb-2" />
          <div className="text-xs text-gray-600 dark:text-duxxan-text-secondary">
            {progress < 50 ? '🚀 Yeni başlıyor!' : progress < 80 ? '🔥 Kızışıyor!' : '⚡ Neredeyse tükendi!'}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-duxxan-text-secondary">Bilet Fiyatı</div>
            <div className="text-lg font-bold text-duxxan-yellow">
              {parseFloat(raffle.ticketPrice).toLocaleString()} USDT
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-duxxan-text-secondary">
              {daysLeft > 0 ? 'Bitiş' : 'Bitti'}
            </div>
            <div className="text-lg font-bold">
              {daysLeft > 0 ? `${daysLeft}g` : 'Bitti'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => buyTickets(1)}
            disabled={!isConnected || daysLeft <= 0}
            className="duxxan-button-primary w-full"
          >
            1 Bilet Al
          </Button>
          
          {raffle.ticketsSold < raffle.maxTickets * 0.8 && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => buyTickets(5)}
                disabled={!isConnected || daysLeft <= 0}
                variant="outline"
                className="duxxan-button-secondary text-sm"
              >
                5 Bilet Al
              </Button>
              <Button
                onClick={() => buyTickets(10)}
                disabled={!isConnected || daysLeft <= 0}
                variant="outline"
                className="duxxan-button-secondary text-sm"
              >
                10 Bilet Al
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-duxxan-border flex items-center justify-between">
          <span className="text-xs text-duxxan-text-secondary">
            Prize Value: <span className="text-duxxan-yellow font-semibold">
              ${parseFloat(raffle.prizeValue).toLocaleString()}
            </span>
          </span>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowShareModal(true);
            }}
            variant="ghost"
            size="icon"
            className="text-duxxan-text-secondary hover:text-duxxan-yellow"
          >
            <Share2 className="h-4 w-4" />
          </Button>
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
