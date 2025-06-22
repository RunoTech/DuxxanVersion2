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
  Sparkles, 
  Trophy, 
  Clock, 
  Users, 
  Ticket,
  Plus,
  TrendingUp,
  Star,
  Gift
} from 'lucide-react';

// New Modern Raffle Card Component
function ModernRaffleCard({ raffle }: { raffle: any }) {
  const progress = (raffle.ticketsSold / raffle.maxTickets) * 100;
  const endDate = new Date(raffle.endDate);
  const timeLeft = endDate.getTime() - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const formatCurrency = (value: string | number) => {
    const num = parseFloat(value.toString());
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="group relative">
      {/* Premium Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFC929] via-orange-400 to-yellow-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-all duration-500"></div>
      
      <Card className="relative bg-white dark:bg-gray-900 border-0 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-1">
        {/* Hero Section with Gradient */}
        <div className="relative h-40 bg-gradient-to-br from-[#FFC929] via-orange-400 to-yellow-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
              {categories.find(c => c.id === raffle.categoryId)?.name || 'Çekiliş'}
            </Badge>
            {progress >= 80 && (
              <Badge className="bg-red-500/80 text-white border-0 backdrop-blur-sm animate-pulse">
                🔥 Popüler
              </Badge>
            )}
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg mb-1 truncate">
              {raffle.title}
            </h3>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 ring-2 ring-white/30">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback className="bg-white/20 text-white text-xs font-bold">
                  {raffle.creator?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-white/90 text-sm">@{raffle.creator?.username || 'duxxan_admin'}</span>
            </div>
          </div>

          {/* Floating Prize Tag */}
          <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-lg">
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-[#FFC929]" />
              <span className="text-xs font-bold text-gray-900">{formatCurrency(raffle.prizeValue)} USDT</span>
            </div>
          </div>
        </div>

        <CardContent className="p-5">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">{formatCurrency(raffle.ticketPrice)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Bilet Fiyatı</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{raffle.ticketsSold}/{raffle.maxTickets}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Satılan/Toplam</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{daysLeft > 0 ? `${daysLeft}g` : 'Bitti'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Kalan Süre</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">İlerleme</span>
              <span className="text-sm font-bold text-[#FFC929]">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-100 dark:bg-gray-700">
              <div 
                className="h-full bg-gradient-to-r from-[#FFC929] to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </Progress>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {raffle.description}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-gradient-to-r from-[#FFC929] to-orange-400 hover:from-orange-400 hover:to-[#FFC929] text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={raffle.ticketsSold >= raffle.maxTickets || daysLeft <= 0}
            >
              <Ticket className="h-4 w-4 mr-2" />
              Bilet Al
            </Button>
            <Link href={`/raffles/${raffle.id}`}>
              <Button variant="outline" className="border-[#FFC929] text-[#FFC929] hover:bg-[#FFC929] hover:text-black">
                Detay
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Raffles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: rafflesResponse, isLoading } = useQuery({
    queryKey: ['/api/raffles/active'],
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Extract data from API response
  const raffles = rafflesResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  


  const countries = [
    { code: 'TR', name: 'Türkiye', flag: '🇹🇷' },
    { code: 'US', name: 'Amerika', flag: '🇺🇸' },
    { code: 'GB', name: 'İngiltere', flag: '🇬🇧' },
    { code: 'DE', name: 'Almanya', flag: '🇩🇪' },
    { code: 'FR', name: 'Fransa', flag: '🇫🇷' },
  ];

  const filteredRaffles = useMemo(() => {
    if (!Array.isArray(raffles)) return [];
    
    return raffles
      .filter((raffle: any) => {
        const matchesSearch = raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            raffle.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || raffle.categoryId?.toString() === selectedCategory;
        const matchesCountry = selectedCountry === 'all' || raffle.country === selectedCountry;
        
        return matchesSearch && matchesCategory && matchesCountry;
      })
      .sort((a: any, b: any) => {
        switch (sortBy) {
          case 'ending-soon':
            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          case 'highest-value':
            return parseFloat(b.prizeValue) - parseFloat(a.prizeValue);
          case 'most-tickets':
            return b.ticketsSold - a.ticketsSold;
          case 'lowest-price':
            return parseFloat(a.ticketPrice) - parseFloat(b.ticketPrice);
          default:
            return new Date(b.createdAt || b.id).getTime() - new Date(a.createdAt || a.id).getTime();
        }
      });
  }, [raffles, searchTerm, selectedCategory, selectedCountry, sortBy]);

  const getStats = () => {
    const activeRaffles = raffles.filter((r: any) => new Date(r.endDate) > new Date());
    const totalPrizePool = raffles.reduce((sum: number, raffle: any) => sum + parseFloat(raffle.prizeValue), 0);
    const totalTicketsSold = raffles.reduce((sum: number, raffle: any) => sum + raffle.ticketsSold, 0);
    
    return { activeRaffles: activeRaffles.length, totalPrizePool, totalTicketsSold };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#FFC929] via-orange-400 to-yellow-500">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Heyecan Verici Çekilişler</h1>
            <p className="text-white/90 text-lg mb-6">Muhteşem ödülleri keşfedin ve şansınızı deneyin</p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{stats.activeRaffles}</div>
                <div className="text-white/80 text-sm">Aktif Çekiliş</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">${stats.totalPrizePool.toLocaleString()}</div>
                <div className="text-white/80 text-sm">Toplam Ödül</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{stats.totalTicketsSold.toLocaleString()}</div>
                <div className="text-white/80 text-sm">Satılan Bilet</div>
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
          <Link href="/create-raffle">
            <Button className="bg-gradient-to-r from-[#FFC929] to-orange-400 hover:from-orange-400 hover:to-[#FFC929] text-black font-semibold shadow-lg hover:shadow-xl px-6 py-3">
              <Plus className="h-5 w-5 mr-2" />
              Yeni Çekiliş Oluştur
            </Button>
          </Link>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredRaffles.length} çekiliş gösteriliyor
          </div>
        </div>

        {/* Compact Icon Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Çekiliş ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 dark:border-gray-700 focus:border-[#FFC929] focus:ring-[#FFC929] h-10"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-10 h-10 p-0 border-gray-200 dark:border-gray-700 hover:border-[#FFC929] hover:bg-[#FFC929]/10">
                <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country Filter */}
          <div className="relative">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-10 h-10 p-0 border-gray-200 dark:border-gray-700 hover:border-[#FFC929] hover:bg-[#FFC929]/10">
                <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-10 h-10 p-0 border-gray-200 dark:border-gray-700 hover:border-[#FFC929] hover:bg-[#FFC929]/10">
                <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">En Yeni</SelectItem>
                <SelectItem value="ending-soon">Sona Erme</SelectItem>
                <SelectItem value="highest-value">En Yüksek Ödül</SelectItem>
                <SelectItem value="most-tickets">En Popüler</SelectItem>
                <SelectItem value="lowest-price">En Düşük Fiyat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== 'all' || selectedCountry !== 'all' || sortBy !== 'newest') && (
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedCountry('all');
                setSortBy('newest');
              }}
              variant="outline"
              size="sm"
              className="h-10 px-3 border-[#FFC929]/50 text-[#FFC929] hover:bg-[#FFC929] hover:text-black"
            >
              Temizle
            </Button>
          )}

          {/* Filter Info */}
          <div className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            {filteredRaffles.length} çekiliş
          </div>
        </div>

        {/* Raffles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
                <CardContent className="p-5">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRaffles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRaffles.map((raffle: any) => (
              <ModernRaffleCard key={raffle.id} raffle={raffle} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 border-0 shadow-lg">
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4">
                  <Gift className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Çekiliş Bulunamadı</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'İlk çekilişi oluşturan siz olun!'
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
                    className="border-[#FFC929] text-[#FFC929] hover:bg-[#FFC929] hover:text-black"
                  >
                    Filtreleri Temizle
                  </Button>
                )}
                <Link href="/create-raffle">
                  <Button className="bg-gradient-to-r from-[#FFC929] to-orange-400 hover:from-orange-400 hover:to-[#FFC929] text-black font-semibold">
                    Çekiliş Oluştur
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