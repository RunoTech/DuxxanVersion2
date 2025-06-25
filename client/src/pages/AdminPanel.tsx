import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Trophy, 
  Heart, 
  Wallet, 
  Settings, 
  Shield, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  Crown, 
  Ban,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  BarChart3,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalRaffles: number;
  totalDonations: number;
  totalRevenue: string;
  activeRaffles: number;
  activeDonations: number;
  pendingApprovals: number;
  flaggedContent: number;
}

interface UserData {
  id: number;
  walletAddress: string;
  username: string;
  name: string;
  email: string;
  accountStatus: string;
  organizationType: string;
  isVerified: boolean;
  totalSpent: string;
  totalWon: string;
  createdAt: string;
  lastLogin: string;
}

interface RaffleData {
  id: number;
  title: string;
  description: string;
  prizeValue: string;
  ticketPrice: string;
  maxTickets: number;
  ticketsSold: number;
  endDate: string;
  isActive: boolean;
  winnerId: number | null;
  creatorId: number;
  creator: {
    username: string;
    walletAddress: string;
  };
  category: {
    name: string;
  };
  isManual: boolean;
  createdByAdmin: boolean;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleData | null>(null);
  const [winnerSelectionDialog, setWinnerSelectionDialog] = useState(false);

  // Admin Stats Query
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Users Query
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: selectedTab === 'users',
  });

  // Raffles Query
  const { data: raffles, isLoading: rafflesLoading } = useQuery({
    queryKey: ['/api/admin/raffles'],
    enabled: selectedTab === 'raffles',
  });

  // Donations Query
  const { data: donations, isLoading: donationsLoading } = useQuery({
    queryKey: ['/api/admin/donations'],
    enabled: selectedTab === 'donations',
  });

  // Wallets Query
  const { data: wallets, isLoading: walletsLoading } = useQuery({
    queryKey: ['/api/admin/wallets'],
    enabled: selectedTab === 'wallets',
  });

  // Mutation for selecting winner
  const selectWinnerMutation = useMutation({
    mutationFn: async ({ raffleId, winnerId }: { raffleId: number; winnerId: number }) => {
      return apiRequest('POST', '/api/admin/raffles/select-winner', { raffleId, winnerId });
    },
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Kazanan başarıyla seçildi',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/raffles'] });
      setWinnerSelectionDialog(false);
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Kazanan seçilirken bir hata oluştu',
        variant: 'destructive',
      });
    },
  });

  // Mutation for user actions
  const userActionMutation = useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: number; action: string; reason?: string }) => {
      return apiRequest('POST', '/api/admin/users/action', { userId, action, reason });
    },
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Kullanıcı işlemi tamamlandı',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  // Mutation for raffle actions
  const raffleActionMutation = useMutation({
    mutationFn: async ({ raffleId, action }: { raffleId: number; action: string }) => {
      return apiRequest('POST', '/api/admin/raffles/action', { raffleId, action });
    },
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Çekiliş işlemi tamamlandı',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/raffles'] });
    },
  });

  const handleSelectWinner = (raffle: RaffleData) => {
    setSelectedRaffle(raffle);
    setWinnerSelectionDialog(true);
  };

  const confirmSelectWinner = (winnerId: number) => {
    if (selectedRaffle) {
      selectWinnerMutation.mutate({ raffleId: selectedRaffle.id, winnerId });
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% geçen aydan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Çekilişler</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats?.activeRaffles || 0}</div>
            <p className="text-xs text-muted-foreground">
              {adminStats?.totalRaffles || 0} toplam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Bağışlar</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats?.activeDonations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {adminStats?.totalDonations || 0} toplam
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${adminStats?.totalRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              USDT cinsinden
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center">
              <Plus className="h-6 w-6 mb-2" />
              Yeni Çekiliş
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Heart className="h-6 w-6 mb-2" />
              Yeni Bağış
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Crown className="h-6 w-6 mb-2" />
              Kazanan Seç
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <BarChart3 className="h-6 w-6 mb-2" />
              Raporlar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Yeni kullanıcı kaydı: user_123...abc</p>
                <p className="text-xs text-muted-foreground">2 dakika önce</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">BMW X5 çekilişinde yeni bilet satışı</p>
                <p className="text-xs text-muted-foreground">5 dakika önce</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Doğrulama bekleyen hesap</p>
                <p className="text-xs text-muted-foreground">10 dakika önce</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Kullanıcı Ara</Label>
              <Input
                id="search"
                placeholder="Cüzdan adresi, kullanıcı adı veya email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Durum Filtresi</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="suspended">Askıya Alınmış</SelectItem>
                  <SelectItem value="banned">Yasaklı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar ({users?.data?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Cüzdan</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Harcama</TableHead>
                <TableHead>Kazanç</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.data?.map((user: UserData) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.accountStatus === 'active' ? 'default' : 'secondary'}>
                      {user.accountStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.organizationType}
                    </Badge>
                  </TableCell>
                  <TableCell>${user.totalSpent}</TableCell>
                  <TableCell>${user.totalWon}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderRaffles = () => (
    <div className="space-y-6">
      {/* Raffles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Çekilişler ({raffles?.data?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Oluşturan</TableHead>
                <TableHead>Ödül Değeri</TableHead>
                <TableHead>Bilet Satışı</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Kazanan</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {raffles?.data?.map((raffle: RaffleData) => (
                <TableRow key={raffle.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{raffle.title}</div>
                      <div className="text-sm text-muted-foreground">
                        #{raffle.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{raffle.creator.username}</div>
                      {raffle.createdByAdmin && (
                        <Badge variant="secondary" className="text-xs">Admin</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>${raffle.prizeValue}</TableCell>
                  <TableCell>
                    <div>
                      <div>{raffle.ticketsSold}/{raffle.maxTickets}</div>
                      <Progress 
                        value={(raffle.ticketsSold / raffle.maxTickets) * 100} 
                        className="w-16 h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={raffle.isActive ? 'default' : 'secondary'}>
                      {raffle.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {raffle.winnerId ? (
                      <Badge variant="outline">Seçildi</Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleSelectWinner(raffle)}
                        disabled={!raffle.isActive}
                      >
                        <Crown className="h-4 w-4 mr-1" />
                        Kazanan Seç
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => raffleActionMutation.mutate({ 
                          raffleId: raffle.id, 
                          action: raffle.isActive ? 'deactivate' : 'activate' 
                        })}
                      >
                        {raffle.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Paneli
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            DUXXAN platformunu yönetin ve kontrol edin
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="raffles">
              <Trophy className="h-4 w-4 mr-2" />
              Çekilişler
            </TabsTrigger>
            <TabsTrigger value="donations">
              <Heart className="h-4 w-4 mr-2" />
              Bağışlar
            </TabsTrigger>
            <TabsTrigger value="wallets">
              <Wallet className="h-4 w-4 mr-2" />
              Cüzdanlar
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Ayarlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {renderUsers()}
          </TabsContent>

          <TabsContent value="raffles" className="mt-6">
            {renderRaffles()}
          </TabsContent>

          <TabsContent value="donations" className="mt-6">
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Bağış Yönetimi
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Bağış kampanyalarını buradan yönetebilirsiniz.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="wallets" className="mt-6">
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Cüzdan Yönetimi
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Kullanıcı cüzdanlarını ve bakiyelerini buradan görüntüleyebilirsiniz.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Sistem Ayarları
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Platform ayarlarını buradan düzenleyebilirsiniz.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Winner Selection Dialog */}
        <Dialog open={winnerSelectionDialog} onOpenChange={setWinnerSelectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kazanan Seç</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                <strong>{selectedRaffle?.title}</strong> çekilişi için kazanan seçin:
              </p>
              <div className="text-sm text-muted-foreground">
                Toplam {selectedRaffle?.ticketsSold} bilet satıldı
              </div>
              <div className="flex gap-2">
                <Button onClick={() => confirmSelectWinner(1)}>
                  Rastgele Seç
                </Button>
                <Button variant="outline">
                  Manuel Seç
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}