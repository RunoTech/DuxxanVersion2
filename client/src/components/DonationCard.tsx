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
      <Badge className="bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-full">
        Aktif
      </Badge>
    );
  };

  const getOrganizationBadge = () => {
    // Always show Bireysel badge for consistency
    return (
      <Badge className="bg-purple-600 text-white px-2 py-1 text-xs font-medium rounded-md">
        <Heart className="w-3 h-3 mr-1" />
        Bireysel
      </Badge>
    );
  };

  const getCommissionBadge = () => {
    return (
      <Badge className="bg-yellow-600 text-white px-2 py-1 text-xs font-medium rounded-md">
        <Star className="w-3 h-3 mr-1" />
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
      <Card className="h-full bg-white dark:bg-gray-900 border-2 border-yellow-500 hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl overflow-hidden min-h-[350px] sm:min-h-[380px]">
        <CardContent className="p-3 h-full flex flex-col">
          {/* Header with title and status */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <h3 className="text-gray-900 dark:text-white font-bold text-sm leading-tight truncate">{donation.title}</h3>
            </div>
            <div className="ml-1 flex-shrink-0">
              {getStatusBadge()}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 line-clamp-2 leading-relaxed">
            {donation.description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
            {getOrganizationBadge()}
            {getCommissionBadge()}
            {donation.category && (
              <Badge className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                {donation.category}
              </Badge>
            )}
          </div>

          {/* Progress Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm">İlerleme</span>
              <span className="text-gray-900 dark:text-white font-bold text-sm">
                {parseFloat(donation.currentAmount).toLocaleString()} / {parseFloat(donation.goalAmount).toLocaleString()} USDT
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="text-center text-gray-500 dark:text-gray-400 text-xs">
              %{progress.toFixed(1)} fonlandı
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-5 text-center">
            <div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{donation.donorCount}</div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">Bağışçılar</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {daysLeft > 0 ? daysLeft : 0}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">Kalan Gün</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgDonation > 0 ? avgDonation.toFixed(0) : '0'}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">Ort. Bağış</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-3">
            {daysLeft > 0 && progress < 100 ? (
              <>
                {/* Amount Input and Donate Button */}
                <div className="donation-input-responsive">
                  <Input
                    type="number"
                    placeholder="Miktar (USDT)"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg text-xs px-2 py-2"
                    min="1"
                    step="1"
                  />
                  <Button
                    onClick={contribute}
                    disabled={!isConnected || isContributing || !donationAmount}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 py-2 rounded-lg text-xs"
                  >
                    Bağış Yap
                  </Button>
                </div>

                {/* Quick Amount Buttons */}
                <div className="donation-quick-grid">
                  {[10, 25, 50, 100].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => quickDonate(amount)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-md"
                    >
                      {amount} USDT
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Badge className={`${progress >= 100 ? 'bg-green-600' : 'bg-gray-600'} text-white px-6 py-2 rounded-full text-sm`}>
                  {progress >= 100 ? 'Hedef Tamamlandı' : 'Süresi Doldu'}
                </Badge>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-gray-500 dark:text-gray-400 text-sm truncate">
              Oluşturan: <span className="text-gray-900 dark:text-white font-medium">{donation.creator.username}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-gray-900 dark:text-white text-sm font-medium">{donation.creator.rating}</span>
            </div>
          </div>
      </CardContent>
    </Card>
    </Link>
  );
}
