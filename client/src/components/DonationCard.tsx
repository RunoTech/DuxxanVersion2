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
    if (daysLeft <= 0) {
      return <Badge variant="destructive">Bitti</Badge>;
    }
    if (progress >= 100) {
      return <Badge className="bg-green-600 text-white">Tamamlandı</Badge>;
    }
    if (progress >= 80) {
      return <Badge className="bg-yellow-500 text-white">Hedefe Yakın</Badge>;
    }
    return <Badge className="bg-blue-600 text-white">Aktif</Badge>;
  };

  const getOrganizationBadge = () => {
    const orgType = donation.creator?.organizationType || donation.organizationType;
    
    if (orgType === 'foundation') {
      return (
        <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
          <Building2 className="w-3 h-3 mr-1" />
          Vakıf
        </Badge>
      );
    }
    if (orgType === 'association') {
      return (
        <Badge className="bg-green-100 text-green-800 border border-green-200">
          <Users className="w-3 h-3 mr-1" />
          Dernek
        </Badge>
      );
    }
    if (orgType === 'individual') {
      return (
        <Badge className="bg-red-100 text-red-800 border border-red-200">
          <Heart className="w-3 h-3 mr-1" />
          Bireysel
        </Badge>
      );
    }
    return null;
  };

  const getCommissionBadge = () => {
    // Contract: All donations have 2% commission rate
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
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
      <Card className="h-full flex flex-col bg-white dark:bg-duxxan-surface border-2 border-yellow-500 dark:border-yellow-500 hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardContent className="p-4 flex flex-col h-full">
          {/* Header with badges */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getCountryFlag()}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{donation.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 min-h-[40px]">
                {donation.description}
              </p>
            </div>
            <div className="ml-2 flex-shrink-0">
              {getStatusBadge()}
            </div>
          </div>

          {/* Organization and Commission Badges */}
          <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
            {getOrganizationBadge()}
            {getCommissionBadge()}
            {donation.category && (
              <Badge className="bg-gray-100 text-gray-800 border border-gray-200 text-xs">
                {donation.category}
              </Badge>
            )}
          </div>

        <div className="mb-3 flex-grow">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">İlerleme</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {parseFloat(donation.currentAmount).toLocaleString()} / {parseFloat(donation.goalAmount).toLocaleString()} USDT
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="mb-2 h-2" />
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
            %{progress.toFixed(1)} fonlandı
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{donation.donorCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Bağışçılar</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {daysLeft > 0 ? daysLeft : 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Kalan Gün</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {avgDonation > 0 ? avgDonation.toFixed(0) : '0'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Ort. Bağış</div>
          </div>
        </div>

        <div className="mt-auto">
          {daysLeft > 0 && progress < 100 ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Miktar (USDT)"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="bg-white dark:bg-gray-700 border-yellow-500 text-gray-900 dark:text-white text-sm"
                  min="1"
                  step="1"
                />
                <Button
                  onClick={contribute}
                  disabled={!isConnected || isContributing || !donationAmount}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white whitespace-nowrap text-sm px-3"
                >
                  Bağış Yap
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {[10, 25, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => quickDonate(amount)}
                    variant="outline"
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white border border-yellow-500 text-xs py-1"
                  >
                    {amount} USDT
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-3">
              <Badge className={`${progress >= 100 ? 'bg-green-500' : 'bg-gray-500'} text-white px-4 py-2`}>
                {progress >= 100 ? 'Hedef Tamamlandı' : 'Süresi Doldu'}
              </Badge>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-600 flex items-center justify-between">
          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
            Oluşturan: <span className="text-gray-900 dark:text-white font-medium">{donation.creator.username}</span>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-xs text-gray-600 dark:text-gray-400">{donation.creator.rating}</span>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
