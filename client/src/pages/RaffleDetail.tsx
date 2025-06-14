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
import { useWallet } from '@/hooks/useWallet';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function RaffleDetail() {
  const { id } = useParams();
  const { isConnected } = useWallet();
  const { theme } = useTheme();
  const [ticketCount, setTicketCount] = useState(1);
  const [chartError, setChartError] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Error boundary for charts
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('appendChild') || 
          event.error?.message?.includes('chart') ||
          event.error?.message?.includes('ResponsiveContainer')) {
        setChartError(true);
        event.preventDefault();
        console.warn('Chart render error prevented page refresh');
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const { data: raffle, isLoading } = useQuery({
    queryKey: [`/api/raffles/${id}`],
    enabled: !!id,
  });

  const { data: tickets } = useQuery({
    queryKey: [`/api/raffles/${id}/tickets`],
    enabled: !!id,
  });

  // Mock chart data - borsa tarzı
  const chartData = [
    { time: '00:00', participants: 45, price: 0.50 },
    { time: '04:00', participants: 89, price: 0.50 },
    { time: '08:00', participants: 156, price: 0.50 },
    { time: '12:00', participants: 234, price: 0.50 },
    { time: '16:00', participants: 387, price: 0.50 },
    { time: '20:00', participants: 523, price: 0.50 },
    { time: '24:00', participants: 743, price: 0.50 },
  ];

  const hourlyData = [
    { hour: '09:00', sales: 23 },
    { hour: '10:00', sales: 45 },
    { hour: '11:00', sales: 67 },
    { hour: '12:00', sales: 89 },
    { hour: '13:00', sales: 112 },
    { hour: '14:00', sales: 98 },
    { hour: '15:00', sales: 134 },
    { hour: '16:00', sales: 156 },
    { hour: '17:00', sales: 187 },
    { hour: '18:00', sales: 203 },
  ];

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

  const progress = raffle?.ticketsSold && raffle?.maxTickets 
    ? (raffle.ticketsSold / raffle.maxTickets) * 100 
    : 0;
  const timeLeft = raffle?.endDate 
    ? new Date(raffle.endDate).getTime() - new Date().getTime() 
    : 0;
  const daysLeft = timeLeft > 0 ? Math.ceil(timeLeft / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-duxxan-dark">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-duxxan-text mb-2">
              {raffle.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-600 dark:text-duxxan-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {daysLeft} gün kaldı
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {raffle.ticketsSold} / {raffle.maxTickets} bilet
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                {raffle.prizeValue} USDT
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
                {chartError ? (
                  <div className="h-80 w-full flex items-center justify-center bg-gray-50 dark:bg-duxxan-surface border border-duxxan-border rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-duxxan-yellow mx-auto mb-2" />
                      <p className="text-duxxan-text-secondary">Chart temporarily unavailable</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height={320} minHeight={200}>
                      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="participantGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F3BA2F" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#F3BA2F" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2A2A2A' : '#E5E5E5'} />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: theme === 'dark' ? '#888' : '#666', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: theme === 'dark' ? '#888' : '#666', fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#1A1A1A' : '#FFFFFF', 
                            border: theme === 'dark' ? '1px solid #333' : '1px solid #E5E5E5',
                            borderRadius: '8px',
                            color: theme === 'dark' ? '#fff' : '#000'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="participants"
                          stroke="#F3BA2F"
                          strokeWidth={2}
                          fill="url(#participantGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                {/* İstatistikler */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-duxxan-border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-duxxan-yellow">{raffle.ticketsSold}</div>
                    <div className="text-sm text-duxxan-text-secondary">Toplam Bilet</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-duxxan-success">%{progress.toFixed(1)}</div>
                    <div className="text-sm text-duxxan-text-secondary">Doluluk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-duxxan-text">{raffle.prizeValue}</div>
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
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height={256} minHeight={150}>
                    <LineChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#2A2A2A' : '#E5E5E5'} />
                      <XAxis 
                        dataKey="hour" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme === 'dark' ? '#888' : '#666', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme === 'dark' ? '#888' : '#666', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme === 'dark' ? '#1A1A1A' : '#FFFFFF', 
                          border: theme === 'dark' ? '1px solid #333' : '1px solid #E5E5E5',
                          borderRadius: '8px',
                          color: theme === 'dark' ? '#fff' : '#000'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#F3BA2F" 
                        strokeWidth={3}
                        dot={{ fill: '#F3BA2F', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#F3BA2F', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
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
                  {raffle.description}
                </p>
                <Separator className="my-4 bg-gray-200 dark:bg-duxxan-border" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-duxxan-text mb-2">Çekiliş Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-duxxan-text-secondary">Bilet Fiyatı:</span>
                        <span className="text-duxxan-yellow">{raffle.ticketPrice} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-duxxan-text-secondary">Maksimum Bilet:</span>
                        <span className="text-duxxan-text">{raffle.maxTickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-duxxan-text-secondary">Bitiş Tarihi:</span>
                        <span className="text-duxxan-text">
                          {new Date(raffle.endDate).toLocaleDateString('tr-TR')}
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
                    className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-duxxan-text"
                  />
                </div>
                
                <div className="bg-gray-100 dark:bg-duxxan-dark p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-duxxan-yellow">Bilet Fiyatı:</span>
                    <span className="text-gray-900 dark:text-duxxan-yellow">{raffle.ticketPrice} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-duxxan-yellow">Miktar:</span>
                    <span className="text-gray-900 dark:text-duxxan-yellow">{ticketCount} adet</span>
                  </div>
                  <Separator className="my-2 bg-gray-200 dark:bg-duxxan-border" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-duxxan-yellow">Toplam:</span>
                    <span className="text-duxxan-yellow">
                      {(Number(raffle.ticketPrice) * ticketCount).toFixed(2)} USDT
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
                      {raffle.ticketsSold} / {raffle.maxTickets} bilet
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
                    <AvatarImage src={raffle.creator?.profileImage} />
                    <AvatarFallback className="bg-duxxan-yellow text-duxxan-dark">
                      {raffle.creator?.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-duxxan-yellow">
                      {raffle.creator?.username}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-duxxan-yellow fill-current" />
                      <span className="text-sm text-gray-600 dark:text-duxxan-yellow">
                        {raffle.creator?.rating} ({raffle.creator?.ratingCount} değerlendirme)
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
          </div>
        </div>
      </div>
    </div>
  );
}