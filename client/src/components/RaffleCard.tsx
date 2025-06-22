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
import { Users, Gift, Clock, Target, DollarSign, Ticket, Share2, Calendar } from 'lucide-react';
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
        <Badge className="bg-red-500 text-white text-xs font-medium px-2 py-1">
          Tamamlandı
        </Badge>
      );
    }
    if (daysLeft <= 0) {
      return (
        <Badge className="bg-gray-500 text-white text-xs font-medium px-2 py-1">
          Bitti
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500 text-white text-xs font-medium px-2 py-1">
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
      <Card className="group bg-white dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/50 hover:border-[#FFC929]/60 transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-xl h-[320px] flex flex-col">
        {/* Header Section */}
        <CardHeader className="p-4 pb-3 flex-shrink-0 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 ring-2 ring-[#FFC929]/20">
                <AvatarImage src={`/api/placeholder/48/48`} />
                <AvatarFallback className="bg-gradient-to-br from-[#FFC929] to-[#FFB800] text-black font-bold text-sm">
                  {raffle.creator?.username?.charAt(0).toUpperCase() || 'R'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-gray-900 dark:text-white text-base font-bold truncate leading-tight">
                  {raffle.title}
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                  @{raffle.creator?.username || 'anonim'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <Badge className="bg-[#FFC929] text-black text-xs font-semibold px-2.5 py-1">
                {raffle.category?.name || 'Çekiliş'}
              </Badge>
              {getStatusBadge()}
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mt-3 leading-relaxed">
            {raffle.description}
          </p>
        </CardHeader>
        
        {/* Content Section */}
        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          {/* Prize and Ticket Info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-black" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ödül</span>
              </div>
              <span className="text-lg font-bold text-[#FFC929]">
                {formatCurrency(raffle.prizeValue)} USDT
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Ticket className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bilet</span>
              </div>
              <span className="text-base font-semibold text-emerald-600">
                {formatCurrency(raffle.ticketPrice)} USDT
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Satış</span>
              </div>
              <span className="text-base font-semibold text-blue-600">
                {raffle.ticketsSold}/{raffle.maxTickets}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">İlerleme</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {progress.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-gray-200 dark:bg-gray-700" 
            />
          </div>
          
          {/* Time Left */}
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {daysLeft > 0 ? `${daysLeft} gün kaldı` : 'Süresi doldu'}
            </span>
          </div>
          
          {/* Purchase Section */}
          <div className="space-y-3 mt-auto">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Adet"
                value={ticketQuantity}
                onChange={(e) => setTicketQuantity(e.target.value)}
                min="1"
                max={raffle.maxTickets - raffle.ticketsSold}
                className="flex-1 h-9 text-sm border-gray-300 dark:border-gray-600 focus:border-[#FFC929] focus:ring-[#FFC929]/20"
              />
              <Button
                onClick={handleBuyTicket}
                disabled={!isConnected || isPurchasing || raffle.ticketsSold >= raffle.maxTickets || daysLeft <= 0}
                className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold px-4 h-9 text-sm shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isPurchasing ? 'Alınıyor...' : 'Al'}
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link href={`/raffles/${raffle.id}`} className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full h-9 text-sm border-[#FFC929]/50 text-[#FFC929] hover:bg-[#FFC929] hover:text-black transition-all duration-200"
                >
                  Detaylar
                </Button>
              </Link>
              <Button 
                onClick={() => setShowShareModal(true)}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 border-[#FFC929]/50 text-[#FFC929] hover:bg-[#FFC929] hover:text-black transition-all duration-200"
              >
                <Share2 className="h-4 w-4" />
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