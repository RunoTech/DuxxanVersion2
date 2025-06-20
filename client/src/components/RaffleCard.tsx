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
      <Card className="border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden h-[580px] flex flex-col">
        <div className="h-52 relative overflow-hidden">
          <img 
            src={getCategoryImage(raffle.category.slug)} 
            alt={raffle.category.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
            <div className="absolute top-4 left-4">
              <Badge className="bg-yellow-500 text-white font-semibold px-3 py-1">
                {raffle.category.name}
              </Badge>
            </div>
          </div>
        </div>
      
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{raffle.title}</h3>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{raffle.creator.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed flex-1 line-clamp-3">
          {raffle.description}
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Satılan Biletler</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {raffle.ticketsSold.toLocaleString()} / {raffle.maxTickets.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="mb-2 h-2" />
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {progress < 50 ? 'Yeni başlıyor!' : progress < 80 ? 'Kızışıyor!' : 'Neredeyse tükendi!'}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 mt-auto">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bilet Fiyatı</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {parseFloat(raffle.ticketPrice).toLocaleString()} USDT
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {daysLeft > 0 ? 'Bitiş' : 'Bitti'}
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {daysLeft > 0 ? `${daysLeft}g` : 'Bitti'}
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <Button
            onClick={() => buyTickets(1)}
            disabled={!isConnected || daysLeft <= 0}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl text-base"
          >
            Bilet Al
          </Button>

          <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Ödül Değeri: <span className="text-gray-900 dark:text-white font-bold">
              {parseFloat(raffle.prizeValue).toLocaleString()} USDT
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
            className="text-gray-600 dark:text-gray-400 hover:text-yellow-500"
          >
            <Share2 className="h-5 w-5" />
          </Button>
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
