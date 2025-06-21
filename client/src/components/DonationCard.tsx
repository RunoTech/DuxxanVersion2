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
      <Card className="border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden h-[560px] flex flex-col">
        <div className="h-48 relative overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            <Heart className="w-16 h-16 text-white opacity-80" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
            <div className="absolute top-4 left-4">
              {getStatusBadge()}
            </div>
            <div className="absolute top-4 right-4">
              {donation.category && (
                <Badge className="bg-yellow-500 text-white font-semibold px-3 py-1">
                  {donation.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{donation.title}</h3>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{donation.creator.rating}</span>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed flex-1 line-clamp-3">
            {donation.description}
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">İlerleme</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {parseFloat(donation.currentAmount).toLocaleString()} / {parseFloat(donation.goalAmount).toLocaleString()} USDT
              </span>
            </div>
            <Progress value={progress} className="mb-2 h-2" />
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {progress < 50 ? 'Yeni başlıyor!' : progress < 80 ? 'Kızışıyor!' : 'Neredeyse hedef!'}
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 mt-auto">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hedef Miktar</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {parseFloat(donation.goalAmount).toLocaleString()} USDT
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {daysLeft > 0 ? 'Bitiş' : 'Bitti'}
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {daysLeft > 0 ? `${daysLeft}g` : 'Bitti'}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <Button
              onClick={contribute}
              disabled={!isConnected || daysLeft <= 0}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl text-base"
            >
              Bağış Yap
            </Button>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Bağışçı Sayısı: <span className="text-gray-900 dark:text-white font-bold">
                  {donation.donorCount}
                </span>
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Oluşturan: <span className="text-gray-900 dark:text-white font-medium">{donation.creator.username}</span>
              </span>
            </div>
          </div>
      </CardContent>
    </Card>
    </Link>
  );
}
