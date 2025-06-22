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
import { Users, Heart, Target, DollarSign, Share2, Calendar } from 'lucide-react';
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

interface DonationCardProps {
  donation: {
    id: number;
    title: string;
    description: string;
    goalAmount: string;
    currentAmount: string;
    donorCount: number;
    endDate: string;
    isUnlimited?: boolean;
    organizationType?: string;
    category?: string;
    country?: string;
    creator: {
      username: string;
      rating: string;
      organizationType?: string;
      organizationVerified?: boolean;
    };
  };
}

export function DonationCard({ donation }: DonationCardProps) {
  const [donationAmount, setDonationAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { isConnected, getApiHeaders } = useWallet();
  const { toast } = useToast();

  const progress = (parseFloat(donation.currentAmount) / parseFloat(donation.goalAmount)) * 100;
  const endDate = new Date(donation.endDate);
  const timeLeft = endDate.getTime() - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const getStatusBadge = () => {
    if (progress >= 100) {
      return (
        <Badge className="bg-emerald-500 text-white text-xs px-2 py-0.5">
          Tamamlandı
        </Badge>
      );
    }
    if (daysLeft <= 0) {
      return (
        <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
          Bitti
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">
        Aktif
      </Badge>
    );
  };

  const contribute = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to donate',
        variant: 'destructive',
      });
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid donation amount',
        variant: 'destructive',
      });
      return;
    }

    setIsContributing(true);
    try {
      // Process blockchain payment first
      const paymentResult = await blockchainService.donate(
        donation.id.toString(),
        donationAmount
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Record donation with transaction hash
      const response = await apiRequest('POST', `/api/donations/${donation.id}/contribute`, {
        headers: await getApiHeaders(),
        body: JSON.stringify({
          amount: donationAmount,
          transactionHash: paymentResult.transactionHash
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record donation');
      }

      toast({
        title: 'Donation Successful!',
        description: `Successfully donated ${donationAmount} USDT`,
      });

      setDonationAmount('');
      // Refresh page to show updated data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Donation Failed',
        description: error.message || 'Failed to process donation',
        variant: 'destructive',
      });
    } finally {
      setIsContributing(false);
    }
  };

  const handleDonate = async () => {
    try {
      await contribute();
    } catch (error) {
      console.error('Donation failed:', error);
    }
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-400/60 transition-all duration-300 rounded-lg overflow-hidden shadow-sm hover:shadow-lg h-[260px] flex flex-col relative z-10 hover:z-20">
        {/* Compact Header */}
        <CardHeader className="p-3 pb-2 flex-shrink-0">
          <div className="flex items-start gap-2 mb-2">
            <Avatar className="h-8 w-8 ring-1 ring-emerald-400/30">
              <AvatarImage src={`/api/placeholder/48/48`} />
              <AvatarFallback className="bg-emerald-500 text-white font-bold text-xs">
                {donation.creator?.username?.charAt(0).toUpperCase() || 'D'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-gray-900 dark:text-white text-sm font-bold truncate">
                {donation.title}
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                @{donation.creator?.username || 'anonim'}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <Badge className="bg-emerald-500 text-white text-xs px-2 py-0.5">
                {donation.category || 'Bağış'}
              </Badge>
              {getStatusBadge()}
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-1">
            {donation.description}
          </p>
        </CardHeader>
        
        {/* Compact Content */}
        <CardContent className="p-3 pt-1 flex-1 flex flex-col">
          {/* Goal Info - Compact */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3 text-emerald-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Hedef:</span>
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(donation.goalAmount)} USDT
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-[#FFC929]" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Toplanan:</span>
              </div>
              <span className="text-sm font-semibold text-[#FFC929]">
                {formatCurrency(donation.currentAmount)} USDT
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Bağışçı:</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {donation.donorCount}
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
          
          {/* Donation Section - Compact */}
          <div className="space-y-2 mt-auto">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Miktar (USDT)"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="flex-1 h-8 text-xs"
              />
              <Button
                onClick={handleDonate}
                disabled={!isConnected || !donationAmount || parseFloat(donationAmount) <= 0 || isContributing}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 h-8 text-xs"
              >
                {isContributing ? 'Bağışlanıyor...' : 'Bağışla'}
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link href={`/donations/${donation.id}`} className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full h-8 text-xs border-emerald-400/50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                >
                  Detaylar
                </Button>
              </Link>
              <Button 
                onClick={() => setShowShareModal(true)}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-emerald-400/50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
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
        title={donation.title}
        description={donation.description}
        shareUrl={`${window.location.origin}/donations/${donation.id}`}
      />
    </>
  );
}