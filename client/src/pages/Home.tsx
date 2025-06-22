import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { 
  Shield, 
  Globe, 
  Users, 
  Heart, 
  Gift, 
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Lock,
  Zap,
  Star,
  Award,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const { isConnected } = useWallet();

  // Fetch platform statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    staleTime: 5 * 60 * 1000
  });

  const platformFeatures = [
    {
      icon: Shield,
      title: "Blockchain Güvenliği",
      description: "Smart contract teknolojisi ile %100 güvenli işlemler",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: Heart,
      title: "Şeffaf Bağışlar",
      description: "Her bağış blockchain üzerinde takip edilebilir",
      color: "from-rose-500 to-rose-600"
    },
    {
      icon: Gift,
      title: "Adil Çekilişler",
      description: "Manipüle edilemeyen rastgele sayı üretimi",
      color: "from-[#FFC929] to-[#FFB800]"
    },
    {
      icon: Globe,
      title: "Küresel Erişim",
      description: "Dünyanın her yerinden katılım imkanı",
      color: "from-blue-500 to-blue-600"
    }
  ];

  const statistics = [
    {
      icon: Users,
      value: stats?.totalUsers || "1,000+",
      label: "Aktif Kullanıcı",
      color: "text-blue-600"
    },
    {
      icon: Gift,
      value: stats?.totalRaffles || "250+",
      label: "Tamamlanan Çekiliş",
      color: "text-[#FFC929]"
    },
    {
      icon: Heart,
      value: stats?.totalDonations ? `${Math.floor(stats.totalDonations / 1000)}K+` : "500K+",
      label: "Toplam Bağış (USDT)",
      color: "text-emerald-600"
    },
    {
      icon: Award,
      value: "100%",
      label: "Güvenlik Oranı",
      color: "text-purple-600"
    }
  ];

  const advantages = [
    {
      icon: CheckCircle,
      text: "Anında işlem onayları"
    },
    {
      icon: Lock,
      text: "Kripto güvenlik standartları"
    },
    {
      icon: TrendingUp,
      text: "Şeffaf fon takibi"
    },
    {
      icon: Zap,
      text: "Düşük işlem ücretleri"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#FFC929] via-[#FFB800] to-[#FFA500] py-16 lg:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border border-white rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 border border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Logo and Brand */}
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-3xl font-black bg-gradient-to-r from-[#FFC929] to-[#FFB800] bg-clip-text text-transparent">D</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl lg:text-7xl font-black text-white leading-none">
                  DUXXAN
                </h1>
                <p className="text-xl text-white/90 font-semibold tracking-wider">
                  BLOCKCHAIN PLATFORM
                </p>
              </div>
            </div>
            
            {/* Main Heading */}
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Blockchain Tabanlı<br />
              <span className="relative">
                Güvenli Platform
                <Sparkles className="inline-block w-8 h-8 ml-2 text-white" />
              </span>
            </h2>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Şeffaf bağışlar, adil çekilişler ve güvenli blockchain teknolojisi ile desteklenen 
              yeni nesil dijital platform. Dünya çapında güvenilir işlemler.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {!isConnected ? (
                <WalletConnectButton size="lg" className="bg-white text-[#B8860B] hover:bg-gray-100 font-bold px-8 py-4 text-lg rounded-xl shadow-2xl" />
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/create-raffle">
                    <Button size="lg" className="bg-white text-[#B8860B] hover:bg-gray-100 font-bold px-8 py-4 text-lg rounded-xl shadow-2xl">
                      <Gift className="h-6 w-6 mr-3" />
                      Çekiliş Oluştur
                    </Button>
                  </Link>
                  
                  <Link href="/create-donation">
                    <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 backdrop-blur-sm font-bold px-8 py-4 text-lg rounded-xl">
                      <Heart className="h-6 w-6 mr-3" />
                      Bağış Kampanyası
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/raffles">
                <Button variant="ghost" className="text-white hover:bg-white/10 font-semibold">
                  Çekilişleri Keşfet
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              
              <Link href="/donations">
                <Button variant="ghost" className="text-white hover:bg-white/10 font-semibold">
                  Bağış Kampanyaları
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Platform İstatistikleri
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              DUXXAN topluluğunun büyüklüğü ve başarıları
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statistics.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl mb-4">
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Neden DUXXAN?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Blockchain teknolojisinin gücüyle desteklenen güvenli ve şeffaf platform özellikleri
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Blockchain Avantajları
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Geleneksel yöntemlerden farklı olarak blockchain teknolojisi ile 
                tam güvenlik ve şeffaflık sunuyoruz.
              </p>
              
              <div className="space-y-4">
                {advantages.map((advantage, index) => {
                  const IconComponent = advantage.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#FFC929] rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-black" />
                      </div>
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {advantage.text}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8">
                <Link href="/about">
                  <Button className="bg-[#FFC929] hover:bg-[#FFB800] text-black font-bold px-8 py-4 rounded-xl">
                    Daha Fazla Bilgi
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] rounded-3xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Blockchain Transaction</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Verified
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hash:</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white">0x7f8a...d2e1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="text-sm font-bold text-[#FFC929]">100 USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="text-sm font-medium text-green-600">Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Bugün Başlayın
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            DUXXAN'a katılın ve blockchain teknolojisinin gücüyle güvenli, 
            şeffaf işlemler gerçekleştirin. Topluluğumuzun bir parçası olun.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/raffles">
              <Button size="lg" className="bg-[#FFC929] hover:bg-[#FFB800] text-black font-bold px-8 py-4 text-lg rounded-xl shadow-2xl">
                <Gift className="h-6 w-6 mr-3" />
                Çekilişleri Keşfet
              </Button>
            </Link>
            
            <Link href="/donations">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold px-8 py-4 text-lg rounded-xl">
                <Heart className="h-6 w-6 mr-3" />
                Bağışları İncele
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}