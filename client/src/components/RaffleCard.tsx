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
      <Card className="border border-gray-200 dark:border-gray-700 hover:border-[#FFC929] bg-white dark:bg-gray-800 rounded-lg overflow-hidden h-[240px] flex flex-col hover:shadow-md transition-all">
        <div className="h-16 relative overflow-hidden">
          <img 
            src={getCategoryImage(raffle.category.slug)} 
            alt={raffle.category.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-1 right-1 bg-black text-white px-1.5 py-0.5 rounded text-xs font-medium">
            {raffle.ticketsSold}/{raffle.maxTickets}
          </div>
          <div className="absolute top-1 left-1">
            <Badge className="bg-[#FFC929] text-black font-medium px-2 py-0.5 text-xs rounded">
              {raffle.category.name}
            </Badge>
          </div>
        </div>
      
      <CardContent className="flex-1 flex flex-col p-2">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">{raffle.title}</h3>
          <div className="flex items-center space-x-1">
            <span className="text-[#FFC929] text-xs">★</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{raffle.creator.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">{raffle.description}</p>

        <div className="space-y-1 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">Ödül</span>
            <span className="text-sm font-bold text-[#FFC929]">{raffle.prizeValue} USDT</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">Bilet</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">{raffle.ticketPrice} USDT</span>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">İlerleme</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <div className="flex justify-between items-center mb-2">
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {raffle.category.name}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {daysLeft > 0 ? `${daysLeft} gün` : 'Bitti'}
          </span>
        </div>

        <div className="flex space-x-2 mt-auto">
          <Button 
            onClick={handleBuyTicket}
            disabled={!isConnected || daysLeft <= 0}
            className="flex-1 bg-[#FFC929] hover:bg-[#FFB800] text-black font-semibold text-xs px-3 py-1 h-7"
          >
            Bilet Al
          </Button>
          <Button 
            onClick={() => setShowShareModal(true)}
            variant="outline"
            size="sm"
            className="border-[#FFC929] text-[#FFC929] hover:bg-[#FFC929] hover:text-black px-1.5 py-1 h-7 w-7"
          >
            <Share2 className="h-3 w-3" />
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
