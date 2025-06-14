import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DonationCard } from '@/components/DonationCard';
import { Link } from 'wouter';
import { useWallet } from '@/hooks/useWallet';
import { Search, Filter, TrendingUp, Building2, Users, Globe, Heart, Award, Clock, MapPin, Star, Shield } from 'lucide-react';

export default function Donations() {
  const { isConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch donations
  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['/api/donations'],
    refetchInterval: isConnected ? 30000 : false, // Refresh every 30 seconds if connected
  });

  // Organization types and countries
  const organizationTypes = [
    { value: 'all', label: 'Tüm Türler', icon: Globe },
    { value: 'foundation', label: 'Vakıflar', icon: Building2 },
    { value: 'association', label: 'Dernekler', icon: Users },
    { value: 'individual', label: 'Bireysel', icon: Heart },
    { value: 'unlimited', label: 'Sınırsız Bağışlar', icon: Clock },
    { value: 'timed', label: 'Süreli Bağışlar', icon: Clock },
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
  const filteredDonations = donations
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
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">DUXXAN Bağış Platformu</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vakıflar, Dernekler ve Bireysel Bağışçılar İçin Blockchain Tabanlı Şeffaf Platform
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link href="/create-donation">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500">
                <Heart className="w-4 h-4 mr-2" />
                Kampanya Başlat
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-500 mb-2">
                {getActiveCampaignsCount()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Aktif Kampanyalar</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-2">
                {getTotalRaised().toLocaleString()} USDT
              </div>
              <div className="text-gray-600 dark:text-gray-400">Toplanan Miktar</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-500 mb-2">
                {getTotalDonors().toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Toplam Bağışçı</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {getAverageContribution().toFixed(0)} USDT
              </div>
              <div className="text-gray-600 dark:text-gray-400">Ortalama Bağış</div>
            </CardContent>
          </Card>
        </div>

        {/* Market Cap Display */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Bağış Pazar Değeri
                </h3>
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {getTotalRaised().toLocaleString()} USDT
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-500">↗ Canlı Güncellemeler</span>
                  <span className="text-gray-600 dark:text-gray-400">Blockchain Doğrulanmış</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {donations.length} Toplam Kampanya
                  </span>
                </div>
              </div>
              <div className="hidden md:block w-32 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Types Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {organizationTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <TabsTrigger 
                  key={type.value} 
                  value={type.value}
                  className="flex items-center gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden md:inline">{type.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Enhanced Filters */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Filter className="w-5 h-5" />
                Gelişmiş Filtreler ve Arama
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Kampanya ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white dark:bg-gray-700 border-yellow-200 focus:border-yellow-500 text-gray-900 dark:text-white pl-10"
                  />
                </div>

                {/* Country Filter */}
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-yellow-200 focus:border-yellow-500 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Ülke Seç" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-yellow-200 focus:border-yellow-500 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Kategori Seç" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-yellow-200 focus:border-yellow-500 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Sırala" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                  className="bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500"
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
              </CardHeader>
            </Card>
            
            {/* Foundation Donations Grid */}
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

          <TabsContent value="unlimited" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Sınırsız Süreli Kampanyalar
                  <Badge className="bg-purple-100 text-purple-800">100 USDT Başlangıç Ücreti</Badge>
                  <Badge className="bg-blue-100 text-blue-800 ml-2">
                    <Star className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Sadece doğrulanmış organizasyonlar tarafından açılabilen, süresiz bağış kampanyaları. 
                  Uzun vadeli projeler için ideal.
                </p>
              </CardHeader>
            </Card>
            
            {/* Unlimited Donations Grid */}
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
                <Clock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz sınırsız kampanya bulunmuyor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Premium sınırsız süreli kampanyalar burada görünecek.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timed" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Süreli Kampanyalar
                  <Badge className="bg-orange-100 text-orange-800">Belirli Süre</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                    <Award className="w-3 h-3 mr-1" />
                    Standart
                  </Badge>
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Belirli bir süre ile sınırlı bağış kampanyaları. 
                  Acil ihtiyaçlar ve kısa vadeli projeler için uygundur.
                </p>
              </CardHeader>
            </Card>
            
            {/* Timed Donations Grid */}
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
                <Clock className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz süreli kampanya bulunmuyor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Süreli bağış kampanyaları burada görünecek.
                </p>
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
