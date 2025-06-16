import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { useWallet } from '@/hooks/useWallet';
import { 
  Shield, 
  Globe, 
  TrendingUp, 
  Users, 
  Heart, 
  Gift, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  Award,
  Lock,
  Coins,
  BarChart3,
  Timer,
  Target
} from 'lucide-react';

export default function Home() {
  const { isConnected } = useWallet();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch platform statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 30000,
  });

  const { data: activeRaffles } = useQuery({
    queryKey: ['/api/raffles/active'],
    refetchInterval: 30000,
  });

  const { data: activeDonations } = useQuery({
    queryKey: ['/api/donations/active'],
    refetchInterval: 30000,
  });

  const heroSlides = [
    {
      title: "Blockchain Tabanlı Şeffaflık",
      subtitle: "Her işlem blockchain üzerinde doğrulanır",
      icon: Shield,
      color: "text-green-500"
    },
    {
      title: "Küresel Erişim",
      subtitle: "Dünya çapında bağış ve çekiliş platformu",
      icon: Globe,
      color: "text-blue-500"
    },
    {
      title: "Gerçek Zamanlı Güncellemeler",
      subtitle: "Canlı veriler ve anlık bildirimler",
      icon: Zap,
      color: "text-yellow-500"
    }
  ];

  const features = [
    {
      icon: Heart,
      title: "Şeffaf Bağışlar",
      description: "Her bağış blockchain üzerinde takip edilebilir ve şeffaftır",
      stats: Array.isArray(activeDonations) ? activeDonations.length : 0
    },
    {
      icon: Gift,
      title: "Adil Çekilişler",
      description: "Blockchain tabanlı rastgele sayı üretimi ile adil çekilişler",
      stats: Array.isArray(activeRaffles) ? activeRaffles.length : 0
    },
    {
      icon: Users,
      title: "Topluluk Odaklı",
      description: "Dernekler, vakıflar ve bireysel kampanyalar için platform",
      stats: "1000+"
    },
    {
      icon: Shield,
      title: "Güvenli İşlemler",
      description: "Smart contract tabanlı güvenli ödeme sistemi",
      stats: "100%"
    }
  ];

  const platformStats = [
    {
      value: (stats as any)?.totalRaffles || "0",
      label: "Toplam Çekiliş",
      icon: Gift,
      color: "text-purple-500"
    },
    {
      value: `${(stats as any)?.totalPrizePool || "0"} USDT`,
      label: "Toplam Ödül Havuzu",
      icon: Coins,
      color: "text-green-500"
    },
    {
      value: (stats as any)?.totalDonations || "0",
      label: "Toplam Bağış",
      icon: Heart,
      color: "text-red-500"
    },
    {
      value: (stats as any)?.totalUsers || "500+",
      label: "Aktif Kullanıcı",
      icon: Users,
      color: "text-blue-500"
    }
  ];

  const advantages = [
    {
      icon: Lock,
      title: "Güvenlik",
      description: "Smart contract tabanlı güvenli işlemler"
    },
    {
      icon: BarChart3,
      title: "Şeffaflık",
      description: "Tüm işlemler blockchain üzerinde görülebilir"
    },
    {
      icon: Timer,
      title: "Hız",
      description: "Anında işlem onayları ve hızlı transferler"
    },
    {
      icon: Target,
      title: "Doğruluk",
      description: "Manipüle edilemeyen adil sistem"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#1D2025] transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-yellow-50 via-white to-yellow-50 dark:from-[#1D2025] dark:via-[#2A2D35] dark:to-[#1D2025] py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              {heroSlides.map((slide, index) => {
                const IconComponent = slide.icon;
                return (
                  <div
                    key={index}
                    className={`transition-all duration-500 ${
                      index === currentSlide
                        ? `${slide.color} scale-110 opacity-100`
                        : 'text-gray-400 scale-90 opacity-50'
                    }`}
                  >
                    <IconComponent className="w-12 h-12" />
                  </div>
                );
              })}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              DUXXAN
            </h1>
            
            <div className="h-20 mb-8">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute'
                  }`}
                >
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                    {slide.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {slide.subtitle}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
              Blockchain teknolojisi ile desteklenen şeffaf, güvenli ve adil bağış ve çekiliş platformu. 
              Dernekler, vakıflar ve bireyler için tasarlanmış yenilikçi çözüm.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/donations">
                <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 text-lg">
                  <Heart className="mr-2 h-5 w-5" />
                  Bağış Yap
                </Button>
              </Link>
              <Link href="/raffles">
                <Button size="lg" variant="outline" className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white px-8 py-4 text-lg">
                  <Gift className="mr-2 h-5 w-5" />
                  Çekilişlere Katıl
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-16 bg-gray-50 dark:bg-[#2A2D35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Platform İstatistikleri</h2>
            <p className="text-gray-600 dark:text-gray-400">Gerçek zamanlı verilerle platform performansı</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {platformStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="bg-white dark:bg-[#1D2025] border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <IconComponent className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Platform Özellikleri</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Neden DUXXAN?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Blockchain teknolojisinin gücüyle desteklenen güvenli, şeffaf ve kullanıcı dostu platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-white dark:bg-[#2A2D35] border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {feature.description}
                    </p>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {feature.stats}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-[#2A2D35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Üç basit adımda DUXXAN platformunu kullanmaya başlayın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cüzdan Bağlayın</h3>
              <p className="text-gray-600 dark:text-gray-400">
                MetaMask veya Trust Wallet ile güvenli bağlantı kurun
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Kampanya Seçin</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Bağış kampanyalarına katılın veya çekilişlerde şansınızı deneyin
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">İşlem Yapın</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Blockchain üzerinde güvenli ve şeffaf işlemler gerçekleştirin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Advantages */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Platform Avantajları
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Blockchain teknolojisinin sunduğu benzersiz avantajlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {advantage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            DUXXAN'a Katılmaya Hazır mısınız?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Blockchain tabanlı şeffaf ve güvenli platform ile bağış yapın veya çekilişlere katılın
          </p>
          
          {!isConnected ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                <Shield className="mr-2 h-5 w-5" />
                Cüzdan Bağla
              </Button>
              <Link href="/donations">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                >
                  Platformu Keşfet
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donations">
                <Button 
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Bağış Yap
                </Button>
              </Link>
              <Link href="/raffles">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                >
                  Çekilişlere Katıl
                  <Gift className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}