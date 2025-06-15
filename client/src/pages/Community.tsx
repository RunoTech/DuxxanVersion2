import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Users, Plus, Bell, Calendar, Trophy, Eye, Heart, Share2, Search, Filter, CheckCircle } from 'lucide-react';

const createChannelSchema = z.object({
  name: z.string().min(3, 'Kanal adı en az 3 karakter olmalı').max(50, 'Kanal adı en fazla 50 karakter olabilir'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalı').max(500, 'Açıklama en fazla 500 karakter olabilir'),
  categoryId: z.number().min(1, 'Kategori seçimi zorunlu'),
});

const createUpcomingRaffleSchema = z.object({
  title: z.string().min(5, 'Başlık en az 5 karakter olmalı'),
  description: z.string().min(20, 'Açıklama en az 20 karakter olmalı'),
  prizeValue: z.string().min(1, 'Ödül değeri gerekli'),
  ticketPrice: z.string().min(1, 'Bilet fiyatı gerekli'),
  maxTickets: z.string().min(1, 'Maksimum bilet sayısı gerekli'),
  startDate: z.string().min(1, 'Başlangıç tarihi gerekli'),
  categoryId: z.number().min(1, 'Kategori seçimi zorunlu'),
});

type CreateChannelForm = z.infer<typeof createChannelSchema>;
type CreateUpcomingRaffleForm = z.infer<typeof createUpcomingRaffleSchema>;

export default function Community() {
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'channels' | 'upcoming'>('channels');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateRaffle, setShowCreateRaffle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [subscribedChannels, setSubscribedChannels] = useState<Set<number>>(new Set([2])); // Channel 2 is initially subscribed

  const channelForm = useForm<CreateChannelForm>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: 0,
    },
  });

  const raffleForm = useForm<CreateUpcomingRaffleForm>({
    resolver: zodResolver(createUpcomingRaffleSchema),
    defaultValues: {
      title: '',
      description: '',
      prizeValue: '',
      ticketPrice: '',
      maxTickets: '',
      startDate: '',
      categoryId: 0,
    },
  });

  // Fetch channels from database
  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ['/api/channels'],
  });

  const channels = (channelsData as any)?.data || [];

  // Fetch upcoming raffles from database
  const { data: upcomingRafflesData, isLoading: rafflesLoading } = useQuery({
    queryKey: ['/api/upcoming-raffles'],
  });

  const upcomingRaffles = (upcomingRafflesData as any)?.data || [];

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'Tüm Kategoriler' },
    { value: 'crypto', label: 'Kripto' },
    { value: 'nft', label: 'NFT' },
    { value: 'gaming', label: 'Oyun' },
    { value: 'luxury', label: 'Lüks' },
    { value: 'sports', label: 'Spor' },
    { value: 'tech', label: 'Teknoloji' },
  ];

  // Filtered channels based on search and category
  const filteredChannels = useMemo(() => {
    return channels.filter((channel: any) => {
      const matchesSearch = searchQuery === '' || 
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        channel.category.toLowerCase() === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [channels, searchQuery, selectedCategory]);

  // Filtered upcoming raffles based on search and category
  const filteredUpcomingRaffles = useMemo(() => {
    return upcomingRaffles.filter((raffle: any) => {
      const matchesSearch = searchQuery === '' || 
        raffle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        raffle.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        raffle.category.toLowerCase() === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [upcomingRaffles, searchQuery, selectedCategory]);

  const createChannelMutation = useMutation({
    mutationFn: async (data: CreateChannelForm) => {
      return apiRequest('POST', '/api/channels', data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Kanalınız başarıyla oluşturuldu.",
      });
      setShowCreateChannel(false);
      channelForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Kanal oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const createUpcomingRaffleMutation = useMutation({
    mutationFn: async (data: CreateUpcomingRaffleForm) => {
      return apiRequest('POST', '/api/upcoming-raffles', data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Gelecek çekiliş duyurunuz oluşturuldu.",
      });
      setShowCreateRaffle(false);
      raffleForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/upcoming-raffles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Çekiliş duyurusu oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const subscribeChannelMutation = useMutation({
    mutationFn: async (channelId: number) => {
      const isCurrentlySubscribed = subscribedChannels.has(channelId);
      if (isCurrentlySubscribed) {
        return apiRequest(`/api/channels/${channelId}/subscribe`, 'DELETE');
      } else {
        return apiRequest(`/api/channels/${channelId}/subscribe`, 'POST');
      }
    },
    onSuccess: (data, channelId) => {
      const isCurrentlySubscribed = subscribedChannels.has(channelId);
      const newSubscribedChannels = new Set(subscribedChannels);
      
      if (isCurrentlySubscribed) {
        newSubscribedChannels.delete(channelId);
        toast({
          title: "Abonelik İptal Edildi",
          description: "Kanaldan aboneliğiniz iptal edildi.",
        });
      } else {
        newSubscribedChannels.add(channelId);
        toast({
          title: "Başarılı!",
          description: "Kanala abone oldunuz.",
        });
      }
      
      setSubscribedChannels(newSubscribedChannels);
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Abonelik işlemi sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = async (channelId: number) => {
    if (!isConnected) {
      toast({
        title: "Cüzdan Bağlantısı Gerekli",
        description: "Kanala abone olmak için cüzdanınızı bağlamanız gerekiyor.",
        variant: "destructive",
      });
      return;
    }

    subscribeChannelMutation.mutate(channelId);
  };

  const interestMutation = useMutation({
    mutationFn: async (raffleId: number) => {
      // Check if user is already interested (this would need state management)
      return apiRequest(`/api/upcoming-raffles/${raffleId}/interest`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Çekilişe ilgi bildirdiniz.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/upcoming-raffles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "İlgi bildirme sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleInterest = async (raffleId: number) => {
    if (!isConnected) {
      toast({
        title: "Cüzdan Bağlantısı Gerekli",
        description: "İlgi bildirmek için cüzdanınızı bağlamanız gerekiyor.",
        variant: "destructive",
      });
      return;
    }

    interestMutation.mutate(raffleId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="text-yellow-500">Topluluk</span> Merkezi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            İçerik üreticilerini takip edin, gelecek çekilişleri keşfedin ve kendi kanalınızı oluşturun.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-500" />
              <Input
                placeholder={activeTab === 'channels' ? "Kanal ara..." : "Çekiliş ara..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-500 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-yellow-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 min-w-[140px] focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
              >
                {categories.map((category) => (
                  <option 
                    key={category.value} 
                    value={category.value}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Clear Filters */}
            {(searchQuery || selectedCategory !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="bg-white border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all"
              >
                Temizle
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border-2 border-yellow-200 dark:border-yellow-600">
            <Button
              variant={activeTab === 'channels' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('channels')}
              className={activeTab === 'channels' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}
            >
              <Users className="h-4 w-4 mr-2" />
              Kanallar ({filteredChannels.length})
            </Button>
            <Button
              variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('upcoming')}
              className={activeTab === 'upcoming' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Gelecek Çekilişler ({filteredUpcomingRaffles.length})
            </Button>
          </div>

          <div className="flex space-x-3">
            {isConnected && (
              <>
                <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
                  <DialogTrigger asChild>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Kanal Oluştur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-500">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-white">Yeni Kanal Oluştur</DialogTitle>
                    </DialogHeader>
                    <Form {...channelForm}>
                      <form onSubmit={channelForm.handleSubmit((data) => createChannelMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={channelForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-900">Kanal Adı</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Kanal adınızı girin"
                                  className="bg-white border-2 border-yellow-400 text-gray-900 placeholder:text-gray-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={channelForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-900">Açıklama</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Kanalınızı tanıtın"
                                  className="bg-white border-2 border-yellow-400 text-gray-900 placeholder:text-gray-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={channelForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Kategori</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="w-full p-3 bg-duxxan-card border border-duxxan-border rounded-md text-white"
                                >
                                  <option value="">Kategori seçin</option>
                                  <option value="crypto">Kripto</option>
                                  <option value="nft">NFT</option>
                                  <option value="gaming">Oyun</option>
                                  <option value="luxury">Lüks</option>
                                  <option value="sports">Spor</option>
                                  <option value="tech">Teknoloji</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          disabled={createChannelMutation.isPending}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white w-full border-2 border-yellow-500"
                        >
                          {createChannelMutation.isPending ? 'Oluşturuluyor...' : 'Kanal Oluştur'}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Dialog open={showCreateRaffle} onOpenChange={setShowCreateRaffle}>
                  <DialogTrigger asChild>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500">
                      <Trophy className="h-4 w-4 mr-2" />
                      Çekiliş Duyuru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-2 border-yellow-400 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">Gelecek Çekiliş Duyurusu</DialogTitle>
                    </DialogHeader>
                    <Form {...raffleForm}>
                      <form onSubmit={raffleForm.handleSubmit((data) => createUpcomingRaffleMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={raffleForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Çekiliş Başlığı</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Çekiliş başlığı"
                                    className="bg-duxxan-card border-duxxan-border text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={raffleForm.control}
                            name="prizeValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Ödül Değeri (USDT)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="1000"
                                    className="bg-duxxan-card border-duxxan-border text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={raffleForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Açıklama</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Çekiliş detaylarını açıklayın"
                                  className="bg-duxxan-card border-duxxan-border text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={raffleForm.control}
                            name="ticketPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Bilet Fiyatı (USDT)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="10"
                                    className="bg-duxxan-card border-duxxan-border text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={raffleForm.control}
                            name="maxTickets"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Max Bilet</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="1000"
                                    className="bg-duxxan-card border-duxxan-border text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={raffleForm.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Başlangıç Tarihi</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="datetime-local"
                                    className="bg-duxxan-card border-duxxan-border text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={raffleForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Kategori</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="w-full p-3 bg-duxxan-card border border-duxxan-border rounded-md text-white"
                                >
                                  <option value="">Kategori seçin</option>
                                  <option value="crypto">Kripto</option>
                                  <option value="nft">NFT</option>
                                  <option value="gaming">Oyun</option>
                                  <option value="luxury">Lüks</option>
                                  <option value="sports">Spor</option>
                                  <option value="tech">Teknoloji</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          disabled={createUpcomingRaffleMutation.isPending}
                          className="duxxan-button-primary w-full"
                        >
                          {createUpcomingRaffleMutation.isPending ? 'Oluşturuluyor...' : 'Duyuru Oluştur'}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'channels' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChannels.map((channel) => (
              <Card 
                key={channel.id} 
                className="bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-500 hover:border-yellow-500 dark:hover:border-yellow-400 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                onClick={() => setLocation(`/community/${channel.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={channel.avatar} alt={channel.creator || 'Creator'} />
                        <AvatarFallback className="bg-yellow-500 text-white">
                          {(channel.creator || 'User').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-gray-900 dark:text-white text-lg">{channel.name}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{channel.creator || 'Anonymous'}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-600">
                      {channel.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {channel.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">
                        {(channel.subscriberCount || 0).toLocaleString()}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">Abone</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-600 font-bold text-lg">
                        {channel.upcomingRaffles || 0}
                      </div>
                      <div className="text-gray-500 text-xs">Gelecek</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-600 font-bold text-lg">
                        ${channel.totalPrizes || 0}
                      </div>
                      <div className="text-gray-500 text-xs">Ödül</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleSubscribe(channel.id)}
                      variant="default"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500 flex-1"
                      disabled={!isConnected}
                    >
                      {subscribedChannels.has(channel.id) ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2 text-blue-600 font-bold stroke-2" />
                          Abonesin
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4 mr-2" />
                          Abone Ol
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-yellow-600"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredUpcomingRaffles.map((raffle) => (
              <Card key={raffle.id} className="bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-500 hover:border-yellow-500 dark:hover:border-yellow-400 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">{raffle.previewImage}</div>
                      <div>
                        <CardTitle className="text-gray-900 dark:text-white text-lg">{raffle.title}</CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{raffle.channel}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-600">
                      {raffle.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {raffle.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700 border border-yellow-200 dark:border-yellow-600 rounded-lg p-3">
                      <div className="text-green-600 dark:text-green-400 font-bold text-lg">
                        ${raffle.prizeValue}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">Ödül Değeri</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 border border-yellow-200 dark:border-yellow-600 rounded-lg p-3">
                      <div className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">
                        {raffle.ticketPrice} USDT
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">Bilet Fiyatı</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {formatDate(raffle.startDate)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {(raffle.interestedCount || 0).toLocaleString()} ilgileniyor
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleInterest(raffle.id)}
                      variant={raffle.isInterested ? "outline" : "default"}
                      className={raffle.isInterested ? "bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-gray-700 flex-1" : "bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500 flex-1"}
                      disabled={!isConnected}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${raffle.isInterested ? 'fill-current' : ''}`} />
                      {raffle.isInterested ? 'İlgileniyorsun' : 'İlgi Bildir'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Loading states */}
        {(channelsLoading || rafflesLoading) && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Veriler yükleniyor...</p>
          </div>
        )}

        {/* Empty states and No results */}
        {!channelsLoading && activeTab === 'channels' && filteredChannels.length === 0 && (
          <div className="text-center py-12">
            {channels.length === 0 ? (
              <>
                <Users className="h-16 w-16 text-duxxan-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Henüz kanal yok</h3>
                <p className="text-duxxan-text-secondary mb-6">
                  İlk kanalı sen oluştur ve topluluğunu büyütmeye başla!
                </p>
                {isConnected && (
                  <Button onClick={() => setShowCreateChannel(true)} className="duxxan-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Kanalı Oluştur
                  </Button>
                )}
              </>
            ) : (
              <>
                <Search className="h-16 w-16 text-duxxan-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Sonuç bulunamadı</h3>
                <p className="text-duxxan-text-secondary mb-6">
                  Arama kriterlerinize uygun kanal bulunamadı. Filtreleri temizleyip tekrar deneyin.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="duxxan-button-secondary"
                >
                  Filtreleri Temizle
                </Button>
              </>
            )}
          </div>
        )}

        {!rafflesLoading && activeTab === 'upcoming' && filteredUpcomingRaffles.length === 0 && (
          <div className="text-center py-12">
            {upcomingRaffles.length === 0 ? (
              <>
                <Calendar className="h-16 w-16 text-duxxan-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Gelecek çekiliş yok</h3>
                <p className="text-duxxan-text-secondary mb-6">
                  Gelecek çekilişinizi duyurun ve topluluğunuzu heyecanlandırın!
                </p>
                {isConnected && (
                  <Button onClick={() => setShowCreateRaffle(true)} className="duxxan-button-primary">
                    <Trophy className="h-4 w-4 mr-2" />
                    İlk Duyuruyu Oluştur
                  </Button>
                )}
              </>
            ) : (
              <>
                <Search className="h-16 w-16 text-duxxan-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Sonuç bulunamadı</h3>
                <p className="text-duxxan-text-secondary mb-6">
                  Arama kriterlerinize uygun çekiliş bulunamadı. Filtreleri temizleyip tekrar deneyin.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="duxxan-button-secondary"
                >
                  Filtreleri Temizle
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}