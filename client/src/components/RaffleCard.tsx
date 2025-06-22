import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { blockchainService } from '@/lib/blockchain';
import { ShareModal } from '@/components/ShareModal';
import { Link } from 'wouter';
import { Users, Target, DollarSign, Ticket, Share2, Calendar } from 'lucide-react';
import { CONTRACT_FEES } from '@/lib/contractConstants';

// Helper function to format numbers
const formatCurrency = (value: string | number) => {
  const num = parseFloat(value.toString());
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num % 1 === 0) {
    return num.toString();
  } else {
    return num.toFixed(1);
  }
};

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
    category?: { name: string };
    creator: {
      username: string;
      rating?: string;
    };
  };
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const [ticketQuantity, setTicketQuantity] = useState('1');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { isConnected, getApiHeaders } = useWallet();
  const { toast } = useToast();

  const progress = (raffle.ticketsSold / raffle.maxTickets) * 100;
  const endDate = new Date(raffle.endDate);
  const timeLeft = endDate.getTime() - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const getStatusBadge = () => {
    if (raffle.ticketsSold >= raffle.maxTickets) {
      return (
        <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
          Tamamlandı
        </Badge>
      );
    }
    if (daysLeft <= 0) {
      return (
        <Badge className="bg-gray-500 text-white text-xs px-2 py-0.5">
          Bitti
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500 text-white text-xs px-2 py-0.5">
        Aktif
      </Badge>
    );
  };

  const handleBuyTicket = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to buy tickets',
        variant: 'destructive',
      });
      return;
    }

    const quantity = parseInt(ticketQuantity);
    if (!quantity || quantity <= 0) {
      toast({
        title: 'Invalid Quantity',
        description: 'Please enter a valid ticket quantity',
        variant: 'destructive',
      });
      return;
    }

    if (quantity > (raffle.maxTickets - raffle.ticketsSold)) {
      toast({
        title: 'Not Enough Tickets',
        description: 'Not enough tickets available',
        variant: 'destructive',
      });
      return;
    }

    setIsPurchasing(true);
    try {
      const totalAmount = (parseFloat(raffle.ticketPrice) * quantity).toString();
      
      // Process blockchain payment first
      const paymentResult = await blockchainService.buyTicket(
        raffle.id.toString(),
        quantity.toString(),
        totalAmount
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Record ticket purchase with transaction hash
      const response = await apiRequest('POST', `/api/raffles/${raffle.id}/buy-ticket`, {
        headers: await getApiHeaders(),
        body: JSON.stringify({
          quantity,
          transactionHash: paymentResult.transactionHash
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record ticket purchase');
      }

      toast({
        title: 'Tickets Purchased!',
        description: `Successfully bought ${quantity} ticket(s)`,
      });

      setTicketQuantity('1');
      // Refresh page to show updated data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to buy tickets',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#FFC929]/60 transition-all duration-300 rounded-lg overflow-hidden shadow-sm hover:shadow-lg h-[260px] flex flex-col">
        {/* Compact Header */}
        <CardHeader className="p-3 pb-2 flex-shrink-0">
          <div className="flex items-start gap-2 mb-2">
            <Avatar className="h-8 w-8 ring-1 ring-[#FFC929]/30">
              <AvatarImage src={`/api/placeholder/48/48`} />
              <AvatarFallback className="bg-[#FFC929] text-black font-bold text-xs">
                {raffle.creator?.username?.charAt(0).toUpperCase() || 'R'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-gray-900 dark:text-white text-sm font-bold truncate">
                {raffle.title}
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                @{raffle.creator?.username || 'anonim'}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <Badge className="bg-[#FFC929] text-black text-xs px-2 py-0.5">
                {raffle.category?.name || 'Çekiliş'}
              </Badge>
              {getStatusBadge()}
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-1">
            {raffle.description}
          </p>
        </CardHeader>
        
        {/* Compact Content */}
        <CardContent className="p-3 pt-1 flex-1 flex flex-col">
          {/* Prize Info - Compact */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-[#FFC929]" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Ödül:</span>
              </div>
              <span className="text-sm font-bold text-[#FFC929]">
                {formatCurrency(raffle.prizeValue)} USDT
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Ticket className="h-3 w-3 text-emerald-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Bilet:</span>
              </div>
              <span className="text-sm font-semibold text-emerald-600">
                {formatCurrency(raffle.ticketPrice)} USDT
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Satış:</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {raffle.ticketsSold}/{raffle.maxTickets}
              </span>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">İlerleme</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {progress.toFixed(1)}%
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          
          {/* Time */}
          <div className="flex items-center gap-1 mb-3">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {daysLeft > 0 ? `${daysLeft} gün kaldı` : 'Süresi doldu'}
            </span>
          </div>
          
          {/* Purchase Section - Compact */}
          <div className="space-y-2 mt-auto">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Adet"
                value={ticketQuantity}
                onChange={(e) => setTicketQuantity(e.target.value)}
                min="1"
                max={raffle.maxTickets - raffle.ticketsSold}
                className="flex-1 h-8 text-xs"
              />
              <Button
                onClick={handleBuyTicket}
                disabled={!isConnected || isPurchasing || raffle.ticketsSold >= raffle.maxTickets || daysLeft <= 0}
                className="bg-[#FFC929] hover:bg-[#FFB800] text-black font-semibold px-3 h-8 text-xs"
              >
                {isPurchasing ? 'Alınıyor...' : 'Al'}
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link href={`/raffles/${raffle.id}`} className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full h-8 text-xs border-[#FFC929]/50 text-[#FFC929] hover:bg-[#FFC929] hover:text-black"
                >
                  Detaylar
                </Button>
              </Link>
              <Button 
                onClick={() => setShowShareModal(true)}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-[#FFC929]/50 text-[#FFC929] hover:bg-[#FFC929] hover:text-black"
              >
                <Share2 className="h-3 w-3" />
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
        shareUrl={`${window.location.origin}/raffles/${raffle.id}`}
      />
    </>
  );
}