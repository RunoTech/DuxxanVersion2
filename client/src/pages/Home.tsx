import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { RaffleCard } from '@/components/RaffleCard';
import { DonationCard } from '@/components/DonationCard';
import { 
  Shield, 
  Globe, 
  Users, 
  Heart, 
  Gift, 
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const { isConnected } = useWallet();

  // Fetch platform statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
    staleTime: 5 * 60 * 1000
  });

  const { data: activeRafflesData, isLoading: rafflesLoading } = useQuery({
    queryKey: ['/api/raffles/active'],
    staleTime: 2 * 60 * 1000
  });

  const activeRaffles = (activeRafflesData as any)?.data || [];

  const { data: activeDonationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ['/api/donations/active'],
    staleTime: 2 * 60 * 1000
  });

  const activeDonations = (activeDonationsData as any)?.data || [];

  const features = [
    {
      icon: Heart,
      title: "Şeffaf Bağışlar",
      description: "Blockchain üzerinde takip edilebilir",
      count: activeDonations.length || 0,
      color: "text-emerald-600"
    },
    {
      icon: Gift,
      title: "Adil Çekilişler", 
      description: "Blockchain tabanlı rastgele seçim",
      count: activeRaffles.length || 0,
      color: "text-[#FFC929]"
    },
    {
      icon: Users,
      title: "Aktif Kullanıcılar",
      description: "Topluluk üyeleri",
      count: stats?.totalUsers || 0,
      color: "text-blue-600"
    },
    {
      icon: Shield,
      title: "Güvenli İşlemler",
      description: "Smart contract koruması",
      count: "100%",
      color: "text-gray-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Compact Hero Section */}
      <div className="bg-gradient-to-r from-[#FFC929] via-[#FFB800] to-[#FFA500] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-black text-white">
                  DUXXAN
                </h1>
                <p className="text-sm text-white">Blockchain Platform</p>
              </div>
            </div>
            
            <p className="text-base text-white mb-6 max-w-2xl mx-auto">
              Blockchain tabanlı şeffaf bağış ve çekiliş platformu
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/raffles">
                <Button className="bg-white text-[#B8860B] hover:bg-gray-100 font-semibold px-6 py-2 rounded-lg">
                  <Gift className="h-4 w-4 mr-2" />
                  Çekilişler
                </Button>
              </Link>
              
              <Link href="/donations">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-6 py-2 rounded-lg">
                  <Heart className="h-4 w-4 mr-2" />
                  Bağışlar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <IconComponent className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {feature.count}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {feature.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Active Raffles */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Aktif Çekilişler
              </h2>
              <Link href="/raffles">
                <Button variant="outline" size="sm" className="border-[#FFC929] text-[#FFC929] hover:bg-[#FFC929] hover:text-black text-xs">
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Tümü
                </Button>
              </Link>
            </div>
            
            {rafflesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[240px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : activeRaffles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeRaffles.slice(0, 4).map((raffle: any) => (
                  <RaffleCard key={raffle.id} raffle={raffle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Henüz aktif çekiliş bulunmuyor
              </div>
            )}
          </div>

          {/* Active Donations */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Aktif Bağış Kampanyaları
              </h2>
              <Link href="/donations">
                <Button variant="outline" size="sm" className="border-[#FFC929] text-[#FFC929] hover:bg-[#FFC929] hover:text-black text-xs">
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Tümü
                </Button>
              </Link>
            </div>
            
            {donationsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[240px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : activeDonations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeDonations.slice(0, 4).map((donation: any) => (
                  <DonationCard key={donation.id} donation={donation} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Henüz aktif bağış kampanyası bulunmuyor
              </div>
            )}
          </div>

          {/* Platform Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Özellikleri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FFC929] rounded-lg mb-3">
                  <Shield className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Güvenli Blockchain
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tüm işlemler blockchain üzerinde güvenle işlenir
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-lg mb-3">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Şeffaf Bağışlar
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Her bağış takip edilebilir ve şeffafdır
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-3">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Küresel Erişim
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dünyanın her yerinden katılım mümkün
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}