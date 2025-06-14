import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RaffleCard } from '@/components/RaffleCard';
import { Link } from 'wouter';
import { useWallet } from '@/hooks/useWallet';
import { Search, Filter } from 'lucide-react';

export default function Raffles() {
  const { isConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Fetch raffles
  const { data: raffles = [], isLoading } = useQuery({
    queryKey: ['/api/raffles'],
    refetchInterval: isConnected ? 30000 : false, // Refresh every 30 seconds if connected
  });

  // Filter and sort raffles
  const filteredRaffles = raffles
    .filter((raffle: any) => {
      const matchesSearch = raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           raffle.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || raffle.category.id.toString() === selectedCategory;
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
    <div className="min-h-screen bg-duxxan-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Raffles</h1>
            <p className="text-duxxan-text-secondary">
              Discover amazing prizes and join exciting raffles
            </p>
          </div>
          <Link href="/create-raffle">
            <Button className="duxxan-button-primary mt-4 md:mt-0">
              Create New Raffle
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="duxxan-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-duxxan-yellow mb-2">
                {getActiveRafflesCount()}
              </div>
              <div className="text-duxxan-text-secondary">Active Raffles</div>
            </CardContent>
          </Card>
          
          <Card className="duxxan-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-duxxan-success mb-2">
                ${getTotalPrizePool().toLocaleString()}
              </div>
              <div className="text-duxxan-text-secondary">Total Prize Pool</div>
            </CardContent>
          </Card>
          
          <Card className="duxxan-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-duxxan-warning mb-2">
                {raffles.length}
              </div>
              <div className="text-duxxan-text-secondary">All Time Raffles</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="duxxan-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-duxxan-text-secondary w-4 h-4" />
                <Input
                  placeholder="Search raffles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-duxxan-dark border-duxxan-border text-white pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-duxxan-dark border-duxxan-border text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-duxxan-surface border-duxxan-border">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-duxxan-dark border-duxxan-border text-white">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-duxxan-surface border-duxxan-border">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  <SelectItem value="highest-value">Highest Value</SelectItem>
                  <SelectItem value="most-tickets">Most Popular</SelectItem>
                  <SelectItem value="lowest-price">Lowest Price</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSortBy('newest');
                }}
                variant="outline"
                className="duxxan-button-secondary"
              >
                Clear Filters
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
                {(searchTerm || selectedCategory !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    variant="outline"
                    className="duxxan-button-secondary"
                  >
                    Clear Filters
                  </Button>
                )}
                <Link href="/create-raffle">
                  <Button className="duxxan-button-primary">
                    Create Raffle
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
