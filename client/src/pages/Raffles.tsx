import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RaffleCard } from '@/components/RaffleCard';
import { WalletStatus } from '@/components/WalletStatus';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { Link } from 'wouter';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { Search, Filter } from 'lucide-react';

export default function Raffles() {
  const { isConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedCountry('all');
    setSelectedStatus('all');
  };

  // Fetch categories with caching
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: true
  });

  // Fetch countries with caching
  const { data: countries = [] } = useQuery({
    queryKey: ['/api/countries'],
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    enabled: true
  });

  // Fetch active raffles with filters
  const { data: rafflesData, isLoading } = useQuery({
    queryKey: ['/api/raffles/active', searchTerm, selectedCategory, selectedCountry, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCountry !== 'all') params.append('country', selectedCountry);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      
      const response = await fetch(`/api/raffles/active?${params.toString()}`);
      const result = await response.json();
      return Array.isArray(result.data) ? result.data : [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute cache
    enabled: true
  });

  const raffles = Array.isArray(rafflesData) ? rafflesData : [];

  // Filter raffles
  const filteredRaffles = raffles.filter((raffle: any) => {
    const matchesSearch = raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         raffle.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || raffle.categoryId.toString() === selectedCategory;
    const matchesCountry = selectedCountry === 'all' || raffle.countryId?.toString() === selectedCountry;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && raffle.isActive) ||
                         (selectedStatus === 'ended' && !raffle.isActive);
    
    return matchesSearch && matchesCategory && matchesCountry && matchesStatus;
  });

  const getActiveRafflesCount = () => {
    if (!Array.isArray(raffles)) return 0;
    const now = new Date();
    return raffles.filter((raffle: any) => new Date(raffle.endDate) > now && raffle.isActive).length;
  };

  const getTotalPrizePool = () => {
    if (!Array.isArray(raffles)) return 0;
    return raffles
      .filter((raffle: any) => raffle.isActive)
      .reduce((sum: number, raffle: any) => sum + parseFloat(raffle.prizeValue || 0), 0);
  };

  return (
    <div className="min-h-screen bg-duxxan-page py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wallet Status */}
        <div className="mb-6">
          <WalletStatus />
        </div>

        {/* Compact Filter Section */}
        <div className="mb-8">
          <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl border border-gray-700 dark:border-gray-600 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Gelişmiş Filtreler ve Arama</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Kampanya ara..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-gray-800 text-white placeholder-gray-400 text-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Countries with green indicator */}
              <div>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white hover:border-gray-500 transition-colors py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <SelectValue placeholder="Tüm Ülkeler" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white">Tüm Ülkeler</SelectItem>
                    {countries.map((country: any) => (
                      <SelectItem key={country.id} value={country.id.toString()} className="text-white">
                        <div className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white hover:border-gray-500 transition-colors py-3">
                    <SelectValue placeholder="Tüm Kategoriler" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white">Tüm Kategoriler</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()} className="text-white">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white hover:border-gray-500 transition-colors py-3">
                    <SelectValue placeholder="En Yeni" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white">En Yeni</SelectItem>
                    <SelectItem value="active" className="text-white">Aktif</SelectItem>
                    <SelectItem value="ended" className="text-white">Biten</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end mt-4">
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm"
              >
                Tümünü Temizle
              </Button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Tüm Çekilişler</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Muhteşem ödülleri keşfedin ve heyecan verici çekilişlere katılın
            </p>
          </div>
          <Link href="/create-raffle">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500 mt-4 md:mt-0">
              Yeni Çekiliş Oluştur
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="text-lg md:text-xl font-bold text-yellow-500 mb-2 break-words">
                {getActiveRafflesCount()}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">Aktif Çekilişler</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="text-lg md:text-2xl font-bold text-green-500 mb-2 break-words">
                ${getTotalPrizePool().toLocaleString()}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">Toplam Ödül Havuzu</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="text-xl md:text-2xl font-bold text-orange-500 mb-2 break-words">
                {Array.isArray(raffles) ? raffles.length : 0}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">Tüm Zamanlar Çekiliş</div>
            </CardContent>
          </Card>
        </div>

        {/* Raffles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="text-gray-600 dark:text-gray-400">Yükleniyor...</div>
            </div>
          ) : filteredRaffles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-600 dark:text-gray-400 mb-4">Henüz çekiliş bulunmuyor</div>
              <Link href="/create-raffle">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  İlk Çekilişi Oluştur
                </Button>
              </Link>
            </div>
          ) : (
            filteredRaffles.map((raffle: any) => (
              <AnimatedCard key={raffle.id} delay={0.1}>
                <RaffleCard raffle={raffle} />
              </AnimatedCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}