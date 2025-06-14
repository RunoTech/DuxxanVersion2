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
            <Button className="bg-green-500 hover:bg-green-600 text-white mt-4 md:mt-0">
              Yeni Kampanya Başlat
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="duxxan-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-duxxan-success mb-2">
                {getActiveCampaignsCount()}
              </div>
              <div className="text-duxxan-text-secondary">Active Campaigns</div>
            </CardContent>
          </Card>
          
          <Card className="duxxan-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-duxxan-warning mb-2">
                ${getTotalRaised().toLocaleString()}
              </div>
              <div className="text-duxxan-text-secondary">Total Raised</div>
            </CardContent>
          </Card>
          
          <Card className="duxxan-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-duxxan-yellow mb-2">
                {getTotalDonors().toLocaleString()}
              </div>
              <div className="text-duxxan-text-secondary">Total Donors</div>
            </CardContent>
          </Card>

          <Card className="duxxan-card">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-white mb-2">
                ${getAverageContribution().toFixed(0)}
              </div>
              <div className="text-duxxan-text-secondary">Avg Contribution</div>
            </CardContent>
          </Card>
        </div>

        {/* Market Cap Display */}
        <Card className="duxxan-card mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-duxxan-success" />
                  Donation Market Cap
                </h3>
                <div className="text-3xl font-bold text-duxxan-success mb-2">
                  ${getTotalRaised().toLocaleString()} USDT
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-duxxan-success">↗ Live Updates</span>
                  <span className="text-duxxan-text-secondary">Blockchain Verified</span>
                  <span className="text-duxxan-text-secondary">
                    {donations.length} Total Campaigns
                  </span>
                </div>
              </div>
              <div className="hidden md:block w-32 h-16 bg-duxxan-dark rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-duxxan-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="duxxan-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-duxxan-text-secondary w-4 h-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-duxxan-dark border-duxxan-border text-white pl-10"
                />
              </div>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-duxxan-dark border-duxxan-border text-white">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-duxxan-surface border-duxxan-border">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  <SelectItem value="highest-goal">Highest Goal</SelectItem>
                  <SelectItem value="most-funded">Most Funded</SelectItem>
                  <SelectItem value="most-donors">Most Donors</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                onClick={() => {
                  setSearchTerm('');
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
            Showing {filteredDonations.length} of {donations.length} campaigns
          </p>
          {searchTerm && (
            <p className="text-sm text-duxxan-text-secondary">
              Search results for "{searchTerm}"
            </p>
          )}
        </div>

        {/* Donations Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="duxxan-card animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-duxxan-dark rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-duxxan-dark rounded w-full mb-4"></div>
                  <div className="h-2 bg-duxxan-dark rounded w-full mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-3 bg-duxxan-dark rounded"></div>
                    <div className="h-3 bg-duxxan-dark rounded"></div>
                    <div className="h-3 bg-duxxan-dark rounded"></div>
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
          <Card className="duxxan-card text-center">
            <CardContent className="p-12">
              <h3 className="text-xl font-bold mb-4">No Campaigns Found</h3>
              <p className="text-duxxan-text-secondary mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Be the first to create a meaningful donation campaign on DUXXAN!'
                }
              </p>
              <div className="flex justify-center gap-4">
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm('')}
                    variant="outline"
                    className="duxxan-button-secondary"
                  >
                    Clear Search
                  </Button>
                )}
                <Link href="/create-donation">
                  <Button className="duxxan-button-success">
                    Start Campaign
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Load More Button (if needed for pagination) */}
        {filteredDonations.length > 0 && filteredDonations.length < donations.length && (
          <div className="text-center mt-12">
            <Button variant="outline" className="duxxan-button-secondary">
              Load More Campaigns
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <Card className="duxxan-card mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Make a Difference Today</h3>
            <p className="text-duxxan-text-secondary mb-6 max-w-2xl mx-auto">
              Every donation matters. Join our community of generous donors and help create positive change 
              in the world through transparent, blockchain-verified contributions.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/create-donation">
                <Button className="duxxan-button-success">
                  Start Your Campaign
                </Button>
              </Link>
              <Button variant="outline" className="duxxan-button-secondary">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
