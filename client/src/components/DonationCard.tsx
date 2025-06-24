import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { blockchainService } from '@/lib/blockchain';
import { Link } from 'wouter';
import { Building2, Users, Heart, Clock, Shield, Star, Globe, DollarSign, Target, Hash } from 'lucide-react';
import { CONTRACT_FEES } from '@/lib/contractConstants';
import { ShareModal } from '@/components/ShareModal';

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
  const avgDonation = donation.donorCount > 0 
    ? parseFloat(donation.currentAmount) / donation.donorCount 
    : 0;

  const getStatusBadge = () => {
    if (progress >= 100) {
      return (
        <Badge className="bg-emerald-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold rounded-full whitespace-nowrap">
          Tamamlandı
        </Badge>
      );
    }
    if (daysLeft <= 0) {
      return (
        <Badge className="bg-red-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold rounded-full whitespace-nowrap">
          Bitti
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold rounded-full whitespace-nowrap">
        Aktif
      </Badge>
    );
  };

  const getOrganizationBadge = () => {
    // Always show Bireysel badge for consistency
    return (
      <Badge className="bg-purple-600 text-white px-1.5 py-0.5 text-xs font-medium rounded-md">
        <Heart className="w-2.5 h-2.5 mr-0.5" />
        Bireysel
      </Badge>
    );
  };

  const getCommissionBadge = () => {
    return (
      <Badge className="bg-yellow-600 text-white px-1.5 py-0.5 text-xs font-medium rounded-md">
        <Star className="w-2.5 h-2.5 mr-0.5" />
        %{CONTRACT_FEES.DONATION_COMMISSION_RATE} Komisyon
      </Badge>
    );
  };

  const getCountryFlag = () => {
    const countryFlags: Record<string, string> = {
      TUR: '🇹🇷',
      USA: '🇺🇸',
      GER: '🇩🇪',
      FRA: '🇫🇷',
      GBR: '🇬🇧',
      JPN: '🇯🇵',
      CHN: '🇨🇳',
      IND: '🇮🇳',
    };
    return donation.country ? countryFlags[donation.country] || '🌍' : '🌍';
  };

  const getCategoryImage = (category: string) => {
    const images: Record<string, string> = {
      'health': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      'education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      'disaster': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      'environment': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      'animal': 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      'community': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      'technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      'general': 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    };
    return images[category?.toLowerCase()] || images['general'];
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
      // First, handle blockchain transaction
      const transactionHash = await blockchainService.makeDonation(
        donation.id,
        donationAmount
      );

      // Then record in database
      const response = await apiRequest('POST', `/api/donations/${donation.id}/contribute`, {
        amount: donationAmount,
        transactionHash,
      });

      toast({
        title: 'Bağış Başarılı!',
        description: `${donationAmount} USDT bağışınız için teşekkürler`,
      });

      setDonationAmount('');
    } catch (error: any) {
      toast({
        title: 'Bağış Başarısız',
        description: error.message || 'Bağış işlemi başarısız',
        variant: 'destructive',
      });
    } finally {
      setIsContributing(false);
    }
  };

  const quickDonate = (amount: number) => {
    setDonationAmount(amount.toString());
  };

  const handleCardClick = () => {
    window.location.href = `/donations/${donation.id}`;
  };

  return (
    <Card 
      onClick={handleCardClick}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-[#FFC929] transition-all duration-300 rounded-2xl overflow-hidden w-full cursor-pointer hover:shadow-lg"
    >
      <CardHeader className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <AvatarImage src={`/api/placeholder/48/48`} />
              <AvatarFallback className="bg-[#FFC929] text-black font-bold text-xs sm:text-sm">
                {donation.creator?.username?.charAt(0).toUpperCase() || 'D'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-gray-900 dark:text-white text-sm sm:text-lg font-bold truncate">
                {donation.title}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">
                @{donation.creator?.name || donation.creator?.username || 'anonim'}
                {donation.country && (
                  <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                    {donation.country}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
            <Badge className="bg-[#FFC929] text-black px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold rounded-full whitespace-nowrap">
              {donation.category || 'Genel'}
            </Badge>
            {getStatusBadge()}
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
          {donation.description}
        </p>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-[#FFC929] flex-shrink-0" />
              <span className="text-xs sm:text-sm">Hedef:</span>
            </div>
            <span className="text-[#FFC929] font-bold text-sm sm:text-lg truncate ml-2">
              {formatCurrency(donation.goalAmount)} USDT
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-[#FFC929] flex-shrink-0" />
              <span className="text-xs sm:text-sm">Toplanan:</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm truncate ml-2">
              {formatCurrency(donation.currentAmount)} USDT
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#FFC929] flex-shrink-0" />
              <span className="text-xs sm:text-sm">Bağışçı:</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm truncate ml-2">
              {formatCurrency(donation.donorCount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Bitiş:</span>
            <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm truncate ml-2">
              {new Date(donation.endDate).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-3 sm:mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">İlerleme</span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className="bg-[#FFC929] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 flex-shrink-0">
            <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">{donation.donorCount} bağışçı</span>
          </div>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              toast({
                title: 'Bağış',
                description: 'Bağış yapmak için detay sayfasını ziyaret edin.',
              });
            }}
            size="sm" 
            variant="outline" 
            className="border-[#FFC929] text-[#FFC929] bg-transparent raffle-button-hover transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-shrink-0"
          >
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Bağış Yap
          </Button>
        </div>
        
        {/* Time Left Indicator */}
        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 border border-gray-300 dark:border-gray-600">
          <div className="flex justify-center items-center space-x-2 sm:space-x-4">
            <div className="text-center flex-1">
              <div className="text-[#FFC929] font-bold text-sm sm:text-lg">{Math.max(daysLeft, 0)}</div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">Kalan Gün</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-[#FFC929] font-bold text-sm sm:text-lg">{progress.toFixed(0)}%</div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">Tamamlandı</div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={donation.title}
        description={donation.description}
        url={`/donations/${donation.id}`}
      />
    </Card>
  );
}
