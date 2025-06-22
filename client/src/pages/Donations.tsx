import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { WalletStatus } from '@/components/WalletStatus';
import { Link } from 'wouter';
import { 
  Search, 
  Filter, 
  Globe,
  Heart,
  Target,
  Users,
  Calendar,
  Plus,
  TrendingUp,
  Handshake,
  Shield,
  Zap
} from 'lucide-react';

// New Modern Donation Card Component
function ModernDonationCard({ donation }: { donation: any }) {
  const progress = (parseFloat(donation.currentAmount) / parseFloat(donation.goalAmount)) * 100;
  const endDate = new Date(donation.endDate);
  const timeLeft = endDate.getTime() - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const formatCurrency = (value: string | number) => {
    const num = parseFloat(value.toString());
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getUrgencyLevel = () => {
    if (progress < 25) return { color: 'red', label: 'Acil', icon: '🚨' };
    if (progress < 50) return { color: 'orange', label: 'Önemli', icon: '⚡' };
    if (progress < 75) return { color: 'blue', label: 'İlerliyor', icon: '📈' };
    return { color: 'green', label: 'Hedefte', icon: '🎯' };
  };

  const urgency = getUrgencyLevel();

  return (
    <Card className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-emerald-400/50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Top Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>
      
      <CardHeader className="p-5 pb-3">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-emerald-100 dark:ring-emerald-900">
                <AvatarImage src="/api/placeholder/48/48" />
                <AvatarFallback className="bg-emerald-500 text-white font-bold">
                  {donation.creator?.username?.charAt(0).toUpperCase() || 'D'}
                </AvatarFallback>
              </Avatar>
              {donation.creator?.organizationVerified && (
                <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Shield className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">
                {donation.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  @{donation.creator?.username || 'anonim'}
                </span>
                {donation.creator?.organizationType && (
                  <Badge variant="secondary" className="text-xs">
                    {donation.creator.organizationType}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <Badge className={`bg-${urgency.color}-100 text-${urgency.color}-700 border-${urgency.color}-200`}>
              {urgency.icon} {urgency.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {donation.category || 'Bağış'}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
          {donation.description}
        </p>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              İlerleme: {formatCurrency(donation.currentAmount)} / {formatCurrency(donation.goalAmount)} USDT
            </span>
            <span className="text-sm font-bold text-emerald-600">{progress.toFixed(1)}%</span>
          </div>
          
          <div className="relative">
            <Progress value={progress} className="h-3 bg-gray-100 dark:bg-gray-700">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </Progress>
            {progress >= 100 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">✓ Tamamlandı</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-lg font-bold text-blue-600">{donation.donorCount}</span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Bağışçı</span>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-lg font-bold text-orange-600">
                {daysLeft > 0 ? `${daysLeft}g` : 'Bitti'}
              </span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Kalan</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Quick Donation Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {['10', '25', '50'].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20 text-xs"
              >
                ${amount}
              </Button>
            ))}
          </div>
          
          {/* Main Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={progress >= 100 || daysLeft <= 0}
            >
              <Heart className="h-4 w-4 mr-2" />
              Bağışla
            </Button>
            <Link href={`/donations/${donation.id}`}>
              <Button variant="outline" className="border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                Detay
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Güvenli</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Zap className="h-3 w-3" />
            <span>Hızlı</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Heart className="h-3 w-3" />
            <span>Şeffaf</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Donations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['/api/donations'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/donation-categories'],
  });

  const countries = [
    { code: 'TR', name: 'Türkiye', flag: '🇹🇷' },
    { code: 'US', name: 'Amerika', flag: '🇺🇸' },
    { code: 'GB', name: 'İngiltere', flag: '🇬🇧' },
    { code: 'DE', name: 'Almanya', flag: '🇩🇪' },
    { code: 'FR', name: 'Fransa', flag: '🇫🇷' },
  ];

  const filteredDonations = useMemo(() => {
    if (!Array.isArray(donations)) return [];
    
    return donations
      .filter((donation: any) => {
        const matchesSearch = donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            donation.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || donation.category === selectedCategory;
        const matchesCountry = selectedCountry === 'all' || donation.country === selectedCountry;
        
        return matchesSearch && matchesCategory && matchesCountry;
      })
      .sort((a: any, b: any) => {
        switch (sortBy) {
          case 'ending-soon':
            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          case 'highest-goal':
            return parseFloat(b.goalAmount) - parseFloat(a.goalAmount);
          case 'most-funded':
            return parseFloat(b.currentAmount) - parseFloat(a.currentAmount);
          case 'most-donors':
            return b.donorCount - a.donorCount;
          case 'urgent':
            const progressA = (parseFloat(a.currentAmount) / parseFloat(a.goalAmount)) * 100;
            const progressB = (parseFloat(b.currentAmount) / parseFloat(b.goalAmount)) * 100;
            return progressA - progressB;
          default:
            return new Date(b.createdAt || b.id).getTime() - new Date(a.createdAt || a.id).getTime();
        }
      });
  }, [donations, searchTerm, selectedCategory, selectedCountry, sortBy]);

  const getStats = () => {
    const activeDonations = Array.isArray(donations) ? donations.filter((d: any) => new Date(d.endDate) > new Date()) : [];
    const totalRaised = Array.isArray(donations) ? donations.reduce((sum: number, donation: any) => sum + parseFloat(donation.currentAmount), 0) : 0;
    const totalDonors = Array.isArray(donations) ? donations.reduce((sum: number, donation: any) => sum + donation.donorCount, 0) : 0;
    
    return { activeDonations: activeDonations.length, totalRaised, totalDonors };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20">
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Handshake className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Hayat Değiştiren Bağışlar</h1>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
              İyilik yapmak için bir araya geliyoruz. Her bağış bir umut, her destek bir değişim.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-6 w-6 text-white" />
                  <div className="text-3xl font-bold text-white">{stats.activeDonations}</div>
                </div>
                <div className="text-white/80">Aktif Kampanya</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="h-6 w-6 text-white" />
                  <div className="text-3xl font-bold text-white">${stats.totalRaised.toLocaleString()}</div>
                </div>
                <div className="text-white/80">Toplanan Bağış</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-6 w-6 text-white" />
                  <div className="text-3xl font-bold text-white">{stats.totalDonors.toLocaleString()}</div>
                </div>
                <div className="text-white/80">Destek Veren</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Status */}
        <div className="mb-8">
          <WalletStatus />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
          <Link href="/create-donation">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl px-6 py-3">
              <Plus className="h-5 w-5 mr-2" />
              Yeni Kampanya Başlat
            </Button>
          </Link>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredDonations.length} kampanya gösteriliyor
          </div>
        </div>

        {/* Modern Filters */}
        <Card className="mb-8 border-0 shadow-xl bg-white dark:bg-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kampanya Filtreleri</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Kampanya ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Category */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-emerald-500">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  <SelectItem value="health">Sağlık</SelectItem>
                  <SelectItem value="education">Eğitim</SelectItem>
                  <SelectItem value="environment">Çevre</SelectItem>
                  <SelectItem value="disaster">Afet</SelectItem>
                  <SelectItem value="animal">Hayvan</SelectItem>
                </SelectContent>
              </Select>

              {/* Country */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-emerald-500">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ülke" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌍 Tüm Ülkeler</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:border-emerald-500">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">En Yeni</SelectItem>
                  <SelectItem value="urgent">En Acil</SelectItem>
                  <SelectItem value="ending-soon">Sona Erme</SelectItem>
                  <SelectItem value="highest-goal">En Yüksek Hedef</SelectItem>
                  <SelectItem value="most-funded">En Çok Bağış</SelectItem>
                  <SelectItem value="most-donors">En Çok Destekçi</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear */}
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedCountry('all');
                  setSortBy('newest');
                }}
                variant="outline"
                className="border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Donations Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <div className="h-1 bg-gray-200 dark:bg-gray-700"></div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDonations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.map((donation: any) => (
              <ModernDonationCard key={donation.id} donation={donation} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 border-0 shadow-xl">
            <CardContent>
              <div className="flex justify-center mb-6">
                <div className="bg-emerald-100 dark:bg-emerald-900/20 rounded-full p-6">
                  <Heart className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Kampanya Bulunamadı</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'İlk yardım kampanyasını başlatan siz olun!'
                }
              </p>
              <div className="flex justify-center gap-4">
                {(searchTerm || selectedCategory !== 'all' || selectedCountry !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedCountry('all');
                    }}
                    variant="outline"
                    className="border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  >
                    Filtreleri Temizle
                  </Button>
                )}
                <Link href="/create-donation">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold">
                    Kampanya Başlat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}