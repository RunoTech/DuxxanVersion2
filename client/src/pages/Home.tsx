import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RaffleCard } from '@/components/RaffleCard';
import { DonationCard } from '@/components/DonationCard';
import { Link } from 'wouter';
import { useWallet } from '@/hooks/useWallet';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isConnected } = useWallet();
  const { lastMessage } = useWebSocket();
  const [liveStats, setLiveStats] = useState({
    totalRaffles: 0,
    totalPrizePool: '0',
    totalDonations: '0',
    activeUsers: 0,
  });

  // Fetch platform stats
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch active raffles
  const { data: raffles = [] } = useQuery({
    queryKey: ['/api/raffles/active'],
    refetchInterval: isConnected ? 10000 : false, // Refresh every 10 seconds if connected
  });

  // Fetch active donations
  const { data: donations = [] } = useQuery({
    queryKey: ['/api/donations/active'],
    refetchInterval: isConnected ? 10000 : false,
  });

  // Update live stats from WebSocket messages
  useEffect(() => {
    if (stats) {
      setLiveStats(stats);
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
    <div className="min-h-screen bg-duxxan-dark">
      {/* Hero Section */}
      <section className="duxxan-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-duxxan-yellow">DUXXAN</span> ile Büyük Kazan
          </h1>
          <p className="text-xl text-duxxan-text-secondary mb-12 max-w-3xl mx-auto">
            Kripto çekilişlerin ve bağışların geleceğine katılın. Binance Smart Chain üzerinde oluşturun, katılın ve harika ödüller kazanın.
          </p>
          
          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="duxxan-card">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-duxxan-yellow mb-2">
                  {liveStats.totalRaffles.toLocaleString()}
                </div>
                <div className="text-duxxan-text-secondary">Aktif Çekilişler</div>
              </CardContent>
            </Card>
            
            <Card className="duxxan-card">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-duxxan-success mb-2">
                  ${parseFloat(liveStats.totalPrizePool).toLocaleString()}
                </div>
                <div className="text-duxxan-text-secondary">Toplam Ödül Havuzu</div>
              </CardContent>
            </Card>
            
            <Card className="duxxan-card">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-duxxan-warning mb-2">
                  ${parseFloat(liveStats.totalDonations).toLocaleString()}
                </div>
                <div className="text-duxxan-text-secondary">Toplanan Bağışlar</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Raffles Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Popüler Çekilişler</h2>
            <div className="flex space-x-4">
              <Link href="/raffles">
                <Button variant="outline" className="duxxan-button-secondary">
                  Tüm Çekilişler
                </Button>
              </Link>
              <Link href="/create-raffle">
                <Button className="duxxan-button-primary">
                  Çekiliş Oluştur
                </Button>
              </Link>
            </div>
          </div>

          {raffles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffles.slice(0, 6).map((raffle: any) => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          ) : (
            <Card className="duxxan-card text-center">
              <CardContent className="p-12">
                <h3 className="text-xl font-bold mb-4">Aktif Çekiliş Yok</h3>
                <p className="text-duxxan-text-secondary mb-6">
                  DUXXAN'da heyecan verici bir çekiliş oluşturan ilk kişi olun!
                </p>
                <Link href="/create-raffle">
                  <Button className="duxxan-button-primary">
                    İlk Çekilişi Oluştur
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Donations Section */}
      <section className="py-20 bg-duxxan-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Bağış Kampanyaları</h2>
              <p className="text-duxxan-text-secondary">
                Şeffaf blockchain bağışları ile önemli amaçları destekleyin
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/donations">
                <Button variant="outline" className="duxxan-button-secondary">
                  Tüm Kampanyalar
                </Button>
              </Link>
              <Link href="/create-donation">
                <Button className="duxxan-button-success">
                  Kampanya Başlat
                </Button>
              </Link>
            </div>
          </div>

          {/* Donation Market Cap Display */}
          <Card className="duxxan-card mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-sm text-duxxan-text-secondary mb-2">
                  Toplam Bağış Piyasa Değeri
                </div>
                <div className="text-4xl font-bold text-duxxan-success mb-4">
                  ${parseFloat(liveStats.totalDonations).toLocaleString()}
                </div>
                <div className="flex justify-center items-center space-x-4 text-sm">
                  <span className="text-duxxan-success">↗ Anlık Güncellemeler</span>
                  <span className="text-duxxan-text-secondary">Blockchain Doğrulanmış</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {donations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {donations.slice(0, 4).map((donation: any) => (
                <DonationCard key={donation.id} donation={donation} />
              ))}
            </div>
          ) : (
            <Card className="duxxan-card text-center">
              <CardContent className="p-12">
                <h3 className="text-xl font-bold mb-4">Aktif Kampanya Yok</h3>
                <p className="text-duxxan-text-secondary mb-6">
                  İlk bağış kampanyasını başlatın ve fark yaratın!
                </p>
                <Link href="/create-donation">
                  <Button className="duxxan-button-success">
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Başlamaya Hazır mısınız?</h2>
            <p className="text-xl text-duxxan-text-secondary mb-8">
              Çekilişlere katılmaya ve bağış kampanyalarını desteklemeye başlamak için cüzdanınızı bağlayın.
            </p>
            <div className="flex justify-center space-x-4">
              <Button className="duxxan-button-primary">
                MetaMask Bağla
              </Button>
              <Button variant="outline" className="duxxan-button-secondary">
                Daha Fazla Bilgi
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
