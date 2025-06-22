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
  Sparkles,
  Eye
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
      {/* Hero Section - Bold & Clear */}
      <section className="relative bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] py-16 lg:py-24 overflow-hidden">
        {/* Golden Accent Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFC929] via-[#FFD700] to-[#FFC929]"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFC929] via-[#FFD700] to-[#FFC929]"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#FFC929]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-[#FFD700]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Bold Logo */}
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#FFC929]/30">
                  <span className="text-3xl font-black text-black">D</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl lg:text-7xl font-black text-white leading-none tracking-tight">
                  DUXXAN
                </h1>
                <p className="text-xl text-[#FFC929] font-bold tracking-wider">
                  BLOCKCHAIN PLATFORM
                </p>
              </div>
            </div>
            
            {/* Powerful Headlines */}
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#FFC929] to-[#FFD700] bg-clip-text text-transparent">
                GÜVENİLİR
              </span>
              <br />
              <span className="text-white">
                DİJİTAL PLATFORM
              </span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
              <span className="text-[#FFC929] font-bold">Blockchain teknolojisi</span> ile desteklenen şeffaf çekilişler ve güvenli bağışlar.
              <br />
              <span className="text-white font-semibold">Her işlem doğrulanabilir, her sonuç şeffaf.</span>
            </p>
            
            {/* Clear Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {!isConnected ? (
                <WalletConnectButton 
                  size="lg" 
                  className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFC929] text-black font-black text-lg px-10 py-4 rounded-2xl shadow-2xl hover:shadow-[#FFC929]/50 transition-all duration-300 hover:scale-105 border-0" 
                />
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/create-raffle">
                    <Button size="lg" className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFC929] text-black font-black text-lg px-10 py-4 rounded-2xl shadow-2xl hover:shadow-[#FFC929]/50 transition-all duration-300 hover:scale-105 border-0">
                      <Gift className="h-6 w-6 mr-3" />
                      ÇEKİLİŞ BAŞLAT
                    </Button>
                  </Link>
                  
                  <Link href="/create-donation">
                    <Button size="lg" className="bg-white/10 backdrop-blur-sm border-2 border-[#FFC929] text-[#FFC929] hover:bg-[#FFC929] hover:text-black font-black text-lg px-10 py-4 rounded-2xl transition-all duration-300 hover:scale-105">
                      <Heart className="h-6 w-6 mr-3" />
                      BAĞIŞ YAP
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Trust Indicators - More Prominent */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-[#FFC929]/20">
                <Shield className="h-8 w-8 text-[#FFC929] mx-auto mb-2" />
                <div className="text-white font-bold text-sm">BLOCKCHAIN GÜVENLİ</div>
                <div className="text-gray-400 text-xs">%100 Güvenli İşlemler</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-[#FFC929]/20">
                <Eye className="h-8 w-8 text-[#FFC929] mx-auto mb-2" />
                <div className="text-white font-bold text-sm">TAMAMEN ŞEFFAF</div>
                <div className="text-gray-400 text-xs">Her Adım Görünür</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-[#FFC929]/20">
                <Zap className="h-8 w-8 text-[#FFC929] mx-auto mb-2" />
                <div className="text-white font-bold text-sm">ANINDA İŞLEM</div>
                <div className="text-gray-400 text-xs">Hızlı ve Güvenilir</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section - Compact & Modern */}
      <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Güvenilir Rakamlar
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Blockchain teknolojisiyle desteklenen şeffaf istatistikler
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#FFC929]/10 to-[#FFA500]/10 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - Streamlined */}
      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Dijital Güvenin Yeni Çağı
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Her işlem blockchain'de kayıtlı, her adım doğrulanabilir
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden group hover:scale-[1.02]">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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

      {/* Call to Action - Impactful & Compact */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FFC929] rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#FFA500] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Geleceğe Hazır mısın?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto font-medium">
            Blockchain'in gücüyle desteklenen yeni dijital deneyimi keşfet. 
            <span className="block mt-1 text-[#FFC929]">Güvenli, şeffaf, adil.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/raffles">
              <Button size="lg" className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFC929] text-black font-bold px-8 py-3 rounded-xl shadow-2xl hover:shadow-[#FFC929]/25 transition-all duration-300 hover:scale-105">
                <Gift className="h-5 w-5 mr-2" />
                Çekilişe Katıl
              </Button>
            </Link>
            
            <Link href="/donations">
              <Button size="lg" variant="outline" className="border-2 border-white/70 text-white hover:bg-white/10 backdrop-blur-sm font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105">
                <Heart className="h-5 w-5 mr-2" />
                Hayır Yap
              </Button>
            </Link>
          </div>
          
          {/* Trust Badge */}
          <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/80 text-sm">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Blockchain Güvencesi</span>
          </div>
        </div>
      </section>
    </div>
  );
}