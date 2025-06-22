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
import { Building2, Users, Heart, Clock, Shield, Star, Globe, DollarSign, Target, Hash, Share2 } from 'lucide-react';
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
        <Badge className="bg-emerald-600 text-white px-1.5 py-0.5 text-xs font-bold rounded-full whitespace-nowrap">
          Tamamlandı
        </Badge>
      );
    }
    if (daysLeft <= 0) {
      return (
        <Badge className="bg-red-600 text-white px-1.5 py-0.5 text-xs font-bold rounded-full whitespace-nowrap">
          Bitti
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-600 text-white px-1.5 py-0.5 text-xs font-bold rounded-full whitespace-nowrap">
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
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#FFC929] transition-all rounded-lg overflow-hidden w-full h-[240px] flex flex-col">
        <CardHeader className="p-2 flex-shrink-0">
          <div className="flex justify-between items-start mb-2 gap-2">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={`/api/placeholder/48/48`} />
                <AvatarFallback className="bg-[#FFC929] text-black font-bold text-xs">
                  {donation.creator?.username?.charAt(0).toUpperCase() || 'D'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-gray-900 dark:text-white text-sm font-bold truncate">
                  {donation.title}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                  @{donation.creator?.username || 'anonim'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              <Badge className="bg-[#FFC929] text-black px-1.5 py-0.5 text-xs font-bold rounded-full whitespace-nowrap">
                {donation.category || 'Genel'}
              </Badge>
              {getStatusBadge()}
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 text-xs line-clamp-2 mb-2">
            {donation.description}
          </p>
        </CardHeader>
        
        <CardContent className="p-2 pt-0 flex-1 flex flex-col">
          <div className="space-y-1 mb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <Target className="h-3 w-3 text-[#FFC929] flex-shrink-0" />
                <span className="text-xs">Hedef:</span>
              </div>
              <span className="text-[#FFC929] font-bold text-sm truncate ml-2">
                {formatCurrency(donation.goalAmount)} USDT
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <DollarSign className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                <span className="text-xs">Toplanan:</span>
              </div>
              <span className="text-emerald-600 font-bold text-sm truncate ml-2">
                {formatCurrency(donation.currentAmount)} USDT
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                <Users className="h-3 w-3 text-blue-600 flex-shrink-0" />
                <span className="text-xs">Bağışçı:</span>
              </div>
              <span className="text-blue-600 font-bold text-sm truncate ml-2">
                {donation.donorCount}
              </span>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">İlerleme</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {progress.toFixed(1)}%
              </span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
          
          <div className="flex space-x-2 mb-2">
            <Input
              type="number"
              placeholder="Miktar (USDT)"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="flex-1 text-xs h-7 px-2"
            />
            <Button
              onClick={handleDonate}
              disabled={!isConnected || !donationAmount || parseFloat(donationAmount) <= 0}
              className="bg-[#FFC929] hover:bg-[#FFB800] text-black font-semibold px-3 py-1 text-xs h-7 relative z-10"
            >
              Bağışla
            </Button>
          </div>
          
          <div className="flex gap-2 mt-auto">
            <Link href={`/donations/${donation.id}`} className="flex-1">
              <Button variant="outline" className="w-full border-[#FFC929] text-[#FFC929] hover:bg-[#FFC929] hover:text-black font-semibold text-xs h-7">
                Detaylar
              </Button>
            </Link>
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
        title={donation.title}
        description={donation.description}
        shareUrl={`${window.location.origin}/donations/${donation.id}`}
      />
    </>
  );
}