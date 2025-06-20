import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DonationCard } from '@/components/DonationCard';
import { WalletStatus } from '@/components/WalletStatus';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedList } from '@/components/ui/AnimatedList';
import { Link } from 'wouter';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { Search, Filter, TrendingUp, Building2, Users, Globe, Heart, Award, Clock, MapPin, Star, Shield, Dice6, PlayCircle } from 'lucide-react';

export default function Donations() {
  const { isConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch donations with optimized caching
  const { data: donationsResponse, isLoading } = useQuery({
    queryKey: ['/api/donations'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: true,
    retry: 0 // No retries for faster loading
  });

  const donations = (donationsResponse as any)?.data || [];

  // Organization types and countries
  const organizationTypes = [
    { value: 'all', label: 'Tüm Türler', icon: Globe },
    { value: 'countries', label: 'Ülkeler', icon: MapPin },
    { value: 'foundation', label: 'Vakıflar', icon: Building2 },
    { value: 'association', label: 'Dernekler', icon: Users },
    { value: 'individual', label: 'Bireysel', icon: Heart },
  ];

  const countries = [
    { value: 'all', label: '🌍 Tüm Ülkeler' },
    { value: 'TUR', label: '🇹🇷 Türkiye' },
    { value: 'USA', label: '🇺🇸 Amerika' },
    { value: 'GER', label: '🇩🇪 Almanya' },
    { value: 'FRA', label: '🇫🇷 Fransa' },
    { value: 'GBR', label: '🇬🇧 İngiltere' },
    { value: 'JPN', label: '🇯🇵 Japonya' },
    { value: 'CHN', label: '🇨🇳 Çin' },
    { value: 'IND', label: '🇮🇳 Hindistan' },
    { value: 'RUS', label: '🇷🇺 Rusya' },
    { value: 'BRA', label: '🇧🇷 Brezilya' },
    { value: 'CAN', label: '🇨🇦 Kanada' },
    { value: 'AUS', label: '🇦🇺 Avustralya' },
    { value: 'MEX', label: '🇲🇽 Meksika' },
    { value: 'ITA', label: '🇮🇹 İtalya' },
    { value: 'ESP', label: '🇪🇸 İspanya' },
    { value: 'KOR', label: '🇰🇷 Güney Kore' },
    { value: 'NLD', label: '🇳🇱 Hollanda' },
    { value: 'SAU', label: '🇸🇦 Suudi Arabistan' },
    { value: 'CHE', label: '🇨🇭 İsviçre' },
    { value: 'SWE', label: '🇸🇪 İsveç' },
    { value: 'NOR', label: '🇳🇴 Norveç' },
    { value: 'DNK', label: '🇩🇰 Danimarka' },
    { value: 'FIN', label: '🇫🇮 Finlandiya' },
    { value: 'BEL', label: '🇧🇪 Belçika' },
    { value: 'AUT', label: '🇦🇹 Avusturya' },
    { value: 'POL', label: '🇵🇱 Polonya' },
    { value: 'GRC', label: '🇬🇷 Yunanistan' },
    { value: 'PRT', label: '🇵🇹 Portekiz' },
    { value: 'CZE', label: '🇨🇿 Çek Cumhuriyeti' },
    { value: 'HUN', label: '🇭🇺 Macaristan' },
    { value: 'SVK', label: '🇸🇰 Slovakya' },
    { value: 'SVN', label: '🇸🇮 Slovenya' },
    { value: 'HRV', label: '🇭🇷 Hırvatistan' },
    { value: 'BGR', label: '🇧🇬 Bulgaristan' },
    { value: 'ROU', label: '🇷🇴 Romanya' },
    { value: 'LTU', label: '🇱🇹 Litvanya' },
    { value: 'LVA', label: '🇱🇻 Letonya' },
    { value: 'EST', label: '🇪🇪 Estonya' },
    { value: 'MLT', label: '🇲🇹 Malta' },
    { value: 'CYP', label: '🇨🇾 Kıbrıs' },
    { value: 'LUX', label: '🇱🇺 Lüksemburg' },
    { value: 'ISL', label: '🇮🇸 İzlanda' },
    { value: 'IRL', label: '🇮🇪 İrlanda' },
    { value: 'NZL', label: '🇳🇿 Yeni Zelanda' },
    { value: 'SGP', label: '🇸🇬 Singapur' },
    { value: 'ARE', label: '🇦🇪 BAE' },
    { value: 'QAT', label: '🇶🇦 Katar' },
    { value: 'KWT', label: '🇰🇼 Kuveyt' },
    { value: 'BHR', label: '🇧🇭 Bahreyn' },
    { value: 'OMN', label: '🇴🇲 Umman' },
    { value: 'JOR', label: '🇯🇴 Ürdün' },
    { value: 'LBN', label: '🇱🇧 Lübnan' },
    { value: 'ISR', label: '🇮🇱 İsrail' },
    { value: 'EGY', label: '🇪🇬 Mısır' },
    { value: 'ZAF', label: '🇿🇦 Güney Afrika' },
    { value: 'MAR', label: '🇲🇦 Fas' },
    { value: 'TUN', label: '🇹🇳 Tunus' },
    { value: 'DZA', label: '🇩🇿 Cezayir' },
    { value: 'NGA', label: '🇳🇬 Nijerya' },
    { value: 'KEN', label: '🇰🇪 Kenya' },
    { value: 'GHA', label: '🇬🇭 Gana' },
    { value: 'ETH', label: '🇪🇹 Etiyopya' },
    { value: 'THA', label: '🇹🇭 Tayland' },
    { value: 'VNM', label: '🇻🇳 Vietnam' },
    { value: 'MYS', label: '🇲🇾 Malezya' },
    { value: 'IDN', label: '🇮🇩 Endonezya' },
    { value: 'PHL', label: '🇵🇭 Filipinler' },
    { value: 'BGD', label: '🇧🇩 Bangladeş' },
    { value: 'PAK', label: '🇵🇰 Pakistan' },
    { value: 'LKA', label: '🇱🇰 Sri Lanka' },
    { value: 'NPL', label: '🇳🇵 Nepal' },
    { value: 'AFG', label: '🇦🇫 Afganistan' },
    { value: 'IRN', label: '🇮🇷 İran' },
    { value: 'IRQ', label: '🇮🇶 Irak' },
    { value: 'SYR', label: '🇸🇾 Suriye' },
    { value: 'YEM', label: '🇾🇪 Yemen' },
    { value: 'ARG', label: '🇦🇷 Arjantin' },
    { value: 'CHL', label: '🇨🇱 Şili' },
    { value: 'COL', label: '🇨🇴 Kolombiya' },
    { value: 'PER', label: '🇵🇪 Peru' },
    { value: 'VEN', label: '🇻🇪 Venezuela' },
    { value: 'ECU', label: '🇪🇨 Ekvador' },
    { value: 'URY', label: '🇺🇾 Uruguay' },
    { value: 'PRY', label: '🇵🇾 Paraguay' },
    { value: 'BOL', label: '🇧🇴 Bolivya' },
    { value: 'UKR', label: '🇺🇦 Ukrayna' },
    { value: 'BLR', label: '🇧🇾 Belarus' },
    { value: 'MDA', label: '🇲🇩 Moldova' },
    { value: 'GEO', label: '🇬🇪 Gürcistan' },
    { value: 'ARM', label: '🇦🇲 Ermenistan' },
    { value: 'AZE', label: '🇦🇿 Azerbaycan' },
    { value: 'KAZ', label: '🇰🇿 Kazakistan' },
    { value: 'UZB', label: '🇺🇿 Özbekistan' },
    { value: 'KGZ', label: '🇰🇬 Kırgızistan' },
    { value: 'TJK', label: '🇹🇯 Tacikistan' },
    { value: 'TKM', label: '🇹🇲 Türkmenistan' },
    { value: 'MNG', label: '🇲🇳 Moğolistan' },
  ];

  const categories = [
    { value: 'all', label: 'Tüm Kategoriler' },
    { value: 'health', label: 'Sağlık' },
    { value: 'education', label: 'Eğitim' },
    { value: 'disaster', label: 'Afet Yardımı' },
    { value: 'environment', label: 'Çevre' },
    { value: 'animal', label: 'Hayvan Hakları' },
    { value: 'community', label: 'Toplum' },
    { value: 'technology', label: 'Teknoloji' },
    { value: 'general', label: 'Genel' },
  ];

  // Filter and sort donations
  const filteredDonations = (Array.isArray(donations) ? donations : [])
    .filter((donation: any) => {
      const matchesSearch = donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           donation.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = activeTab === 'all' || 
                         (activeTab === 'unlimited' && donation.isUnlimited) ||
                         (activeTab === 'timed' && !donation.isUnlimited) ||
                         (donation.creator?.organizationType === activeTab);
      
      const matchesCountry = selectedCountry === 'all' || donation.country === selectedCountry;
      const matchesCategory = selectedCategory === 'all' || donation.category === selectedCategory;
      
      return matchesSearch && matchesType && matchesCountry && matchesCategory;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'ending-soon':
          if (!a.endDate && !b.endDate) return 0;
          if (!a.endDate) return 1;
          if (!b.endDate) return -1;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'highest-goal':
          return parseFloat(b.goalAmount) - parseFloat(a.goalAmount);
        case 'most-funded':
          return parseFloat(b.currentAmount) - parseFloat(a.currentAmount);
        case 'most-donors':
          return b.donorCount - a.donorCount;
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const getActiveCampaignsCount = () => {
    const now = new Date();
    return donations.filter((donation: any) => new Date(donation.endDate) > now && donation.isActive).length;
  };

  const getTotalRaised = () => {
    return donations
      .filter((donation: any) => donation.isActive)
      .reduce((sum: number, donation: any) => sum + parseFloat(donation.currentAmount), 0);
  };

  const getTotalDonors = () => {
    return donations
      .filter((donation: any) => donation.isActive)
      .reduce((sum: number, donation: any) => sum + donation.donorCount, 0);
  };

  const getAverageContribution = () => {
    const totalRaised = getTotalRaised();
    const totalDonors = getTotalDonors();
    return totalDonors > 0 ? totalRaised / totalDonors : 0;
  };

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 lg:py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wallet Status */}
        <div className="mb-6">
          <WalletStatus />
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8">
          <div className="w-full lg:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-foreground">DUXXAN Bağış Platformu</h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Vakıflar, Dernekler ve Bireysel Bağışçılar İçin Blockchain Tabanlı Şeffaf Platform
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 mt-4 lg:mt-0 w-full lg:w-auto">
            <Link href="/create-donation" className="w-full lg:w-auto">
              <Button className="w-full lg:w-auto">
                <Heart className="w-4 h-4 mr-2" />
                Kampanya Başlat
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">
                {getActiveCampaignsCount()}
              </div>
              <div className="text-sm text-muted-foreground">Aktif Kampanyalar</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-orange-500 mb-1">
                {getTotalRaised().toLocaleString()} USDT
              </div>
              <div className="text-sm text-muted-foreground">Toplanan Miktar</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {getTotalDonors()}
              </div>
              <div className="text-sm text-muted-foreground">Toplam Bağışçı</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500 mb-1">
                {Array.isArray(donations) ? donations.length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Tüm Kampanyalar</div>
            </CardContent>
          </Card>
        </div>

        {/* Market Cap Display */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Bağış Pazar Değeri
                </h3>
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {getTotalRaised().toLocaleString()} USDT
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-500">↗ Canlı Güncellemeler</span>
                  <span className="text-muted-foreground">Blockchain Doğrulanmış</span>
                  <span className="text-muted-foreground">
                    {donations.length} Toplam Kampanya
                  </span>
                </div>
              </div>
              <div className="hidden md:block w-32 h-16 bg-muted rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Types Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            {organizationTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <TabsTrigger 
                  key={type.value} 
                  value={type.value}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden md:inline">{type.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Enhanced Filters */}
          <Card className="bg-card border border-border mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Filter className="w-5 h-5" />
                Gelişmiş Filtreler ve Arama
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Single Row - All filters in one line */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Kampanya ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>

                {/* Country Filter */}
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="🌍 Tüm Ülkeler" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="📁 Tüm Kategoriler" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="🔄 En Yeni" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">En Yeni</SelectItem>
                    <SelectItem value="ending-soon">Yakında Bitiyor</SelectItem>
                    <SelectItem value="highest-goal">En Yüksek Hedef</SelectItem>
                    <SelectItem value="most-funded">En Çok Fonlanan</SelectItem>
                    <SelectItem value="most-donors">En Çok Bağışçı</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSortBy('newest');
                    setSelectedCountry('all');
                    setSelectedCategory('all');
                    setActiveTab('all');
                  }}
                  className="h-10"
                >
                  Tümünü Temizle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tab Content */}
          <TabsContent value="all" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Globe className="w-5 h-5 text-yellow-500" />
                  Tüm Bağış Kampanyaları
                </CardTitle>
              </CardHeader>
            </Card>
            
            {/* Donations Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-[450px] sm:h-[500px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredDonations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {filteredDonations.map((donation: any) => (
                  <DonationCard key={donation.id} donation={donation} />
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz kampanya bulunmuyor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Filtreleri değiştirerek daha fazla kampanya bulabilirsiniz.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSortBy('newest');
                    setSelectedCountry('all');
                    setSelectedCategory('all');
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Filtreleri Temizle
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="foundation" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  Vakıf Kampanyaları
                  <Badge className="bg-blue-100 text-blue-800">%2 Komisyon</Badge>
                  <Badge className="bg-green-100 text-green-800 ml-2">
                    <Shield className="w-3 h-3 mr-1" />
                    Doğrulanmış
                  </Badge>
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Doğrulanmış vakıflar tarafından yürütülen profesyonel bağış kampanyaları. 
                  Sınırsız süre imkanı ve düşük komisyon oranı.
                </p>
                <div className="flex gap-3 mt-4">
                  <Link href="/create-raffle">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Çekiliş Oluştur
                    </Button>
                  </Link>
                  <Link href="/raffles">
                    <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white">
                      <Heart className="w-4 h-4 mr-2" />
                      Çekilişe Katıl
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
            
            {/* Foundation Donations Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-[500px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredDonations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredDonations.map((donation: any) => (
                  <DonationCard key={donation.id} donation={donation} />
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Building2 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz vakıf kampanyası bulunmuyor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Doğrulanmış vakıfların kampanyaları burada görünecek.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="association" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Users className="w-5 h-5 text-green-500" />
                  Dernek Kampanyaları
                  <Badge className="bg-green-100 text-green-800">%2 Komisyon</Badge>
                  <Badge className="bg-green-100 text-green-800 ml-2">
                    <Shield className="w-3 h-3 mr-1" />
                    Doğrulanmış
                  </Badge>
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Sivil toplum kuruluşları ve dernekler tarafından organize edilen 
                  toplumsal fayda odaklı bağış projeleri.
                </p>
                <div className="flex gap-3 mt-4">
                  <Link href="/create-raffle">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Çekiliş Oluştur
                    </Button>
                  </Link>
                  <Link href="/raffles">
                    <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white">
                      <Heart className="w-4 h-4 mr-2" />
                      Çekilişe Katıl
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
            
            {/* Association Donations Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredDonations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDonations.map((donation: any) => (
                  <DonationCard key={donation.id} donation={donation} />
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Users className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz dernek kampanyası bulunmuyor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Doğrulanmış derneklerin kampanyaları burada görünecek.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="individual" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Heart className="w-5 h-5 text-red-500" />
                  Bireysel Kampanyalar
                  <Badge className="bg-red-100 text-red-800">%10 Komisyon</Badge>
                  <Badge className="bg-orange-100 text-orange-800 ml-2">
                    <Clock className="w-3 h-3 mr-1" />
                    30 Gün Limit
                  </Badge>
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Bireysel ihtiyaçlar ve acil durumlar için başlatılan kişisel bağış kampanyaları. 
                  Maksimum 30 gün süre ile sınırlı.
                </p>
              </CardHeader>
            </Card>
            
            {/* Individual Donations Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredDonations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDonations.map((donation: any) => (
                  <DonationCard key={donation.id} donation={donation} />
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Heart className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz bireysel kampanya bulunmuyor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Bireysel bağış kampanyaları burada görünecek.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="countries" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Ülke Bazlı Kampanyalar
                  <Badge className="bg-blue-100 text-blue-800">Küresel Destek</Badge>
                  <Badge className="bg-green-100 text-green-800 ml-2">
                    <Globe className="w-3 h-3 mr-1" />
                    Dünya Çapında
                  </Badge>
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Tüm dünyadan ülkelerin bağış kampanyaları ve çekilişleri. 
                  Her ülkeden vakıf ve dernekler için özel alanlar.
                </p>
                

              </CardHeader>
            </Card>
            
            {/* Countries Grid - Show all countries */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {countries.slice(1).map((country) => ( // Skip "Tüm Ülkeler" option
                (<Link key={country.value} href={`/country/${country.value.toLowerCase()}`}>
                  <Card className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-600 hover:border-yellow-400 transition-colors cursor-pointer group h-full">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{country.label.split(' ')[0]}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-yellow-600">
                        {country.label.split(' ').slice(1).join(' ')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        0 Kampanya
                      </div>
                    </CardContent>
                  </Card>
                </Link>)
              ))}
            </div>
            
            {/* Countries Donations Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredDonations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDonations.map((donation: any) => (
                  <DonationCard key={donation.id} donation={donation} />
                ))}
              </div>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-12 text-center">
                <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Ülkeler arası kampanyalar başlıyor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Dünya çapındaki vakıf ve derneklerin kampanyaları burada görünecek.
                </p>
                <div className="flex justify-center gap-4">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                    <Globe className="w-4 h-4 mr-2" />
                    İlk Küresel Kampanyayı Başlat
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {filteredDonations.length} / {donations.length} kampanya gösteriliyor
          </p>
          {searchTerm && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              "{searchTerm}" için arama sonuçları
            </p>
          )}
        </div>

        {/* Donations Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDonations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDonations.map((donation: any) => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
            <CardContent className="p-12">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Kampanya Bulunamadı</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm 
                  ? 'Arama kriterlerinizi ayarlamayı deneyin'
                  : 'DUXXAN\'da anlamlı bir bağış kampanyası oluşturan ilk kişi olun!'
                }
              </p>
              <div className="flex justify-center gap-4">
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm('')}
                    variant="outline"
                    className="border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-white"
                  >
                    Aramayı Temizle
                  </Button>
                )}
                <Link href="/create-donation">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500">
                    Kampanya Başlat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Load More Button (if needed for pagination) */}
        {filteredDonations.length > 0 && filteredDonations.length < donations.length && (
          <div className="text-center mt-12">
            <Button variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-white">
              Daha Fazla Kampanya Yükle
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Bugün Bir Fark Yaratın</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Her bağış önemlidir. Cömert bağışçılar topluluğumuza katılın ve şeffaf, 
              blockchain doğrulanmış katkılarla dünyada olumlu değişim yaratmaya yardımcı olun.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/create-donation">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500">
                  Kampanyanızı Başlatın
                </Button>
              </Link>
              <Button variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-white">
                Daha Fazla Öğren
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
