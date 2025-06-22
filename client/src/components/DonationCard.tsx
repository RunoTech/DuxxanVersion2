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
import { Users, Heart, Clock, Target, DollarSign, Share2, Calendar, TrendingUp } from 'lucide-react';
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
        <Badge className="bg-emerald-500 text-white text-xs font-medium px-2 py-1">
          Tamamlandı
        </Badge>
      );
    }
    if (daysLeft <= 0) {
      return (
        <Badge className="bg-red-500 text-white text-xs font-medium px-2 py-1">
          Bitti
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500 text-white text-xs font-medium px-2 py-1">
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
      <Card className="group bg-white dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/50 hover:border-emerald-400/60 transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-xl h-[320px] flex flex-col">
        {/* Header Section */}
        <CardHeader className="p-4 pb-3 flex-shrink-0 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 ring-2 ring-emerald-400/20">
                <AvatarImage src={`/api/placeholder/48/48`} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-sm">
                  {donation.creator?.username?.charAt(0).toUpperCase() || 'D'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-gray-900 dark:text-white text-base font-bold truncate leading-tight">
                  {donation.title}
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                  @{donation.creator?.username || 'anonim'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <Badge className="bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1">
                {donation.category || 'Bağış'}
              </Badge>
              {getStatusBadge()}
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mt-3 leading-relaxed">
            {donation.description}
          </p>
        </CardHeader>
        
        {/* Content Section */}
        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          {/* Goal and Current Info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Hedef</span>
              </div>
              <span className="text-lg font-bold text-emerald-600">
                {formatCurrency(donation.goalAmount)} USDT
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-black" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplanan</span>
              </div>
              <span className="text-base font-semibold text-[#FFC929]">
                {formatCurrency(donation.currentAmount)} USDT
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bağışçı</span>
              </div>
              <span className="text-base font-semibold text-blue-600">
                {donation.donorCount}
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
          
          {/* Donation Section */}
          <div className="space-y-3 mt-auto">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Miktar (USDT)"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="flex-1 h-9 text-sm border-gray-300 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
              <Button
                onClick={handleDonate}
                disabled={!isConnected || !donationAmount || parseFloat(donationAmount) <= 0 || isContributing}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-4 h-9 text-sm shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isContributing ? 'Bağışlanıyor...' : 'Bağışla'}
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Link href={`/donations/${donation.id}`} className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full h-9 text-sm border-emerald-400/50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200"
                >
                  Detaylar
                </Button>
              </Link>
              <Button 
                onClick={() => setShowShareModal(true)}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 border-emerald-400/50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200"
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
        title={donation.title}
        description={donation.description}
        shareUrl={`${window.location.origin}/donations/${donation.id}`}
      />
    </>
  );
}