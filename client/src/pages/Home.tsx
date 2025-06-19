import { useState, useEffect } from 'react';
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

  // Format large numbers for better display
  const formatValue = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return "0";
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const platformStats = [
    {
      value: (stats as any)?.totalRaffles || "0",
      label: "Toplam Çekiliş",
      icon: Gift,
      color: "text-purple-500"
    },
    {
      value: `${formatValue((stats as any)?.totalPrizePool || "0")} USDT`,
      label: "Toplam Ödül Havuzu",
      icon: Coins,
      color: "text-green-500"
    },
    {
      value: `${formatValue((stats as any)?.totalDonations || "0")} USDT`,
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
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-[#0F1419] dark:via-[#1A1B23] dark:to-[#2D1B69] py-24 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Logo and Branding */}
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-3xl font-black text-white">D</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  DUXXAN
                </h1>
                <p className="text-sm md:text-base font-medium text-gray-600 dark:text-gray-300 tracking-wider">
                  BLOCKCHAIN PLATFORM
                </p>
              </div>
            </div>

            {/* Dynamic Features Showcase */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full px-6 py-3 mb-6 shadow-lg">
                {heroSlides.map((slide, index) => {
                  const IconComponent = slide.icon;
                  return (
                    <div
                      key={index}
                      className={`transition-all duration-700 ${
                        index === currentSlide
                          ? `${slide.color} scale-110 opacity-100`
                          : 'text-gray-400 scale-75 opacity-40'
                      }`}
                    >
                      <IconComponent className="w-8 h-8" />
                    </div>
                  );
                })}
              </div>
              
              <div className="h-24 mb-8 relative">
                {heroSlides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide 
                        ? 'opacity-100' 
                        : 'opacity-0'
                    }`}
                  >
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                      {slide.title}
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium">
                      {slide.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Value Proposition */}
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-8 leading-relaxed">
                Dünya'nın en güvenli <span className="text-yellow-600 dark:text-yellow-400 font-bold">blockchain tabanlı</span> 
                <br className="hidden md:block" />
                bağış ve çekiliş platformu
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">%100 Güvenli</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Smart contract koruması</p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Küresel Erişim</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">7/24 her yerden erişim</p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <TrendingUp className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Şeffaf İşlemler</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Blockchain doğrulaması</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-6">
              {!isConnected ? (
                <div className="text-center">
                  <WalletConnectButton 
                    size="lg" 
                    className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white px-12 py-6 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300" 
                  />
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 font-medium">
                    🚀 Cüzdanınızı bağlayın ve hemen başlayın
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link href="/donations">
                    <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-6 text-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-300">
                      <Heart className="mr-3 h-6 w-6" />
                      Bağış Kampanyaları
                    </Button>
                  </Link>
                  <Link href="/raffles">
                    <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-10 py-6 text-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-300">
                      <Gift className="mr-3 h-6 w-6" />
                      Çekiliş Dünyası
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-12 border-t border-gray-200/30 dark:border-gray-700/30">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="font-medium">BSC Blockchain</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Doğrulanmış Kontrat</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">USDT Ödemeleri</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 text-lg font-bold">
              📊 PLATFORM VERİLERİ
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              DUXXAN Ağı Büyüyor
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Küresel kullanıcıların güveniyle büyüyen, blockchain tabanlı şeffaf ekosistem
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {platformStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <Card className="relative bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105 rounded-2xl">
                    <CardContent className="p-4 md:p-6 lg:p-8">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl">
                        <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 break-words">
                        {stat.value}
                      </div>
                      <div className="text-sm md:text-base lg:text-lg font-semibold text-gray-300 break-words">
                        {stat.label}
                      </div>
                      <div className="mt-3 md:mt-4 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Live Activity Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-green-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-bold">CANLI</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Canlı Bağışlar</h3>
              <p className="text-gray-300">{Array.isArray(activeDonations) ? activeDonations.length : 0} kampanya bağış kabul ediyor</p>
            </div>
            
            <div className="bg-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-400 font-bold">AKTIF</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Aktif Çekilişler</h3>
              <p className="text-gray-300">{Array.isArray(activeRaffles) ? activeRaffles.length : 0} çekiliş bilet satışında</p>
            </div>
            
            <div className="bg-yellow-500/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-400 font-bold">GÜVENLİ</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Blockchain Koruması</h3>
              <p className="text-gray-300">Tüm işlemler BSC üzerinde doğrulanıyor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-[#1D2025] dark:via-[#2A2D35] dark:to-[#1D2025]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full font-bold text-lg mb-8 shadow-lg">
              <Star className="w-5 h-5" />
              BLOCKCHAIN AVANTAJLARI
              <Star className="w-5 h-5" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-8">
              Güvenli ve Şeffaf Sistem
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto font-medium">
              Geleneksel platformlardan farklı olarak, blockchain teknolojisini kullanarak 
              <span className="text-yellow-600 dark:text-yellow-400 font-bold"> tam şeffaflık</span> sağlıyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <Card className="relative bg-white/80 dark:bg-[#2A2D35]/80 backdrop-blur-lg border-2 border-white/50 dark:border-gray-700/50 hover:border-yellow-400/50 transition-all duration-500 hover:scale-110 transform group-hover:shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="text-center pb-4">
                      <div className="relative mx-auto w-20 h-20 mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                        <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center w-full h-full shadow-2xl">
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center px-6 pb-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-black text-xl shadow-lg">
                        {feature.stats}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Trust Building Section */}
          <div className="mt-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="relative z-10">
              <Shield className="w-16 h-16 mx-auto mb-6" />
              <h3 className="text-3xl md:text-4xl font-black mb-6">
                %100 Güvenli ve Şeffaf İşlemler
              </h3>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                Smart contract teknolojisi sayesinde her işlem blockchain üzerinde kayıtlı. 
                Hiçbir manipülasyon veya hile mümkün değil!
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg rounded-full px-6 py-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">Doğrulanmış Kontrat</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg rounded-full px-6 py-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">BSC Blockchain</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg rounded-full px-6 py-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">USDT Ödemeleri</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-stars-pattern opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <Badge className="mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-8 py-3 text-lg font-bold shadow-lg">
              ⚡ KOLAY KULLANIM
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
              3 Adımda Başlayın
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto font-medium">
              Blockchain teknolojisini kullanmak hiç bu kadar kolay olmamıştı. 
              Sadece 3 adımda güvenli işlemler yapın!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                  <span className="text-4xl font-black text-white">1</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-6">Cüzdan Bağlayın</h3>
              <p className="text-lg text-gray-300 leading-relaxed max-w-sm mx-auto">
                MetaMask, Trust Wallet veya WalletConnect ile saniyeler içinde güvenli bağlantı kurun. 
                Hiçbir özel bilgi gerekmez!
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                  <span className="text-4xl font-black text-white">2</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-6">Kampanya Seçin</h3>
              <p className="text-lg text-gray-300 leading-relaxed max-w-sm mx-auto">
                Binlerce doğrulanmış bağış kampanyası ve çekiliş arasından beğendiğinizi seçin. 
                Hepsi blockchain korumalı!
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                  <span className="text-4xl font-black text-white">3</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-6">İşlem Yapın</h3>
              <p className="text-lg text-gray-300 leading-relaxed max-w-sm mx-auto">
                USDT ile güvenli ödeme yapın. Blockchain üzerinde doğrulanan her işlem 
                tamamen şeffaf ve geri alınamaz!
              </p>
            </div>
          </div>

          {/* Process Flow Visualization */}
          <div className="mt-20 bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="font-bold">👛</span>
                </div>
                <span className="font-bold text-lg">Cüzdan</span>
              </div>
              
              <ArrowRight className="w-8 h-8 text-gray-400 hidden lg:block" />
              <div className="w-1 h-8 bg-gray-400 lg:hidden"></div>
              
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="font-bold">🎯</span>
                </div>
                <span className="font-bold text-lg">Kampanya</span>
              </div>
              
              <ArrowRight className="w-8 h-8 text-gray-400 hidden lg:block" />
              <div className="w-1 h-8 bg-gray-400 lg:hidden"></div>
              
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="font-bold">⚡</span>
                </div>
                <span className="font-bold text-lg">İşlem</span>
              </div>
              
              <ArrowRight className="w-8 h-8 text-gray-400 hidden lg:block" />
              <div className="w-1 h-8 bg-gray-400 lg:hidden"></div>
              
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="font-bold">🎉</span>
                </div>
                <span className="font-bold text-lg">Başarı!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-75"></div>
          <div className="absolute bottom-20 left-20 w-5 h-5 bg-green-400 rounded-full animate-bounce delay-150"></div>
          <div className="absolute bottom-10 right-10 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-300"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-12">
            <Badge className="mb-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 text-xl font-black shadow-2xl">
              🚀 BLOCKCHAIN DEVRİMİ
            </Badge>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
              Güvenli Geleceğe Katılın
            </h2>
            <p className="text-2xl md:text-3xl text-gray-200 mb-8 font-medium max-w-4xl mx-auto leading-relaxed">
              Dünya'nın en güvenli blockchain platformunda 
              <span className="text-yellow-400 font-bold"> binlerce kişi</span> ile birlikte
              <br className="hidden md:block" /> 
              şeffaf işlemler yapın
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Tam Güvenlik</h3>
              <p className="text-gray-300">Smart contract koruması ile %100 güvenli işlemler</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Küresel Platform</h3>
              <p className="text-gray-300">Dünyanın her yerinden erişim, 7/24 aktif sistem</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Şeffaf Sistem</h3>
              <p className="text-gray-300">Her işlem blockchain üzerinde doğrulanabilir</p>
            </div>
          </div>

          {/* Main CTA */}
          <div className="space-y-8">
            {!isConnected ? (
              <div className="space-y-6">
                <WalletConnectButton 
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white px-16 py-8 text-2xl font-black shadow-2xl transform hover:scale-110 transition-all duration-300 rounded-2xl"
                />
                <p className="text-xl text-gray-300 font-medium">
                  Cüzdanınızı bağlayarak güvenli blockchain dünyasına adım atın
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
                  <Link href="/donations">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-3 border-white/50 text-white hover:bg-white/20 backdrop-blur-lg px-10 py-6 text-xl font-bold rounded-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      Bağış Kampanyalarını İncele
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                  </Link>
                  <Link href="/raffles">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-3 border-white/50 text-white hover:bg-white/20 backdrop-blur-lg px-10 py-6 text-xl font-bold rounded-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      Çekilişleri Keşfet
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-green-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 inline-block">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-bold text-lg">Cüzdanınız Bağlı - Hazırsınız!</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-8 justify-center">
                  <Link href="/donations">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-8 text-2xl font-black shadow-2xl transform hover:scale-110 transition-all duration-300 rounded-2xl"
                    >
                      <Heart className="mr-4 h-8 w-8" />
                      Bağış Kampanyaları
                      <ArrowRight className="ml-4 h-8 w-8" />
                    </Button>
                  </Link>
                  <Link href="/raffles">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-12 py-8 text-2xl font-black shadow-2xl transform hover:scale-110 transition-all duration-300 rounded-2xl"
                    >
                      <Gift className="mr-4 h-8 w-8" />
                      Çekiliş Dünyası
                      <ArrowRight className="ml-4 h-8 w-8" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-16 pt-12 border-t border-white/20">
              <p className="text-gray-400 mb-6 text-lg">Güvendiğiniz teknolojiler:</p>
              <div className="flex flex-wrap justify-center items-center gap-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3">
                  <Shield className="w-6 h-6 text-green-400" />
                  <span className="text-white font-bold">BSC Blockchain</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3">
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                  <span className="text-white font-bold">Smart Contract</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3">
                  <Coins className="w-6 h-6 text-yellow-400" />
                  <span className="text-white font-bold">USDT Payments</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3">
                  <Award className="w-6 h-6 text-purple-400" />
                  <span className="text-white font-bold">Doğrulanmış</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}