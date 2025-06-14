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
    const orgType = donation.creator?.organizationType || donation.organizationType;
    const isVerified = donation.creator?.organizationVerified;
    
    if ((orgType === 'foundation' || orgType === 'association') && isVerified) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
          %2 Komisyon
        </Badge>
      );
    }
    if (orgType === 'individual') {
      return (
        <Badge className="bg-orange-100 text-orange-800 border border-orange-200">
          %10 Komisyon
        </Badge>
      );
    }
    return null;
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
      const transactionHash = await blockchainService.donate(
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
      <Card className="bg-white dark:bg-duxxan-surface border-2 border-yellow-500 dark:border-yellow-500 hover:border-yellow-600 dark:hover:border-yellow-600 transition-all duration-300 cursor-pointer">
        <CardContent className="p-6">
          {/* Header with badges */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getCountryFlag()}</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{donation.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                {donation.description}
              </p>
            </div>
            <div className="ml-4">
              {getStatusBadge()}
            </div>
          </div>

          {/* Organization and Commission Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {getOrganizationBadge()}
            {getCommissionBadge()}
            {donation.isUnlimited && (
              <Badge className="bg-purple-100 text-purple-800 border border-purple-200">
                <Clock className="w-3 h-3 mr-1" />
                Sınırsız Süre
              </Badge>
            )}
            {donation.creator?.organizationVerified && (
              <Badge className="bg-green-100 text-green-800 border border-green-200">
                <Shield className="w-3 h-3 mr-1" />
                Doğrulanmış
              </Badge>
            )}
            {donation.category && (
              <Badge className="bg-gray-100 text-gray-800 border border-gray-200">
                {donation.category}
              </Badge>
            )}
          </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">İlerleme</span>
            <span className="text-sm font-bold text-white">
              {parseFloat(donation.currentAmount).toLocaleString()} USDT / {parseFloat(donation.goalAmount).toLocaleString()} USDT
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="mb-2" />
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {progress >= 100 ? '🎉 Hedefe ulaşıldı!' : `%${progress.toFixed(1)} fonlandı`}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div>
            <div className="text-lg font-bold text-white">{donation.donorCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Bağışçılar</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {daysLeft > 0 ? daysLeft : 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Kalan Gün</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {avgDonation > 0 ? avgDonation.toFixed(0) : '0'} USDT
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Ort. Bağış</div>
          </div>
        </div>

        {daysLeft > 0 && progress < 100 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Miktar girin (USDT)"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="bg-white dark:bg-gray-700 border-yellow-500 text-gray-900 dark:text-white"
                min="1"
                step="1"
              />
              <Button
                onClick={contribute}
                disabled={!isConnected || isContributing || !donationAmount}
                className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 whitespace-nowrap"
              >
                {isContributing ? 'İşleniyor...' : 'Bağış Yap'}
              </Button>
            </div>

            <div className="flex gap-2">
              {[10, 25, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  onClick={() => quickDonate(amount)}
                  variant="outline"
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500 flex-1 text-xs font-bold"
                >
                  {amount} USDT
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-600 flex items-center justify-between">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Oluşturan: <span className="text-gray-900 dark:text-white font-medium">{donation.creator.username}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-xs text-gray-600 dark:text-gray-400">{donation.creator.rating}</span>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
