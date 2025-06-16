import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RaffleCard } from '@/components/RaffleCard';
import { DonationCard } from '@/components/DonationCard';
import { RaffleCardSkeleton } from '@/components/skeletons/RaffleCardSkeleton';
import { Link } from 'wouter';
import { useWallet } from '@/hooks/useWallet';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';

export default function Home() {
  const { isConnected } = useWallet();
  const { lastMessage } = useWebSocket();
  const { theme } = useTheme();
  const [liveStats, setLiveStats] = useState({
    totalRaffles: 0,
    totalPrizePool: '0',
    totalDonations: '0',
    activeUsers: 0,
  });

  // Live connected wallets counter - demo range 1300-100,000 + real connected wallets
  const [demoWalletCount, setDemoWalletCount] = useState(() => 
    Math.floor(Math.random() * (100000 - 1300 + 1)) + 1300
  );
  const [realConnectedWallets, setRealConnectedWallets] = useState(0);
  const [previousDemoCount, setPreviousDemoCount] = useState(demoWalletCount);

  // Generate a new unique demo wallet count
  const generateNewDemoCount = (current: number, previous: number) => {
    let newCount;
    let attempts = 0;
    do {
      newCount = Math.floor(Math.random() * (100000 - 1300 + 1)) + 1300;
      attempts++;
    } while ((newCount === current || newCount === previous) && attempts < 50);
    return newCount;
  };

  // Fast-changing demo wallet counter
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoWalletCount(prev => {
        const newCount = generateNewDemoCount(prev, previousDemoCount);
        setPreviousDemoCount(prev);
        return newCount;
      });
    }, 800 + Math.random() * 400); // Update every 0.8-1.2 seconds

    return () => clearInterval(interval);
  }, [previousDemoCount]);

  // Track real connected wallets (when users actually connect)
  useEffect(() => {
    if (isConnected) {
      setRealConnectedWallets(prev => prev < 1 ? 1 : prev);
    }
  }, [isConnected]);

  // Total displayed wallet count
  const totalConnectedWallets = demoWalletCount + realConnectedWallets;

  // Chart data for trading-style visualization
  const [chartData, setChartData] = useState([
    { name: '00:00', raffles: 2, prizes: 1200, donations: 800, volume: 2000 },
    { name: '04:00', raffles: 3, prizes: 1800, donations: 1200, volume: 3000 },
    { name: '08:00', raffles: 5, prizes: 3200, donations: 1800, volume: 5000 },
    { name: '12:00', raffles: 8, prizes: 7120, donations: 2400, volume: 9520 },
    { name: '16:00', raffles: 6, prizes: 5800, donations: 2100, volume: 7900 },
    { name: '20:00', raffles: 7, prizes: 6500, donations: 2800, volume: 9300 },
    { name: '24:00', raffles: 8, prizes: 7120, donations: 3200, volume: 10320 }
  ]);

  // Update chart data only when stats change
  useEffect(() => {
    if (liveStats) {
      setChartData(prev => {
        const newData = [...prev];
        const lastPoint = newData[newData.length - 1];
        
        newData[newData.length - 1] = {
          ...lastPoint,
          raffles: parseInt(liveStats.totalRaffles.toString()) || 1,
          prizes: parseFloat(liveStats.totalPrizePool) || 100,
          donations: parseFloat(liveStats.totalDonations) || 100,
          volume: lastPoint.volume
        };
        
        return newData;
      });
    }
  }, [liveStats]);

  // Fetch platform stats
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  // Fetch active raffles
  const { data: raffles = [], isLoading: rafflesLoading } = useQuery({
    queryKey: ['/api/raffles/active'],
  });

  // Fetch active donations
  const { data: donations = [], isLoading: donationsLoading } = useQuery({
    queryKey: ['/api/donations/active'],
  });

  // Update live stats from WebSocket messages
  useEffect(() => {
    if (stats) {
      setLiveStats({
        totalRaffles: (stats as any).totalRaffles || 0,
        totalPrizePool: (stats as any).totalPrizePool || '0',
        totalDonations: (stats as any).totalDonations || '0',
        activeUsers: (stats as any).activeUsers || 0
      });
    }
  }, [stats]);

  useEffect(() => {
    if (lastMessage) {
      // Update stats based on real-time events
      switch (lastMessage.type) {
        case 'RAFFLE_CREATED':
          setLiveStats(prev => ({
            ...prev,
            totalRaffles: prev.totalRaffles + 1,
          }));
          break;
        case 'TICKET_PURCHASED':
          // Could update prize pool here
          break;
        case 'DONATION_CREATED':
          // Could update donation stats
          break;
        case 'DONATION_CONTRIBUTION':
          setLiveStats(prev => ({
            ...prev,
            totalDonations: (parseFloat(prev.totalDonations) + parseFloat(lastMessage.data.amount)).toString(),
          }));
          break;
      }
    }
  }, [lastMessage]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-duxxan-dark">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-100 to-gray-200 dark:duxxan-gradient py-20 relative">
        {/* Live Connected Wallets - Fixed Position */}
        <div className="fixed top-6 z-50 fixed-wallet-counter">
          <div className="inline-flex items-center bg-duxxan-success/10 backdrop-blur-sm border border-duxxan-success/30 rounded-full px-3 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-duxxan-success rounded-full animate-pulse"></div>
              <span className="text-duxxan-success font-semibold text-sm">
                {totalConnectedWallets.toLocaleString()}
              </span>
              <span className="text-gray-600 dark:text-duxxan-text-secondary text-xs">
                bağlı
              </span>
              <Badge variant="secondary" className="bg-duxxan-success/20 text-duxxan-success border-duxxan-success/30 text-xs px-1.5 py-0.5">
                LIVE
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="duxxan-container text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-black dark:text-white">
            <span className="text-duxxan-yellow">DUXXAN</span> ile Büyük Kazan
          </h1>
          <p className="text-xl text-gray-600 dark:text-duxxan-text-secondary mb-8 max-w-3xl mx-auto">
            Kripto çekilişlerin ve bağışların geleceğine katılın. Binance Smart Chain üzerinde oluşturun, katılın ve harika ödüller kazanın.
          </p>
          
          {/* Trading-Style Chart */}
          <Card className="bg-duxxan-yellow/10 dark:bg-duxxan-surface border-2 border-duxxan-yellow/50 dark:border-duxxan-border mt-16">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-black dark:text-white">Platform İstatistikleri</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-duxxan-text-secondary">
                    <div className="w-2 h-2 bg-duxxan-success rounded-full animate-pulse"></div>
                    <span>Canlı Veriler</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-duxxan-yellow rounded-full"></div>
                      <span>Çekilişler</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-duxxan-success rounded-full"></div>
                      <span>Ödül Havuzu</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-duxxan-warning rounded-full"></div>
                      <span>Bağışlar</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="duxxan-grid">
                {/* Key metrics */}
                <div className="duxxan-col-4 space-y-4">
                  <div className="bg-gray-100 dark:bg-duxxan-dark/30 rounded-lg p-4 border border-gray-200 dark:border-duxxan-border/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-duxxan-text-secondary">Aktif Çekilişler</span>
                      <span className="text-xs text-duxxan-success">+5.2%</span>
                    </div>
                    <div className="text-2xl font-bold text-duxxan-yellow">
                      {liveStats.totalRaffles.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-duxxan-dark/30 rounded-lg p-4 border border-gray-200 dark:border-duxxan-border/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-duxxan-text-secondary">Ödül Havuzu</span>
                      <span className="text-xs text-duxxan-success">+12.8%</span>
                    </div>
                    <div className="text-2xl font-bold text-duxxan-success">
                      ${parseFloat(liveStats.totalPrizePool).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-duxxan-dark/30 rounded-lg p-4 border border-gray-200 dark:border-duxxan-border/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-duxxan-text-secondary">Bağışlar</span>
                      <span className="text-xs text-duxxan-success">+8.4%</span>
                    </div>
                    <div className="text-2xl font-bold text-duxxan-warning">
                      ${parseFloat(liveStats.totalDonations).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {/* Main Chart */}
                <div className="duxxan-col-8 bg-gradient-to-br from-duxxan-yellow/20 to-duxxan-yellow/10 dark:from-duxxan-dark/40 dark:to-duxxan-dark/20 rounded-xl p-6 border border-duxxan-yellow/30 dark:border-duxxan-border/30 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">24 Saatlik Aktivite Grafiği</div>
                      <div className="text-xs text-gray-600 dark:text-duxxan-text-secondary">Gerçek zamanlı platform veriler</div>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 bg-duxxan-success/20 rounded-full">
                      <div className="w-2 h-2 bg-duxxan-success rounded-full animate-pulse"></div>
                      <span className="text-xs text-duxxan-success font-medium">LIVE</span>
                    </div>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="prizesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="donationsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="rafflesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#EAB308" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="1 3" 
                          stroke="#374151" 
                          opacity={0.2} 
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6B7280" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#9CA3AF' }}
                        />
                        <YAxis 
                          stroke="#6B7280" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#9CA3AF' }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid #374151',
                            borderRadius: '12px',
                            color: '#F3F4F6',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                            backdropFilter: 'blur(10px)'
                          }}
                          labelStyle={{ color: '#D1D5DB', fontWeight: '600' }}
                          formatter={(value, name) => [
                            name === 'Çekilişler' ? value : `$${Number(value).toLocaleString()}`,
                            name
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="prizes"
                          stroke="#10B981"
                          fill="url(#prizesGradient)"
                          strokeWidth={3}
                          name="Ödül Havuzu"
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#ffffff' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="donations"
                          stroke="#F59E0B"
                          fill="url(#donationsGradient)"
                          strokeWidth={3}
                          name="Bağışlar"
                          dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2, fill: '#ffffff' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="raffles"
                          stroke="#EAB308"
                          fill="url(#rafflesGradient)"
                          strokeWidth={3}
                          name="Çekilişler"
                          dot={{ fill: '#EAB308', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#EAB308', strokeWidth: 2, fill: '#ffffff' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Volume Chart */}
              <div className="mt-6 bg-gradient-to-r from-duxxan-yellow/20 to-duxxan-yellow/10 dark:from-duxxan-dark/40 dark:to-duxxan-dark/20 rounded-xl p-6 border border-duxxan-yellow/30 dark:border-duxxan-border/30 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-lg font-semibold text-black dark:text-white mb-1">İşlem Hacmi</div>
                    <div className="text-xs text-gray-600 dark:text-duxxan-text-secondary">24 saatlik toplam aktivite</div>
                  </div>
                  <div className="text-sm text-duxxan-yellow font-bold">
                    ${chartData[chartData.length - 1]?.volume.toLocaleString()}
                  </div>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={1}/>
                          <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="1 3" 
                        stroke="#374151" 
                        opacity={0.15} 
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6B7280" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#6B7280" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#9CA3AF' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid #374151',
                          borderRadius: '12px',
                          color: '#F3F4F6',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                          backdropFilter: 'blur(10px)'
                        }}
                        labelStyle={{ color: '#D1D5DB', fontWeight: '600' }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'İşlem Hacmi']}
                      />
                      <Bar 
                        dataKey="volume" 
                        fill="url(#volumeGradient)"
                        radius={[4, 4, 0, 0]}
                        name="İşlem Hacmi"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Popular Raffles Section */}
      <section className="py-20 bg-white dark:bg-duxxan-dark">
        <div className="duxxan-container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-black text-black dark:text-white">Popüler Çekilişler</h2>
            <div className="flex space-x-4">
              <Link href="/raffles">
                <Button className="bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-black font-bold">
                  Tüm Çekilişler
                </Button>
              </Link>
              <Link href="/create-raffle">
                <Button className="bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-black font-bold">
                  Çekiliş Oluştur
                </Button>
              </Link>
            </div>
          </div>

          {rafflesLoading ? (
            <div className="duxxan-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="duxxan-col-4">
                  <RaffleCardSkeleton />
                </div>
              ))}
            </div>
          ) : (raffles as any)?.length > 0 ? (
            <div className="duxxan-grid">
              {(raffles as any).slice(0, 6).map((raffle: any) => (
                <div key={raffle.id} className="duxxan-col-4">
                  <RaffleCard raffle={raffle} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-duxxan-surface border border-gray-200 dark:border-duxxan-border text-center">
              <CardContent className="p-12">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Aktif Çekiliş Yok</h3>
                <p className="text-gray-600 dark:text-duxxan-text-secondary mb-6">
                  DUXXAN'da heyecan verici bir çekiliş oluşturan ilk kişi olun!
                </p>
                <Link href="/create-raffle">
                  <Button className="bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-black font-bold">
                    İlk Çekilişi Oluştur
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      {/* Donations Section */}
      <section className="py-20 bg-gray-50 dark:bg-duxxan-surface">
        <div className="duxxan-container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-black mb-2 text-black dark:text-white">Bağış Kampanyaları</h2>
              <p className="text-gray-600 dark:text-duxxan-text-secondary">
                Şeffaf blockchain bağışları ile önemli amaçları destekleyin
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/donations">
                <Button className="bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-black font-bold">
                  Tüm Kampanyalar
                </Button>
              </Link>
              <Link href="/create-donation">
                <Button className="bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-black font-bold">
                  Kampanya Başlat
                </Button>
              </Link>
            </div>
          </div>

          {/* Donation Market Cap Display */}
          <Card className="bg-white dark:bg-duxxan-surface border border-gray-200 dark:border-duxxan-border mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-duxxan-text-secondary mb-2">
                  Toplam Bağış Piyasa Değeri
                </div>
                <div className="text-4xl font-bold text-duxxan-success mb-4">
                  ${parseFloat(liveStats.totalDonations).toLocaleString()}
                </div>
                <div className="flex justify-center items-center space-x-4 text-sm">
                  <span className="text-duxxan-success">↗ Anlık Güncellemeler</span>
                  <span className="text-gray-600 dark:text-duxxan-text-secondary">Blockchain Doğrulanmış</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {donationsLoading ? (
            <div className="duxxan-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="duxxan-col-6">
                  <RaffleCardSkeleton />
                </div>
              ))}
            </div>
          ) : (donations as any)?.length > 0 ? (
            <div className="duxxan-grid">
              {(donations as any).slice(0, 4).map((donation: any) => (
                <div key={donation.id} className="duxxan-col-6">
                  <DonationCard donation={donation} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-duxxan-surface border border-gray-200 dark:border-duxxan-border text-center">
              <CardContent className="p-12">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Aktif Kampanya Yok</h3>
                <p className="text-gray-600 dark:text-duxxan-text-secondary mb-6">
                  İlk bağış kampanyasını başlatın ve fark yaratın!
                </p>
                <Link href="/create-donation">
                  <Button className="bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-black font-bold">
                    İlk Kampanyayı Başlat
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      {/* CTA Section */}
      {!isConnected && (
        <section className="py-20 bg-duxxan-dark">
          <div className="duxxan-container text-center">
            <h2 className="text-3xl font-bold mb-4">Başlamaya Hazır mısınız?</h2>
            <p className="text-xl text-duxxan-text-secondary mb-8">
              Çekilişlere katılmaya ve bağış kampanyalarını desteklemeye başlamak için cüzdanınızı bağlayın.
            </p>
            <div className="flex justify-center space-x-4">
              <Button className="bg-duxxan-yellow hover:bg-duxxan-yellow/90 text-black font-bold">
                MetaMask Bağla
              </Button>
              <Button variant="outline" className="border-duxxan-yellow text-duxxan-yellow hover:bg-duxxan-yellow hover:text-black font-bold">
                Daha Fazla Bilgi
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
