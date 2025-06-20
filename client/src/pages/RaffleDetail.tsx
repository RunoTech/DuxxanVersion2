import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Clock, 
  Users, 
  Trophy, 
  Star, 
  TrendingUp, 
  MessageCircle,
  Share2,
  Heart,
  Shield,
  Calendar,
  DollarSign
} from 'lucide-react';
import { MutualApprovalSystem } from '@/components/MutualApprovalSystem';

export default function RaffleDetail() {
  const { id } = useParams();
  const { isConnected, user } = useWallet();
  const { theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ticketCount, setTicketCount] = useState(1);
  const [isClient, setIsClient] = useState(false);

  // Client-side only rendering to prevent SSR issues
  useEffect(() => {
    setIsClient(true);
    window.scrollTo(0, 0);
    
    // Global error handling for chart issues
    const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const message = 'message' in event ? event.message : event.reason?.message || '';
      if (message.includes('appendChild') || 
          message.includes('chart') ||
          message.includes('ResponsiveContainer') ||
          message.includes('ResizeObserver')) {
        event.preventDefault();
        console.warn('Chart render error prevented:', message);
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const { data: raffle, isLoading } = useQuery({
    queryKey: [`/api/raffles/${id}`],
    enabled: !!id,
  });

  const { data: tickets } = useQuery({
    queryKey: [`/api/raffles/${id}/tickets`],
    enabled: !!id,
  });

  // Gerçek chart verilerini sadece veri varsa kullan
  const hasRealData = raffle && tickets && Array.isArray(tickets) && tickets.length > 0;
  const chartData = hasRealData ? [] : []; // Backend'den gelecek
  const hourlyData = hasRealData ? [] : []; // Backend'den gelecek

  if (isLoading) {
    return (
      <div className="min-h-screen bg-duxxan-dark p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-duxxan-border rounded mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-duxxan-border rounded"></div>
                <div className="h-64 bg-duxxan-border rounded"></div>
              </div>
              <div className="h-96 bg-duxxan-border rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-duxxan-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-duxxan-text mb-2">Çekiliş Bulunamadı</h1>
          <p className="text-duxxan-text-secondary">Aradığınız çekiliş mevcut değil.</p>
        </div>
      </div>
    );
  }

  // Type guard to ensure raffle has required properties
  const safeRaffle = raffle as any; // Temporary fix for demo
  
  // Ensure numeric values are properly converted
  const numericTicketPrice = Number(safeRaffle.ticketPrice || 0);
  const numericPrizeValue = Number(safeRaffle.prizeValue || 0);

  const progress = safeRaffle?.ticketsSold && safeRaffle?.maxTickets 
    ? (safeRaffle.ticketsSold / safeRaffle.maxTickets) * 100 
    : 0;
  const timeLeft = safeRaffle?.endDate 
    ? new Date(safeRaffle.endDate).getTime() - new Date().getTime() 
    : 0;
  const daysLeft = timeLeft > 0 ? Math.ceil(timeLeft / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-duxxan-dark">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold dark:text-duxxan-text mb-2 text-[#ffc929]">
              {safeRaffle.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-600 dark:text-duxxan-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {daysLeft} gün kaldı
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {safeRaffle.ticketsSold} / {safeRaffle.maxTickets} bilet
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                {numericPrizeValue.toLocaleString('tr-TR')} USDT
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-300 dark:border-duxxan-border">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 dark:border-duxxan-border">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ana İçerik */}
          <div className="lg:col-span-2 space-y-6">
            {/* Borsa Tarzı Chart */}
            <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 dark:text-duxxan-yellow flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-duxxan-yellow" />
                    Katılım Analizi
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-duxxan-success/20 text-duxxan-success">
                      Aktif
                    </Badge>
                    <Badge variant="outline" className="border-duxxan-yellow text-duxxan-yellow">
                      24h: +189 katılımcı
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full flex items-center justify-center bg-gray-50 dark:bg-duxxan-surface border border-duxxan-border rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-duxxan-yellow mx-auto mb-2" />
                    <p className="text-duxxan-text-secondary">Henüz katılım verisi yok</p>
                    <p className="text-sm text-duxxan-text-secondary mt-1">İlk bilet satıldığında grafik görünecek</p>
                  </div>
                </div>
                
                {/* İstatistikler */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-duxxan-border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-duxxan-yellow">{safeRaffle.ticketsSold || 0}</div>
                    <div className="text-sm text-duxxan-text-secondary">Toplam Bilet</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-duxxan-success">%{progress.toFixed(1)}</div>
                    <div className="text-sm text-duxxan-text-secondary">Doluluk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-duxxan-text">{numericPrizeValue.toLocaleString('tr-TR')}</div>
                    <div className="text-sm text-duxxan-text-secondary">USDT Ödül</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-duxxan-warning">{daysLeft}</div>
                    <div className="text-sm text-duxxan-text-secondary">Gün Kaldı</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saatlik Satış Grafiği */}
            <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-duxxan-yellow">Saatlik Bilet Satışları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full flex items-center justify-center bg-gray-50 dark:bg-duxxan-surface border border-duxxan-border rounded-lg">
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-duxxan-yellow mx-auto mb-2" />
                    <p className="text-duxxan-text-secondary">Henüz satış verisi yok</p>
                    <p className="text-sm text-duxxan-text-secondary mt-1">İlk satış yapıldığında grafik görünecek</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Açıklama */}
            <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-duxxan-yellow">Çekiliş Detayları</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-duxxan-text-secondary leading-relaxed">
                  {safeRaffle.description}
                </p>
                <Separator className="my-4 bg-gray-200 dark:bg-duxxan-border" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-duxxan-text mb-2">Çekiliş Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-duxxan-text-secondary">Bilet Fiyatı:</span>
                        <span className="text-duxxan-yellow">{numericTicketPrice.toFixed(2)} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-duxxan-text-secondary">Maksimum Bilet:</span>
                        <span className="text-duxxan-text">{safeRaffle.maxTickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-duxxan-text-secondary">Bitiş Tarihi:</span>
                        <span className="text-duxxan-text">
                          {new Date(safeRaffle.endDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-duxxan-text mb-2">Güvenlik</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-duxxan-success">
                        <Shield className="w-4 h-4" />
                        Blockchain Destekli
                      </div>
                      <div className="flex items-center gap-2 text-sm text-duxxan-success">
                        <Shield className="w-4 h-4" />
                        Şeffaf Çekiliş
                      </div>
                      <div className="flex items-center gap-2 text-sm text-duxxan-success">
                        <Shield className="w-4 h-4" />
                        Otomatik Ödeme
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* Bilet Satın Al */}
            <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-duxxan-yellow">Bilet Satın Al</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tickets" className="text-gray-900 dark:text-duxxan-yellow">Bilet Adedi</Label>
                  <Input
                    id="tickets"
                    type="number"
                    min="1"
                    max="100"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(Number(e.target.value))}
                    className="dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-duxxan-text bg-[#ffc929]"
                  />
                </div>
                
                <div className="bg-gray-100 dark:bg-duxxan-dark p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-duxxan-yellow">Bilet Fiyatı:</span>
                    <span className="text-gray-900 dark:text-duxxan-yellow">{numericTicketPrice.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-duxxan-yellow">Miktar:</span>
                    <span className="text-gray-900 dark:text-duxxan-yellow">{ticketCount} adet</span>
                  </div>
                  <Separator className="my-2 bg-gray-200 dark:bg-duxxan-border" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-duxxan-yellow">Toplam:</span>
                    <span className="text-duxxan-yellow">
                      {(numericTicketPrice * ticketCount).toFixed(2)} USDT
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-duxxan-yellow text-duxxan-dark hover:bg-duxxan-yellow/90"
                  disabled={!isConnected}
                >
                  {isConnected ? 'Bilet Satın Al' : 'Cüzdan Bağlayın'}
                </Button>

                {!isConnected && (
                  <p className="text-xs text-duxxan-text-secondary text-center">
                    Bilet satın almak için cüzdanınızı bağlamanız gerekmektedir.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* İlerleme */}
            <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-duxxan-yellow">Çekiliş İlerlemesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-duxxan-yellow">
                      {safeRaffle.ticketsSold} / {safeRaffle.maxTickets} bilet
                    </span>
                    <span className="text-duxxan-success">%{progress.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Yaratıcı */}
            <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-duxxan-yellow">Çekiliş Sahibi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={safeRaffle.creator?.profileImage} />
                    <AvatarFallback className="bg-duxxan-yellow text-duxxan-dark">
                      {safeRaffle.creator?.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-duxxan-yellow">
                      {safeRaffle.creator?.username}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-duxxan-yellow fill-current" />
                      <span className="text-sm text-gray-600 dark:text-duxxan-yellow">
                        {safeRaffle.creator?.rating} ({safeRaffle.creator?.ratingCount} değerlendirme)
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3 border-duxxan-border text-duxxan-text"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mesaj Gönder
                </Button>
              </CardContent>
            </Card>

            {/* Son Katılımcılar */}
            <Card className="bg-gray-50 dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-duxxan-yellow">Son Katılımcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-200 dark:bg-duxxan-border text-gray-900 dark:text-duxxan-yellow text-xs">
                            U{i}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-900 dark:text-duxxan-yellow">user_{i}...abc</span>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-duxxan-yellow">
                        {i * 5} bilet
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demo Winner Assignment (for testing) */}
            {safeRaffle && !safeRaffle.winnerId && (
              <Card className="bg-yellow-50 dark:bg-duxxan-surface border-yellow-200 dark:border-duxxan-border">
                <CardHeader>
                  <CardTitle className="text-yellow-800 dark:text-duxxan-yellow">Demo: Kazanan Atama</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-700 dark:text-duxxan-text-secondary mb-3">
                    Test için kazanan atayabilirsiniz (demo amaçlı)
                  </p>
                  <div className="space-y-2">
                    <Button 
                      onClick={async () => {
                        try {
                          console.log('Assigning winner to raffle:', id);
                          const response = await apiRequest('POST', `/api/raffles/${id}/assign-winner`, { winnerId: 999 });
                          const result = await response.json();
                          
                          console.log('Winner assignment response:', result);
                          
                          // Force refetch
                          await queryClient.invalidateQueries({ queryKey: [`/api/raffles/${id}`] });
                          await queryClient.refetchQueries({ queryKey: [`/api/raffles/${id}`] });
                          
                          toast({
                            title: 'Demo kazanan atandı!',
                            description: 'Chat sistemi ve onay sistemi artık aktif.',
                          });
                        } catch (error) {
                          console.error('Winner assignment error:', error);
                          toast({
                            title: 'Hata',
                            description: `Kazanan atanamadı: ${error.message || 'Bilinmeyen hata'}`,
                            variant: 'destructive',
                          });
                        }
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white w-full"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Demo Kazanan Ata (ID: 999)
                    </Button>
                    <p className="text-xs text-yellow-700 dark:text-duxxan-text-secondary">
                      Bu butona tıkladıktan sonra chat sistemi aktif olacak ve mesajlaşmayı test edebilirsiniz.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mutual Approval System - Always show if winner exists */}
            {safeRaffle && safeRaffle.winnerId && (
              <MutualApprovalSystem 
                raffle={{
                  id: safeRaffle.id || 0,
                  title: safeRaffle.title || '',
                  winnerId: safeRaffle.winnerId,
                  creatorId: safeRaffle.creatorId || 0,
                  isApprovedByCreator: safeRaffle.isApprovedByCreator || false,
                  isApprovedByWinner: safeRaffle.isApprovedByWinner || false,
                  creator: {
                    username: safeRaffle.creator?.username || '',
                    organizationType: safeRaffle.creator?.organizationType,
                    organizationVerified: safeRaffle.creator?.organizationVerified
                  },
                  winner: safeRaffle.winner ? {
                    username: safeRaffle.winner.username
                  } : undefined
                }}
                onApprovalUpdate={(updatedRaffle) => {
                  queryClient.invalidateQueries({ queryKey: [`/api/raffles/${id}`] });
                }}
              />
            )}


          </div>
        </div>
      </div>
    </div>
  );
}