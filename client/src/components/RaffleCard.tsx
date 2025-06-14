import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { blockchainService } from '@/lib/blockchain';
import { Link } from 'wouter';

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

  const progress = (raffle.ticketsSold / raffle.maxTickets) * 100;
  const endDate = new Date(raffle.endDate);
  const timeLeft = endDate.getTime() - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const getCategoryIcon = (slug: string) => {
    const icons: Record<string, string> = {
      'cars': '🏎️',
      'electronics': '📱',
      'jewelry': '💎',
      'real-estate': '🏠',
      'art': '🎨',
      'home': '🏡',
    };
    return icons[slug] || '🎁';
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
        title: 'Tickets Purchased!',
        description: `Successfully purchased ${quantity} ticket(s)`,
      });
    } catch (error: any) {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to purchase tickets',
        variant: 'destructive',
      });
    }
  };

  return (
    <Link href={`/raffles/${raffle.id}`}>
      <Card className="duxxan-card-hover cursor-pointer">
        <div className={`h-48 bg-gradient-to-br ${getCategoryColor(raffle.category.slug)} flex items-center justify-center relative overflow-hidden`}>
          <div className="text-center">
            <div className="text-4xl mb-2">{getCategoryIcon(raffle.category.slug)}</div>
            <Badge variant="secondary" className="bg-black bg-opacity-50 text-white">
              {raffle.category.name}
            </Badge>
          </div>
        </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-white">{raffle.title}</h3>
          <div className="flex items-center space-x-1">
            <span className="text-duxxan-yellow text-sm">★</span>
            <span className="text-sm text-duxxan-text-secondary">{raffle.creator.rating}</span>
          </div>
        </div>
        
        <p className="text-duxxan-text-secondary mb-4 text-sm line-clamp-2">
          {raffle.description}
        </p>

        <div className="bg-duxxan-dark rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-duxxan-text-secondary">Tickets Sold</span>
            <span className="text-sm font-bold text-duxxan-success">
              {raffle.ticketsSold.toLocaleString()} / {raffle.maxTickets.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="mb-2" />
          <div className="text-xs text-duxxan-text-secondary">
            {progress < 50 ? '🚀 Just getting started!' : progress < 80 ? '🔥 Heating up!' : '⚡ Almost sold out!'}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm text-duxxan-text-secondary">Ticket Price</div>
            <div className="text-lg font-bold text-duxxan-yellow">
              {parseFloat(raffle.ticketPrice).toLocaleString()} USDT
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-duxxan-text-secondary">
              {daysLeft > 0 ? 'Ends In' : 'Ended'}
            </div>
            <div className="text-lg font-bold">
              {daysLeft > 0 ? `${daysLeft}d` : 'Ended'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => buyTickets(1)}
            disabled={!isConnected || daysLeft <= 0}
            className="duxxan-button-primary w-full"
          >
            Buy 1 Ticket
          </Button>
          
          {raffle.ticketsSold < raffle.maxTickets * 0.8 && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => buyTickets(5)}
                disabled={!isConnected || daysLeft <= 0}
                variant="outline"
                className="duxxan-button-secondary text-sm"
              >
                Buy 5 Tickets
              </Button>
              <Button
                onClick={() => buyTickets(10)}
                disabled={!isConnected || daysLeft <= 0}
                variant="outline"
                className="duxxan-button-secondary text-sm"
              >
                Buy 10 Tickets
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-duxxan-border text-center">
          <span className="text-xs text-duxxan-text-secondary">
            Prize Value: <span className="text-duxxan-yellow font-semibold">
              ${parseFloat(raffle.prizeValue).toLocaleString()}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
