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
      <Card className="group relative border-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 rounded-3xl overflow-hidden h-[580px] flex flex-col shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1">
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 p-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full h-full bg-gray-900 rounded-3xl"></div>
        </div>
        
        {/* Header with dynamic gradient background */}
        <div className="relative h-52 overflow-hidden rounded-t-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm"></div>
          <div className="absolute bottom-8 left-8 w-8 h-8 bg-yellow-400/20 rounded-lg rotate-45"></div>
          
          {/* Heart icon with pulsing effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Heart className="w-20 h-20 text-white/90 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>
          
          {/* Status and category badges */}
          <div className="absolute top-4 left-4">
            {getStatusBadge()}
          </div>
          <div className="absolute top-4 right-4">
            {donation.category && (
              <Badge className="bg-yellow-500/90 backdrop-blur-sm text-black font-bold px-4 py-2 rounded-full text-sm shadow-lg">
                {donation.category}
              </Badge>
            )}
          </div>
        </div>
      
      <CardContent className="relative flex-1 flex flex-col p-6 bg-gray-900 z-10">
          {/* Header with title and rating */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-white leading-tight tracking-tight group-hover:text-yellow-100 transition-colors duration-300">
              {donation.title}
            </h3>
            <div className="flex items-center space-x-1 bg-gray-800/50 rounded-full px-3 py-1 backdrop-blur-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 text-sm font-bold">{donation.creator.rating}</span>
            </div>
          </div>
          
          {/* Description with better typography */}
          <p className="text-gray-300 mb-6 text-sm leading-relaxed line-clamp-2 opacity-90">
            {donation.description}
          </p>

          {/* Progress section with modern styling */}
          <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-gray-600/30">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-300 font-semibold tracking-wide">FONLAMA DURUMU</span>
              <div className="text-right">
                <div className="text-sm font-bold text-white">
                  {parseFloat(donation.currentAmount).toLocaleString()} USDT
                </div>
                <div className="text-xs text-gray-400">
                  / {parseFloat(donation.goalAmount).toLocaleString()} USDT
                </div>
              </div>
            </div>
            
            {/* Enhanced progress bar */}
            <div className="relative w-full bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                {progress.toFixed(0)}%
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-yellow-400 font-medium uppercase tracking-wider">
                {progress < 30 ? '🚀 Başlangıç' : progress < 70 ? '🔥 Hızlanıyor' : progress < 95 ? '⚡ Son sürat' : '🎯 Hedefte!'}
              </span>
              <span className="text-xs text-gray-400">
                {donation.donorCount} bağışçı
              </span>
            </div>
          </div>

          {/* Stats section with modern grid */}
          <div className="grid grid-cols-3 gap-3 mb-6 mt-auto">
            <div className="bg-gray-800/60 rounded-xl p-3 text-center border border-gray-700/50">
              <div className="text-yellow-400 text-xs font-semibold mb-1">HEDEF</div>
              <div className="text-sm font-bold text-white">
                {(parseFloat(donation.goalAmount) / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-3 text-center border border-gray-700/50">
              <div className="text-green-400 text-xs font-semibold mb-1">TOPLANAN</div>
              <div className="text-sm font-bold text-white">
                {(parseFloat(donation.currentAmount) / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-3 text-center border border-gray-700/50">
              <div className="text-blue-400 text-xs font-semibold mb-1">SÜRE</div>
              <div className="text-sm font-bold text-white">
                {daysLeft > 0 ? `${daysLeft}g` : 'Bitti'}
              </div>
            </div>
          </div>

          {/* Action button with premium styling */}
          <div className="space-y-4">
            <Button
              onClick={contribute}
              disabled={!isConnected || daysLeft <= 0}
              className="w-full relative bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 hover:from-yellow-300 hover:via-orange-400 hover:to-yellow-300 text-black font-bold py-4 rounded-2xl text-base shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
            >
              <span className="relative z-10">💝 BAĞIŞ YAP</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            </Button>

            {/* Creator info with avatar placeholder */}
            <div className="flex items-center justify-between bg-gray-800/40 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-black">
                    {donation.creator.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-300">
                  <span className="text-white font-medium">{donation.creator.username}</span>
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-red-400 fill-current" />
                <span className="text-xs text-gray-400">{donation.donorCount}</span>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>
    </Link>
  );
}
