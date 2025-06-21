import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { blockchainService } from '@/lib/blockchain';
import { Link } from 'wouter';
import { Building2, Users, Heart, Clock, Shield, Star, Globe } from 'lucide-react';
import { CONTRACT_FEES } from '@/lib/contractConstants';

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
        <Badge className="bg-green-600 text-white px-2 py-0.5 text-xs font-bold rounded-full">
          Aktif
        </Badge>
      );
    }
    if (daysLeft <= 0) {
      return (
        <Badge className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold rounded-full">
          Bitti
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-600 text-white px-2 py-0.5 text-xs font-bold rounded-full">
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

  return (
    <Link href={`/donations/${donation.id}`}>
      <Card className="border border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-400 bg-white dark:bg-gray-800 rounded-xl overflow-hidden h-[480px] flex flex-col hover:shadow-lg transition-all duration-300">
        {/* Header with category image */}
        <div className="relative h-40 overflow-hidden">
          <img 
            src={getCategoryImage(donation.category || 'general')} 
            alt={donation.category || 'Bağış'}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=400&fit=crop&crop=center';
            }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          
          {/* Status and category badges */}
          <div className="absolute top-3 left-3">
            {getStatusBadge()}
          </div>
          <div className="absolute top-3 right-3">
            {donation.category && (
              <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 font-medium px-3 py-1 text-xs">
                {donation.category}
              </Badge>
            )}
          </div>
          
          {/* Heart icon overlay */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Heart className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      
      <CardContent className="flex-1 flex flex-col p-4">
          {/* Title and rating */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              {donation.title}
            </h3>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{donation.creator.rating}</span>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
            {donation.description}
          </p>

          {/* Progress section */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">İlerleme</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {parseFloat(donation.currentAmount).toLocaleString()} / {parseFloat(donation.goalAmount).toLocaleString()} USDT
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>{progress.toFixed(1)}% tamamlandı</span>
              <span>{donation.donorCount} bağışçı</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 mt-auto">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {parseFloat(donation.goalAmount).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Hedef (USDT)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {daysLeft > 0 ? daysLeft : 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Kalan Gün</div>
            </div>
          </div>

          {/* Action button */}
          <div className="space-y-3">
            <Button
              onClick={contribute}
              disabled={!isConnected || daysLeft <= 0}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 rounded-lg"
            >
              Bağış Yap
            </Button>

            {/* Creator info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                <span className="text-gray-900 dark:text-white font-medium">{donation.creator.username}</span>
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {avgDonation > 0 ? `Ort: ${avgDonation.toFixed(0)} USDT` : 'İlk bağış'}
              </span>
            </div>
          </div>
      </CardContent>
    </Card>
    </Link>
  );
}
