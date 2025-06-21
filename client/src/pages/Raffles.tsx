import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RaffleCard } from '@/components/RaffleCard';
import { WalletStatus } from '@/components/WalletStatus';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedList } from '@/components/ui/AnimatedList';
import { Link } from 'wouter';
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
import { Search, Filter, Globe } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function Raffles() {
  const { isConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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
    queryKey: ['/api/raffles/active', searchTerm, selectedCategory, selectedCountry, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCountry !== 'all') params.append('country', selectedCountry);
      if (sortBy) params.append('sort', sortBy);
      
      const response = await apiRequest('GET', `/api/raffles/active?${params.toString()}`);
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute cache
    enabled: true
  });

  const raffles = rafflesData || [];

  // Filter and sort raffles
  const filteredRaffles = raffles.filter((raffle: any) => {
    const matchesSearch = raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         raffle.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || raffle.categoryId.toString() === selectedCategory;
    
    return matchesSearch && matchesCategory;
  })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'ending-soon':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'highest-value':
          return parseFloat(b.prizeValue) - parseFloat(a.prizeValue);
        case 'most-tickets':
          return b.ticketsSold - a.ticketsSold;
        case 'lowest-price':
          return parseFloat(a.ticketPrice) - parseFloat(b.ticketPrice);
        default:
          return 0;
      }
    });

  const getActiveRafflesCount = () => {
    const now = new Date();
    return raffles.filter((raffle: any) => new Date(raffle.endDate) > now && raffle.isActive).length;
  };

  const getTotalPrizePool = () => {
    return raffles
      .filter((raffle: any) => raffle.isActive)
      .reduce((sum: number, raffle: any) => sum + parseFloat(raffle.prizeValue), 0);
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-foreground">DUXXAN Çekiliş Platformu</h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Blockchain Tabanlı Şeffaf Çekiliş Sistemi - Muhteşem Ödüller Sizi Bekliyor
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 mt-4 lg:mt-0 w-full lg:w-auto">
            <Link href="/create-raffle" className="w-full lg:w-auto">
              <Button className="w-full lg:w-auto">
                <span className="mr-2">🎲</span>
                Çekiliş Oluştur
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">
                {getActiveRafflesCount()}
              </div>
              <div className="text-sm text-muted-foreground">Aktif Çekilişler</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-orange-500 mb-1">
                ${getTotalPrizePool().toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Toplam Ödül Havuzu</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {Array.isArray(raffles) ? raffles.length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Tüm Çekilişler</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500 mb-1">
                {raffles.reduce((sum: number, raffle: any) => sum + raffle.ticketsSold, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Satılan Biletler</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="bg-card border border-border mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Filter className="w-5 h-5" />
              Gelişmiş Filtreler ve Arama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Çekiliş ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="📁 Tüm Kategoriler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {(Array.isArray(categories) ? categories : []).map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Country Filter */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="🌍 Tüm Ülkeler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌍 Tüm Ülkeler</SelectItem>
                  {countries.map((country: any) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
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
                  <SelectItem value="highest-value">En Yüksek Ödül</SelectItem>
                  <SelectItem value="most-tickets">En Çok Satan</SelectItem>
                  <SelectItem value="lowest-price">En Düşük Fiyat</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedCountry('all');
                  setSortBy('newest');
                }}
                className="h-10"
                variant="outline"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground text-sm">
            {filteredRaffles.length} / {raffles.length} çekiliş görüntüleniyor
          </p>
          {searchTerm && (
            <p className="text-sm text-muted-foreground">
              "{searchTerm}" için arama sonuçları
            </p>
          )}
        </div>

        {/* Raffles Grid */}
        {isLoading ? (
          <div className="grid responsive-grid gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="responsive-card">
                <div className="h-48 loading-skeleton rounded-t-xl"></div>
                <CardContent className="p-4 md:p-6">
                  <div className="h-4 loading-skeleton rounded w-3/4 mb-2"></div>
                  <div className="h-3 loading-skeleton rounded w-full mb-4"></div>
                  <div className="h-3 loading-skeleton rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRaffles.length > 0 ? (
          <div className="grid responsive-grid gap-4 md:gap-6">
            {filteredRaffles.map((raffle: any) => (
              <RaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        ) : (
          <Card className="duxxan-card text-center">
            <CardContent className="p-12">
              <h3 className="text-xl font-bold mb-4">No Raffles Found</h3>
              <p className="text-duxxan-text-secondary mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search criteria or filters'
                  : 'Be the first to create an exciting raffle on DUXXAN!'
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
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
                  >
                    Filtreleri Temizle
                  </Button>
                )}
                <Link href="/create-raffle">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium">
                    Çekiliş Oluştur
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Load More Button (if needed for pagination) */}
        {filteredRaffles.length > 0 && filteredRaffles.length < raffles.length && (
          <div className="text-center mt-12">
            <Button variant="outline" className="duxxan-button-secondary">
              Load More Raffles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
