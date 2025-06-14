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
import { useState } from 'react';
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
  const [ticketCount, setTicketCount] = useState(1);

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

  const progress = (raffle.ticketsSold / raffle.maxTickets) * 100;
  const timeLeft = new Date(raffle.endDate).getTime() - new Date().getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-duxxan-dark">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-duxxan-text mb-2">
              {raffle.title}
            </h1>
            <div className="flex items-center gap-4 text-duxxan-text-secondary">
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
            <Button variant="outline" size="sm" className="border-duxxan-border">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-duxxan-border">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ana İçerik */}
          <div className="lg:col-span-2 space-y-6">
            {/* Borsa Tarzı Chart */}
            <Card className="bg-duxxan-surface border-duxxan-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-duxxan-text flex items-center gap-2">
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
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="participantGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F3BA2F" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#F3BA2F" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#888', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#888', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1A1A', 
                          border: '1px solid #333',
                          borderRadius: '8px',
                          color: '#fff'
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
            <Card className="bg-duxxan-surface border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-duxxan-text">Saatlik Bilet Satışları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                      <XAxis 
                        dataKey="hour" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#888', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#888', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1A1A', 
                          border: '1px solid #333',
                          borderRadius: '8px',
                          color: '#fff'
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
            <Card className="bg-duxxan-surface border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-duxxan-text">Çekiliş Detayları</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-duxxan-text-secondary leading-relaxed">
                  {raffle.description}
                </p>
                <Separator className="my-4 bg-duxxan-border" />
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
            <Card className="bg-duxxan-surface border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-duxxan-text">Bilet Satın Al</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tickets" className="text-duxxan-text">Bilet Adedi</Label>
                  <Input
                    id="tickets"
                    type="number"
                    min="1"
                    max="100"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(Number(e.target.value))}
                    className="bg-duxxan-dark border-duxxan-border text-duxxan-text"
                  />
                </div>
                
                <div className="bg-duxxan-dark p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-duxxan-text-secondary">Bilet Fiyatı:</span>
                    <span className="text-duxxan-text">{raffle.ticketPrice} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-duxxan-text-secondary">Miktar:</span>
                    <span className="text-duxxan-text">{ticketCount} adet</span>
                  </div>
                  <Separator className="my-2 bg-duxxan-border" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-duxxan-text">Toplam:</span>
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
            <Card className="bg-duxxan-surface border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-duxxan-text">Çekiliş İlerlemesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-duxxan-text-secondary">
                      {raffle.ticketsSold} / {raffle.maxTickets} bilet
                    </span>
                    <span className="text-duxxan-success">%{progress.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Yaratıcı */}
            <Card className="bg-duxxan-surface border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-duxxan-text">Çekiliş Sahibi</CardTitle>
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
                    <h4 className="font-semibold text-duxxan-text">
                      {raffle.creator?.username}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-duxxan-yellow fill-current" />
                      <span className="text-sm text-duxxan-text-secondary">
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
            <Card className="bg-duxxan-surface border-duxxan-border">
              <CardHeader>
                <CardTitle className="text-duxxan-text">Son Katılımcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-duxxan-border text-duxxan-text text-xs">
                            U{i}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-duxxan-text">user_{i}...abc</span>
                      </div>
                      <span className="text-xs text-duxxan-text-secondary">
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