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
import { useWalletFixed as useWallet } from '@/hooks/useWalletFixed';
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

  // Fetch channels from database with optimized caching
  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ['/api/channels'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: true
  });

  const channels = (channelsData as any)?.data || [];

  // Fetch upcoming raffles from database with caching
  const { data: upcomingRafflesData, isLoading: rafflesLoading } = useQuery({
    queryKey: ['/api/upcoming-raffles'],
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    enabled: true
  });

  const upcomingRaffles = (upcomingRafflesData as any)?.data || [];

  // Fetch categories from database with long caching
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: true
  });

  const categories = [
    { id: 'all', name: 'Tüm Kategoriler' },
    ...(Array.isArray(categoriesData) ? categoriesData : []).map((cat: any) => ({
      id: cat.id.toString(),
      name: cat.name
    }))
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
        setSubscribedChannels(prev => [...prev, channelId]);
        toast({
          title: "Başarılı",
          description: "Kanala abone oldunuz",
        });
      } else {
        setSubscribedChannels(prev => prev.filter(id => id !== channelId));
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

    const action = subscribedChannels.includes(channelId) ? 'unsubscribe' : 'subscribe';
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
      className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-[#FFC929] dark:hover:border-[#FFC929] hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden"
      onClick={() => setLocation(`/community/${channel.id}`)}
    >
      <CardHeader className="pb-4 bg-gradient-to-r from-[#FFC929]/10 to-[#FFC929]/20 dark:from-[#FFC929]/10 dark:to-[#FFC929]/20">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14 ring-2 ring-white/50 shadow-lg">
              <AvatarImage src={`/api/placeholder/48/48`} />
              <AvatarFallback className="bg-gradient-to-br from-[#FFC929] to-[#FFB800] text-black font-bold text-lg">
                {channel.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#FFC929] dark:group-hover:text-[#FFC929] transition-colors">
                {channel.name}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">@{channel.creator}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <Badge className="bg-[#FFC929]/20 text-[#B8860B] dark:bg-[#FFC929]/30 dark:text-[#FFC929] border-0 px-3 py-1 text-xs font-semibold rounded-full">
              {channel.categoryName || 'Genel'}
            </Badge>
            {channel.country && (
              <Badge variant="outline" className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 rounded-full">
                {countries.find(c => c.value === channel.country)?.label || channel.country}
              </Badge>
            )}
            {isOwner && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-[#FFC929] hover:bg-[#FFC929]/10 dark:hover:bg-[#FFC929]/20 rounded-full"
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
      <CardContent className="pt-0 p-6">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2 leading-relaxed">
          {channel.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-[#FFC929]/20 dark:bg-[#FFC929]/30 rounded-full">
                <Users className="h-3 w-3 text-[#B8860B] dark:text-[#FFC929]" />
              </div>
              <span className="font-medium">{channel.subscriberCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-[#FFC929]/20 dark:bg-[#FFC929]/30 rounded-full">
                <Trophy className="h-3 w-3 text-[#B8860B] dark:text-[#FFC929]" />
              </div>
              <span className="font-medium">{channel.totalPrizes || 0} USDT</span>
            </div>
          </div>
          <Button
            size="sm"
            variant={subscribedChannels.includes(channel.id) ? "secondary" : "outline"}
            className={subscribedChannels.includes(channel.id) 
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0 shadow-md rounded-full px-4 font-semibold" 
              : "border-[#FFC929] text-[#B8860B] hover:bg-[#FFC929]/10 dark:border-[#FFC929] dark:text-[#FFC929] dark:hover:bg-[#FFC929]/20 rounded-full px-4 font-semibold"
            }
            onClick={(e) => {
              e.stopPropagation();
              handleSubscribe(channel.id);
            }}
          >
            {subscribedChannels.includes(channel.id) ? (
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-all duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 dark:from-yellow-600 dark:via-orange-700 dark:to-yellow-800">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white">
                DUXXAN Topluluk
              </h1>
            </div>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Kanallar oluşturun, gelecek çekilişleri duyurun ve küresel topluluğa katılın
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <Plus className="h-5 w-5 mr-2" />
                    Kanal Oluştur
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Dialog open={showCreateRaffle} onOpenChange={setShowCreateRaffle}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-3 rounded-xl">
                    <Calendar className="h-5 w-5 mr-2" />
                    Çekiliş Duyuru
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Modern Filters */}
        {activeTab === 'channels' && (
          <div className="mb-8">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-[#FFC929] transition-colors" />
                  <Input
                    placeholder="Kanal ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-300/50 dark:border-gray-600/50 rounded-xl h-12 focus:ring-2 focus:ring-[#FFC929]/20 focus:border-[#FFC929] transition-all"
                  />
                </div>
                
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/80 dark:bg-gray-800/80 border border-gray-300/50 dark:border-gray-600/50 rounded-xl h-12 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-[#FFC929]/20 focus:border-[#FFC929] transition-all appearance-none"
                  >
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/80 dark:bg-gray-800/80 border border-gray-300/50 dark:border-gray-600/50 rounded-xl h-12 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-[#FFC929]/20 focus:border-[#FFC929] transition-all appearance-none"
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
            </div>
          </div>
        )}

        {/* Modern Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex">
              <button
                onClick={() => setActiveTab('channels')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'channels'
                    ? 'bg-gradient-to-r from-[#FFC929] to-[#FFB800] text-black shadow-lg transform scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Users className="h-5 w-5" />
                Kanallar
                <Badge className={`${activeTab === 'channels' ? 'bg-black/20 text-black' : 'bg-[#FFC929]/20 text-[#B8860B] dark:bg-[#FFC929]/30 dark:text-[#FFC929]'} font-bold`}>
                  {filteredChannels.length}
                </Badge>
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'upcoming'
                    ? 'bg-gradient-to-r from-[#FFC929] to-[#FFB800] text-black shadow-lg transform scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Calendar className="h-5 w-5" />
                Gelecek Çekilişler
                <Badge className={`${activeTab === 'upcoming' ? 'bg-black/20 text-black' : 'bg-[#FFC929]/20 text-[#B8860B] dark:bg-[#FFC929]/30 dark:text-[#FFC929]'} font-bold`}>
                  {upcomingRaffles.length}
                </Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'channels' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Topluluk Kanalları</h2>
                <p className="text-gray-600 dark:text-gray-400">Kanalları keşfedin ve favori topluluklarınıza katılın</p>
              </div>
            </div>

            {/* Channel Creation Dialog */}
            <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
              <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <DialogHeader className="text-center pb-4">
                    <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-black" />
                    </div>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#FFC929] to-[#FFB800] bg-clip-text text-transparent">
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
                                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FFC929] focus:border-transparent" 
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
                                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FFC929] focus:border-transparent min-h-[80px]" 
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
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent">
                                    <SelectValue placeholder="Kategori seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    {categories
                                      .filter(cat => cat.id !== 'all')
                                      .map((category: any) => (
                                        <SelectItem 
                                          key={category.id} 
                                          value={category.id.toString()}
                                          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
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
                                  <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent">
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
                                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FFC929] focus:border-transparent" 
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
                          className="flex-1 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold shadow-lg disabled:opacity-50"
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

            {/* Edit Channel Dialog */}
            <Dialog open={showEditChannel} onOpenChange={setShowEditChannel}>
              <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                <DialogHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-full flex items-center justify-center">
                    <Edit className="w-6 h-6 text-black" />
                  </div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#FFC929] to-[#FFB800] bg-clip-text text-transparent">Kanalı Düzenle</DialogTitle>
                </DialogHeader>
                <Form {...editChannelForm}>
                  <form onSubmit={editChannelForm.handleSubmit(onSubmitEditChannel)} className="space-y-4">
                    <FormField
                      control={editChannelForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">Kanal Adı</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent" />
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
                          <FormLabel className="text-gray-700 dark:text-gray-300">Açıklama</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent" />
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
                          <FormLabel className="text-gray-700 dark:text-gray-300">Kategori</FormLabel>
                          <FormControl>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent">
                                <SelectValue placeholder="Kategori seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories
                                  .filter(cat => cat.id !== 'all')
                                  .map((category: any) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={editChannelMutation.isPending}
                      className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold w-full"
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
                              <FormLabel className="text-gray-700 dark:text-gray-300">Kategori</FormLabel>
                              <FormControl>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent">
                                    <SelectValue placeholder="Kategori seçin" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories
                                      .filter(cat => cat.id !== 'all')
                                      .map((category: any) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                          {category.name}
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
                        control={raffleForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300">Açıklama</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent" />
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
                              <FormLabel className="text-gray-700 dark:text-gray-300">Ödül (USDT)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.000001" className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent" />
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
                              <FormLabel className="text-gray-700 dark:text-gray-300">Bilet Fiyatı (USDT)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.000001" className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent" />
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
                              <FormLabel className="text-gray-700 dark:text-gray-300">Max Bilet</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent" />
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
                            <FormLabel className="text-gray-700 dark:text-gray-300">Başlangıç Tarihi</FormLabel>
                            <FormControl>
                              <Input {...field} type="datetime-local" className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-transparent" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={createUpcomingRaffleMutation.isPending}
                        className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold w-full"
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