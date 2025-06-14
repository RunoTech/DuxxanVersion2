import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DonationCard } from '@/components/DonationCard';
import { Link } from 'wouter';
import { useWallet } from '@/hooks/useWallet';
import { Search, Filter, TrendingUp } from 'lucide-react';

export default function Donations() {
  const { isConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch donations
  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['/api/donations'],
    refetchInterval: isConnected ? 30000 : false, // Refresh every 30 seconds if connected
  });

  // Filter and sort donations
  const filteredDonations = donations
    .filter((donation: any) => {
      const matchesSearch = donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           donation.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'ending-soon':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'highest-goal':
          return parseFloat(b.goalAmount) - parseFloat(a.goalAmount);
        case 'most-funded':
          const aProgress = (parseFloat(a.currentAmount) / parseFloat(a.goalAmount)) * 100;
          const bProgress = (parseFloat(b.currentAmount) / parseFloat(b.goalAmount)) * 100;
          return bProgress - aProgress;
        case 'most-donors':
          return b.donorCount - a.donorCount;
        default:
          return 0;
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
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Bağış Kampanyaları</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Şeffaf blockchain bağışlarıyla anlamlı amaçları destekleyin
            </p>
          </div>
          <Link href="/create-donation">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500 mt-4 md:mt-0">
              Yeni Kampanya Başlat
            </Button>
          </Link>
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

        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Filter className="w-5 h-5" />
              Filtreler ve Arama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Kampanya ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white pl-10"
                />
              </div>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
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
                }}
                variant="outline"
                className="border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-white"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

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
