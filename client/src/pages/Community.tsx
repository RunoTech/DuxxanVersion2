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
import { Users, Plus, Bell, Calendar, Trophy, Eye, Heart, Share2, Search, Filter, CheckCircle, Edit, Globe, Tag, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const createChannelSchema = z.object({
  name: z.string().min(3, 'Kanal adı en az 3 karakter olmalı').max(50, 'Kanal adı en fazla 50 karakter olabilir'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalı').max(500, 'Açıklama en fazla 500 karakter olabilir'),
  categoryId: z.number().min(1, 'Kategori seçimi zorunlu'),
  country: z.string().min(1, 'Ülke seçimi zorunlu'),
  tags: z.string().optional(),
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

// Countries list for selection
const countries = [
  { value: 'TR', label: '🇹🇷 Türkiye' },
  { value: 'US', label: '🇺🇸 Amerika Birleşik Devletleri' },
  { value: 'DE', label: '🇩🇪 Almanya' },
  { value: 'FR', label: '🇫🇷 Fransa' },
  { value: 'GB', label: '🇬🇧 Birleşik Krallık' },
  { value: 'IT', label: '🇮🇹 İtalya' },
  { value: 'ES', label: '🇪🇸 İspanya' },
  { value: 'NL', label: '🇳🇱 Hollanda' },
  { value: 'BE', label: '🇧🇪 Belçika' },
  { value: 'AT', label: '🇦🇹 Avusturya' },
  { value: 'CH', label: '🇨🇭 İsviçre' },
  { value: 'SE', label: '🇸🇪 İsveç' },
  { value: 'NO', label: '🇳🇴 Norveç' },
  { value: 'DK', label: '🇩🇰 Danimarka' },
  { value: 'FI', label: '🇫🇮 Finlandiya' },
  { value: 'PL', label: '🇵🇱 Polonya' },
  { value: 'CZ', label: '🇨🇿 Çek Cumhuriyeti' },
  { value: 'HU', label: '🇭🇺 Macaristan' },
  { value: 'GR', label: '🇬🇷 Yunanistan' },
  { value: 'PT', label: '🇵🇹 Portekiz' },
  { value: 'IE', label: '🇮🇪 İrlanda' },
  { value: 'LU', label: '🇱🇺 Lüksemburg' },
  { value: 'MT', label: '🇲🇹 Malta' },
  { value: 'CY', label: '🇨🇾 Kıbrıs' },
  { value: 'CA', label: '🇨🇦 Kanada' },
  { value: 'AU', label: '🇦🇺 Avustralya' },
  { value: 'NZ', label: '🇳🇿 Yeni Zelanda' },
  { value: 'JP', label: '🇯🇵 Japonya' },
  { value: 'KR', label: '🇰🇷 Güney Kore' },
  { value: 'SG', label: '🇸🇬 Singapur' },
  { value: 'AE', label: '🇦🇪 Birleşik Arap Emirlikleri' },
  { value: 'SA', label: '🇸🇦 Suudi Arabistan' },
  { value: 'QA', label: '🇶🇦 Katar' },
  { value: 'KW', label: '🇰🇼 Kuveyt' },
  { value: 'BH', label: '🇧🇭 Bahreyn' },
  { value: 'OM', label: '🇴🇲 Umman' },
  { value: 'GLOBAL', label: '🌍 Küresel' }
];

export default function Community() {
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'channels' | 'upcoming'>('channels');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateRaffle, setShowCreateRaffle] = useState(false);
  const [showEditChannel, setShowEditChannel] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [subscribedChannels, setSubscribedChannels] = useState<number[]>([2]);

  const channelForm = useForm<CreateChannelForm>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: 0,
      country: '',
      tags: '',
    },
  });

  const editChannelForm = useForm<CreateChannelForm>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: 0,
      country: '',
      tags: '',
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

  // Fetch channels from database with stable connection
  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ['/api/channels'],
    refetchInterval: false, // Prevent connection issues
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
  });

  const channels = (channelsData as any)?.data || [];

  // Fetch upcoming raffles from database with stable connection
  const { data: upcomingRafflesData, isLoading: rafflesLoading } = useQuery({
    queryKey: ['/api/upcoming-raffles'],
    refetchInterval: false, // Prevent connection issues
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
  });

  const upcomingRaffles = (upcomingRafflesData as any)?.data || [];

  // Fetch categories from database
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories'],
  });

  const categories = [
    { id: 'all', name: 'Tüm Kategoriler' },
    ...(((categoriesData as any)?.data || []) as Array<{id: number; name: string; slug: string}>)
  ];

  // Filtered channels based on search, category, and country
  const filteredChannels = useMemo(() => {
    return channels.filter((channel: any) => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          channel.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || channel.categoryId === parseInt(selectedCategory);
      const matchesCountry = selectedCountry === 'all' || channel.country === selectedCountry;
      return matchesSearch && matchesCategory && matchesCountry;
    });
  }, [channels, searchQuery, selectedCategory, selectedCountry]);

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (data: CreateChannelForm) => {
      const response = await apiRequest('POST', '/api/channels', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kanal başarıyla oluşturuldu",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      setShowCreateChannel(false);
      channelForm.reset();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kanal oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Edit channel mutation
  const editChannelMutation = useMutation({
    mutationFn: async (data: CreateChannelForm) => {
      const response = await apiRequest('PUT', `/api/channels/${editingChannel.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kanal başarıyla güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      setShowEditChannel(false);
      setEditingChannel(null);
      editChannelForm.reset();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.status === 403 
        ? "Bu kanalı düzenleme yetkiniz yok. Sadece kanal yaratıcısı düzenleyebilir."
        : "Kanal güncellenirken bir hata oluştu";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Create upcoming raffle mutation
  const createUpcomingRaffleMutation = useMutation({
    mutationFn: async (data: CreateUpcomingRaffleForm) => {
      const response = await apiRequest('POST', '/api/upcoming-raffles', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Gelecek çekiliş duyurusu oluşturuldu",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/upcoming-raffles'] });
      setShowCreateRaffle(false);
      raffleForm.reset();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Çekiliş duyurusu oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Subscribe/Unsubscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async ({ channelId, action }: { channelId: number; action: 'subscribe' | 'unsubscribe' }) => {
      const method = action === 'subscribe' ? 'POST' : 'DELETE';
      const response = await apiRequest(method, `/api/channels/${channelId}/subscribe`);
      return response.json();
    },
    onSuccess: (_, { channelId, action }) => {
      if (action === 'subscribe') {
        setSubscribedChannels(prev => new Set([...prev, channelId]));
        toast({
          title: "Başarılı",
          description: "Kanala abone oldunuz",
        });
      } else {
        setSubscribedChannels(prev => {
          const newSet = new Set([...prev]);
          newSet.delete(channelId);
          return newSet;
        });
        toast({
          title: "Başarılı",
          description: "Kanal aboneliğiniz iptal edildi",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (channelId: number) => {
    if (!isConnected) {
      toast({
        title: "Uyarı",
        description: "Abone olmak için cüzdan bağlantısı gerekli",
        variant: "destructive",
      });
      return;
    }

    const action = subscribedChannels.has(channelId) ? 'unsubscribe' : 'subscribe';
    subscribeMutation.mutate({ channelId, action });
  };

  const handleEditChannel = (channel: any) => {
    setEditingChannel(channel);
    editChannelForm.reset({
      name: channel.name,
      description: channel.description,
      categoryId: channel.categoryId,
    });
    setShowEditChannel(true);
  };

  const onSubmitChannel = async (data: CreateChannelForm) => {
    if (!isConnected) {
      toast({
        title: "Uyarı",
        description: "Kanal oluşturmak için cüzdan bağlantısı gerekli",
        variant: "destructive",
      });
      return;
    }
    createChannelMutation.mutate(data);
  };

  const onSubmitEditChannel = async (data: CreateChannelForm) => {
    if (!isConnected) {
      toast({
        title: "Uyarı",
        description: "Kanal düzenlemek için cüzdan bağlantısı gerekli",
        variant: "destructive",
      });
      return;
    }
    editChannelMutation.mutate(data);
  };

  const onSubmitRaffle = async (data: CreateUpcomingRaffleForm) => {
    if (!isConnected) {
      toast({
        title: "Uyarı",
        description: "Çekiliş duyurusu oluşturmak için cüzdan bağlantısı gerekli",
        variant: "destructive",
      });
      return;
    }
    createUpcomingRaffleMutation.mutate(data);
  };

  const CategorySelect = ({ field, categories }: { field: any; categories: any[] }) => (
    <select
      {...field}
      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
      value={field.value}
      className="w-full p-3 bg-duxxan-card border border-duxxan-border rounded-md text-white"
    >
      <option value={0}>Kategori seçin</option>
      {categories.filter(cat => cat.id !== 'all').map((category: any) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );

  const ChannelCard = ({ channel }: { channel: any }) => {
    // Debug wallet comparison
    console.log('Channel:', channel.id, 'Creator:', channel.creatorWalletAddress, 'Current:', address);
    const isOwner = isConnected && address && channel.creatorWalletAddress && 
                   address.toLowerCase() === channel.creatorWalletAddress.toLowerCase();
    console.log('Is owner:', isOwner);

    return (
    <Card 
      key={channel.id}
      className="bg-duxxan-card border-duxxan-border hover:border-yellow-500 transition-all duration-200 cursor-pointer group"
      onClick={() => setLocation(`/community/${channel.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`/api/placeholder/48/48`} />
              <AvatarFallback className="bg-yellow-500 text-black font-bold">
                {channel.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-white group-hover:text-yellow-400 transition-colors">
                {channel.name}
              </CardTitle>
              <p className="text-sm text-gray-400">@{channel.creator}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500">
              {channel.categoryName || 'Genel'}
            </Badge>
            {channel.country && (
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                {countries.find(c => c.value === channel.country)?.label || channel.country}
              </Badge>
            )}
            {isOwner && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditChannel(channel);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {channel.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{channel.subscriberCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4" />
              <span>{channel.totalPrizes || 0} USDT</span>
            </div>
          </div>
          <Button
            size="sm"
            variant={subscribedChannels.has(channel.id) ? "secondary" : "outline"}
            className={subscribedChannels.has(channel.id) 
              ? "bg-yellow-500 text-black hover:bg-yellow-600" 
              : "border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
            }
            onClick={(e) => {
              e.stopPropagation();
              handleSubscribe(channel.id);
            }}
          >
            {subscribedChannels.has(channel.id) ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Abone
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Abone Ol
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-duxxan-darker text-black dark:text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">Topluluk Merkezi</h1>
          <p className="text-gray-600 dark:text-gray-400">Kanalları keşfedin, çekilişleri takip edin ve topluluğa katılın</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 h-4 w-4" />
            <Input
              placeholder="Kanal ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-100 dark:bg-duxxan-card border-gray-300 dark:border-duxxan-border text-black dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 dark:text-gray-400 h-4 w-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-100 dark:bg-duxxan-card border border-gray-300 dark:border-duxxan-border rounded-md px-3 py-2 text-black dark:text-white"
            >
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <Globe className="text-gray-400 dark:text-gray-400 h-4 w-4" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-gray-100 dark:bg-duxxan-card border border-gray-300 dark:border-duxxan-border rounded-md px-3 py-2 text-black dark:text-white"
            >
              <option value="all">Tüm Ülkeler</option>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-duxxan-card rounded-lg p-1 mb-6">
          <Button
            variant={activeTab === 'channels' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'channels' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('channels')}
          >
            <Users className="h-4 w-4 mr-2" />
            Kanallar
          </Button>
          <Button
            variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
            className={`flex-1 ${activeTab === 'upcoming' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Gelecek Çekilişler
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'channels' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Topluluk Kanalları</h2>
              <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Kanal Oluştur
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <DialogHeader className="text-center pb-4">
                    <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      Yeni Kanal Oluştur
                    </DialogTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Topluluk için yeni bir kanal oluşturun ve üyelerle etkileşime geçin
                    </p>
                  </DialogHeader>
                  <Form {...channelForm}>
                    <form onSubmit={channelForm.handleSubmit(onSubmitChannel)} className="space-y-5">
                      <FormField
                        control={channelForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Kanal Adı
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Örn: Kripto Tartışmaları"
                                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" 
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
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              <Edit className="w-4 h-4 mr-2" />
                              Açıklama
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Kanalınızın amacını ve kurallarını açıklayın..."
                                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent min-h-[80px]" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={channelForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                <Trophy className="w-4 h-4 mr-2" />
                                Kategori
                              </FormLabel>
                              <FormControl>
                                <CategorySelect field={field} categories={categories} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={channelForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                <Globe className="w-4 h-4 mr-2" />
                                Ülke
                              </FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                                    <SelectValue placeholder="Ülke seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    {countries.map((country) => (
                                      <SelectItem 
                                        key={country.value} 
                                        value={country.value}
                                        className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        {country.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={channelForm.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              <Tag className="w-4 h-4 mr-2" />
                              Etiketler (Opsiyonel)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Örn: kripto, nft, blockchain (virgülle ayırın)"
                                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateChannel(false)}
                          className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          İptal
                        </Button>
                        <Button
                          type="submit"
                          disabled={createChannelMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold shadow-lg disabled:opacity-50"
                        >
                          {createChannelMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                              Oluşturuluyor...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Kanal Oluştur
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Edit Channel Dialog */}
            <Dialog open={showEditChannel} onOpenChange={setShowEditChannel}>
              <DialogContent className="bg-duxxan-card border-duxxan-border text-white">
                <DialogHeader>
                  <DialogTitle>Kanalı Düzenle</DialogTitle>
                </DialogHeader>
                <Form {...editChannelForm}>
                  <form onSubmit={editChannelForm.handleSubmit(onSubmitEditChannel)} className="space-y-4">
                    <FormField
                      control={editChannelForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Kanal Adı</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-duxxan-darker border-duxxan-border text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editChannelForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Açıklama</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="bg-duxxan-darker border-duxxan-border text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editChannelForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Kategori</FormLabel>
                          <FormControl>
                            <CategorySelect field={field} categories={categories} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={editChannelMutation.isPending}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black w-full"
                    >
                      {editChannelMutation.isPending ? 'Güncelleniyor...' : 'Kanalı Güncelle'}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {channelsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-duxxan-card rounded-lg p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="w-24 h-4 bg-gray-600 rounded"></div>
                        <div className="w-16 h-3 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-gray-600 rounded"></div>
                      <div className="w-3/4 h-3 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChannels.map((channel: any) => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>
            )}

            {!channelsLoading && filteredChannels.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Kanal bulunamadı</p>
                  <p className="text-sm">Arama kriterlerinizi değiştirmeyi deneyin</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-black dark:text-white">Gelecek Çekilişler</h2>
              {isConnected && address && channels.some((channel: any) => 
                channel.creatorWalletAddress && 
                address.toLowerCase() === channel.creatorWalletAddress.toLowerCase()
              ) ? (
                <Dialog open={showCreateRaffle} onOpenChange={setShowCreateRaffle}>
                  <DialogTrigger asChild>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      <Plus className="h-4 w-4 mr-2" />
                      Çekiliş Duyuru
                    </Button>
                  </DialogTrigger>
                <DialogContent className="bg-duxxan-card border-duxxan-border text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Gelecek Çekiliş Duyurusu</DialogTitle>
                  </DialogHeader>
                  <Form {...raffleForm}>
                    <form onSubmit={raffleForm.handleSubmit(onSubmitRaffle)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={raffleForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Başlık</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-duxxan-darker border-duxxan-border text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={raffleForm.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Kategori</FormLabel>
                              <FormControl>
                                <CategorySelect field={field} categories={categories} />
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
                              <Textarea {...field} className="bg-duxxan-darker border-duxxan-border text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={raffleForm.control}
                          name="prizeValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Ödül (USDT)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.000001" className="bg-duxxan-darker border-duxxan-border text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={raffleForm.control}
                          name="ticketPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Bilet Fiyatı (USDT)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.000001" className="bg-duxxan-darker border-duxxan-border text-white" />
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
                                <Input {...field} type="number" className="bg-duxxan-darker border-duxxan-border text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={raffleForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Başlangıç Tarihi</FormLabel>
                            <FormControl>
                              <Input {...field} type="datetime-local" className="bg-duxxan-darker border-duxxan-border text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={createUpcomingRaffleMutation.isPending}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black w-full"
                      >
                        {createUpcomingRaffleMutation.isPending ? 'Oluşturuluyor...' : 'Duyuru Oluştur'}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              ) : null}
            </div>

            {rafflesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-duxxan-card rounded-lg p-6 animate-pulse">
                    <div className="space-y-4">
                      <div className="w-3/4 h-6 bg-gray-600 rounded"></div>
                      <div className="space-y-2">
                        <div className="w-full h-3 bg-gray-600 rounded"></div>
                        <div className="w-2/3 h-3 bg-gray-600 rounded"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-20 h-4 bg-gray-600 rounded"></div>
                        <div className="w-16 h-4 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingRaffles.map((raffle: any) => (
                  <Card key={raffle.id} className="bg-duxxan-card border-duxxan-border hover:border-yellow-500 transition-all duration-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">{raffle.title}</CardTitle>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500">
                          {raffle.category}
                        </Badge>
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          Yakında
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {raffle.description}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-400">
                          <span>Ödül:</span>
                          <span className="text-yellow-400 font-semibold">{raffle.prizeValue} USDT</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Bilet Fiyatı:</span>
                          <span className="text-white">{raffle.ticketPrice} USDT</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Max Bilet:</span>
                          <span className="text-white">{raffle.maxTickets}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Başlangıç:</span>
                          <span className="text-white">{new Date(raffle.startDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <Heart className="h-4 w-4" />
                          <span>{raffle.interestedCount || 0} ilgilenen</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                        >
                          <Bell className="h-4 w-4 mr-1" />
                          Hatırlat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!rafflesLoading && upcomingRaffles.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Gelecek çekiliş bulunamadı</p>
                  <p className="text-sm">Yakında yeni duyurular yapılacak</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}