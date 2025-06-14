import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RaffleCard } from '@/components/RaffleCard';
import { Link } from 'wouter';
import { useWallet } from '@/hooks/useWallet';
import { Search, Filter, Globe } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function Raffles() {
  const { isConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ['/api/countries'],
    queryFn: () => apiRequest('GET', '/api/countries').then(res => res.json()),
  });

  // Fetch raffles
  const { data: raffles = [], isLoading } = useQuery({
    queryKey: ['/api/raffles'],
  });

  // Filter and sort raffles
  const filteredRaffles = raffles
    .filter((raffle: any) => {
      const matchesSearch = raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           raffle.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || raffle.categoryId.toString() === selectedCategory;
      
      // Country filter logic
      let matchesCountry = true;
      if (selectedCountry !== 'all') {
        if (raffle.countryRestriction === 'all') {
          matchesCountry = true; // Open to all countries
        } else if (raffle.countryRestriction === 'selected' && raffle.allowedCountries) {
          try {
            const allowedCountries = JSON.parse(raffle.allowedCountries);
            matchesCountry = allowedCountries.includes(selectedCountry);
          } catch {
            matchesCountry = true;
          }
        } else if (raffle.countryRestriction === 'exclude' && raffle.excludedCountries) {
          try {
            const excludedCountries = JSON.parse(raffle.excludedCountries);
            matchesCountry = !excludedCountries.includes(selectedCountry);
          } catch {
            matchesCountry = true;
          }
        }
      }
      
      return matchesSearch && matchesCategory && matchesCountry;
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
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Tüm Çekilişler</h1>
            <p className="text-gray-600 dark:text-gray-400">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-500 mb-2">
                {getActiveRafflesCount()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Aktif Çekilişler</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-500 mb-2">
                ${getTotalPrizePool().toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Toplam Ödül Havuzu</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-2">
                {raffles.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Tüm Zamanlar Çekiliş</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Filter className="w-5 h-5" />
              Filtreler ve Arama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Çekiliş ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Tüm Kategoriler" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Country Filter */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Tüm Ülkeler" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
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
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="newest">En Yeni</SelectItem>
                  <SelectItem value="ending-soon">Sona Erme</SelectItem>
                  <SelectItem value="highest-value">En Yüksek Ödül</SelectItem>
                  <SelectItem value="most-tickets">En Popüler</SelectItem>
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
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-duxxan-text-secondary">
            Showing {filteredRaffles.length} of {raffles.length} raffles
          </p>
          {searchTerm && (
            <p className="text-sm text-duxxan-text-secondary">
              Search results for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Raffles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="duxxan-card animate-pulse">
                <div className="h-48 bg-duxxan-dark rounded-t-xl"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-duxxan-dark rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-duxxan-dark rounded w-full mb-4"></div>
                  <div className="h-3 bg-duxxan-dark rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRaffles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
