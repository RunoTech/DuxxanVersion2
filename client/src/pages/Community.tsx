import { useState, useMemo, useRef, useEffect } from 'react';
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
import { useReminders } from '@/contexts/ReminderContext';
import { Users, Plus, Bell, Calendar, Trophy, Eye, Heart, Share2, Search, Filter, CheckCircle, Edit, Globe, Tag, Sparkles, ChevronDown, DollarSign, Ticket, Hash, Clock, User, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Countdown hook
const useCountdown = (targetDate: string) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

// Helper function to format numbers
const formatCurrency = (value: string | number) => {
  const num = parseFloat(value.toString());
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num % 1 === 0) {
    return num.toString();
  } else {
    return num.toFixed(1);
  }
};

// Raffle Card Component
const RaffleCard = ({ raffle, isInterested, onToggleInterest }: { 
  raffle: any; 
  isInterested: boolean; 
  onToggleInterest: (raffleId: number) => void; 
}) => {
  const countdown = useCountdown(raffle.startDate);

  const handleReminder = () => {
    onToggleInterest(raffle.id);
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-[#FFC929] transition-all duration-300 rounded-2xl overflow-hidden w-full min-h-[400px] flex flex-col">
      <CardHeader className="p-3 sm:p-4 flex-shrink-0">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <AvatarImage src={`/api/placeholder/48/48`} />
              <AvatarFallback className="bg-[#FFC929] text-black font-bold text-xs sm:text-sm">
                {raffle.creator?.username?.charAt(0).toUpperCase() || 'R'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-gray-900 dark:text-white text-sm sm:text-base md:text-lg font-bold truncate leading-tight">
                {raffle.title}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate mt-0.5">
                @{raffle.creator?.username || 'anonim'}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
            <Badge className="bg-[#FFC929] text-black px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold rounded-full whitespace-nowrap">
              {raffle.category?.name || 'Genel'}
            </Badge>
            <Badge className="bg-emerald-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold rounded-full whitespace-nowrap">
              Yakında
            </Badge>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
          {raffle.description}
        </p>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 pt-0 flex-1 flex flex-col">
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-[#FFC929] flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Ödül:</span>
            </div>
            <span className="text-[#FFC929] font-bold text-sm sm:text-base md:text-lg truncate ml-2">
              {formatCurrency(raffle.prizeValue)} USDT
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400">
              <Ticket className="h-3 w-3 sm:h-4 sm:w-4 text-[#FFC929] flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Bilet:</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm truncate ml-2">
              {formatCurrency(raffle.ticketPrice)} USDT
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400">
              <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-[#FFC929] flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">Max:</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm truncate ml-2">
              {formatCurrency(raffle.maxTickets)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Başlangıç:</span>
            <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm truncate ml-2">
              {new Date(raffle.startDate).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 flex-shrink-0">
            <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">{Number(raffle.interestedCount) || 0} ilgilenen</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className={`transition-all duration-200 text-xs px-2 py-1 sm:px-3 sm:py-2 flex-shrink-0 ${
              isInterested 
                ? 'bg-[#FFC929] text-black border-[#FFC929] hover:bg-[#FFD700]' 
                : 'border-[#FFC929] text-[#FFC929] bg-transparent raffle-button-hover'
            }`}
            onClick={handleReminder}
          >
            <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Hatırlat
          </Button>
        </div>
        
        {/* Countdown Timer */}
        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 border border-gray-300 dark:border-gray-600 mt-auto">
          <div className="flex justify-center space-x-1 sm:space-x-2 md:space-x-4">
            <div className="text-center flex-1 min-w-0">
              <div className="text-[#FFC929] font-bold text-sm sm:text-base md:text-lg leading-tight">
                {countdown.days.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs leading-tight">Gün</div>
            </div>
            <div className="text-center flex-1 min-w-0">
              <div className="text-[#FFC929] font-bold text-sm sm:text-base md:text-lg leading-tight">
                {countdown.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs leading-tight">Saat</div>
            </div>
            <div className="text-center flex-1 min-w-0">
              <div className="text-[#FFC929] font-bold text-sm sm:text-base md:text-lg leading-tight">
                {countdown.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs leading-tight">Dakika</div>
            </div>
            <div className="text-center flex-1 min-w-0">
              <div className="text-[#FFC929] font-bold text-sm sm:text-base md:text-lg leading-tight">
                {countdown.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs leading-tight">Saniye</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [subscribedChannels, setSubscribedChannels] = useState<number[]>([2]);
  const { interestedRaffles, userSession, addReminder, removeReminder, isInterested } = useReminders();

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

  const upcomingRaffles = Array.isArray(upcomingRafflesData) ? upcomingRafflesData : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Define countries array
  const countries = [
    { value: 'all', label: 'Tüm Ülkeler' },
    { value: 'TUR', label: '🇹🇷 Türkiye' },
    { value: 'USA', label: '🇺🇸 Amerika Birleşik Devletleri' },
    { value: 'GER', label: '🇩🇪 Almanya' },
    { value: 'FR', label: '🇫🇷 Fransa' },
    { value: 'GB', label: '🇬🇧 Birleşik Krallık' },
    { value: 'IT', label: '🇮🇹 İtalya' },
    { value: 'ES', label: '🇪🇸 İspanya' },
    { value: 'NL', label: '🇳🇱 Hollanda' },
    { value: 'BE', label: '🇧🇪 Belçika' },
    { value: 'CH', label: '🇨🇭 İsviçre' },
    { value: 'AT', label: '🇦🇹 Avusturya' },
    { value: 'SE', label: '🇸🇪 İsveç' },
    { value: 'NO', label: '🇳🇴 Norveç' },
    { value: 'DK', label: '🇩🇰 Danimarka' },
    { value: 'FI', label: '🇫🇮 Finlandiya' },
    { value: 'RU', label: '🇷🇺 Rusya' },
    { value: 'CN', label: '🇨🇳 Çin' },
    { value: 'JP', label: '🇯🇵 Japonya' },
    { value: 'KR', label: '🇰🇷 Güney Kore' },
    { value: 'IN', label: '🇮🇳 Hindistan' },
    { value: 'PK', label: '🇵🇰 Pakistan' },
    { value: 'BD', label: '🇧🇩 Bangladeş' },
    { value: 'ID', label: '🇮🇩 Endonezya' },
    { value: 'MY', label: '🇲🇾 Malezya' },
    { value: 'TH', label: '🇹🇭 Tayland' },
    { value: 'VN', label: '🇻🇳 Vietnam' },
    { value: 'PH', label: '🇵🇭 Filipinler' },
    { value: 'SG', label: '🇸🇬 Singapur' },
    { value: 'AE', label: '🇦🇪 Birleşik Arap Emirlikleri' },
    { value: 'SA', label: '🇸🇦 Suudi Arabistan' },
    { value: 'IR', label: '🇮🇷 İran' },
    { value: 'IQ', label: '🇮🇶 Irak' },
    { value: 'SY', label: '🇸🇾 Suriye' },
    { value: 'LB', label: '🇱🇧 Lübnan' },
    { value: 'JO', label: '🇯🇴 Ürdün' },
    { value: 'IL', label: '🇮🇱 İsrail' },
    { value: 'EG', label: '🇪🇬 Mısır' },
    { value: 'LY', label: '🇱🇾 Libya' },
    { value: 'TN', label: '🇹🇳 Tunus' },
    { value: 'DZ', label: '🇩🇿 Cezayir' },
    { value: 'MA', label: '🇲🇦 Fas' },
    { value: 'NG', label: '🇳🇬 Nijerya' },
    { value: 'ZA', label: '🇿🇦 Güney Afrika' },
    { value: 'KE', label: '🇰🇪 Kenya' },
    { value: 'ET', label: '🇪🇹 Etiyopya' },
    { value: 'GH', label: '🇬🇭 Gana' },
    { value: 'BR', label: '🇧🇷 Brezilya' },
    { value: 'MX', label: '🇲🇽 Meksika' },
    { value: 'AR', label: '🇦🇷 Arjantin' },
    { value: 'CL', label: '🇨🇱 Şili' },
    { value: 'CO', label: '🇨🇴 Kolombiya' },
    { value: 'PE', label: '🇵🇪 Peru' },
    { value: 'VE', label: '🇻🇪 Venezuela' },
    { value: 'UY', label: '🇺🇾 Uruguay' },
    { value: 'PY', label: '🇵🇾 Paraguay' },
    { value: 'BO', label: '🇧🇴 Bolivya' },
    { value: 'EC', label: '🇪🇨 Ekvador' },
    { value: 'CA', label: '🇨🇦 Kanada' },
    { value: 'AU', label: '🇦🇺 Avustralya' },
    { value: 'NZ', label: '🇳🇿 Yeni Zelanda' },
    { value: 'PL', label: '🇵🇱 Polonya' },
    { value: 'CZ', label: '🇨🇿 Çek Cumhuriyeti' },
    { value: 'SK', label: '🇸🇰 Slovakya' },
    { value: 'HU', label: '🇭🇺 Macaristan' },
    { value: 'RO', label: '🇷🇴 Romanya' },
    { value: 'BG', label: '🇧🇬 Bulgaristan' },
    { value: 'HR', label: '🇭🇷 Hırvatistan' },
    { value: 'RS', label: '🇷🇸 Sırbistan' },
    { value: 'BA', label: '🇧🇦 Bosna Hersek' },
    { value: 'MK', label: '🇲🇰 Kuzey Makedonya' },
    { value: 'ME', label: '🇲🇪 Karadağ' },
    { value: 'AL', label: '🇦🇱 Arnavutluk' },
    { value: 'GR', label: '🇬🇷 Yunanistan' },
    { value: 'CY', label: '🇨🇾 Kıbrıs' },
    { value: 'MT', label: '🇲🇹 Malta' },
    { value: 'IS', label: '🇮🇸 İzlanda' },
    { value: 'IE', label: '🇮🇪 İrlanda' },
    { value: 'PT', label: '🇵🇹 Portekiz' },
    { value: 'LU', label: '🇱🇺 Lüksemburg' },
    { value: 'LI', label: '🇱🇮 Liechtenstein' },
    { value: 'MC', label: '🇲🇨 Monako' },
    { value: 'AD', label: '🇦🇩 Andorra' },
    { value: 'SM', label: '🇸🇲 San Marino' },
    { value: 'VA', label: '🇻🇦 Vatikan' },
    { value: 'UA', label: '🇺🇦 Ukrayna' },
    { value: 'BY', label: '🇧🇾 Belarus' },
    { value: 'LT', label: '🇱🇹 Litvanya' },
    { value: 'LV', label: '🇱🇻 Letonya' },
    { value: 'EE', label: '🇪🇪 Estonya' },
    { value: 'GE', label: '🇬🇪 Gürcistan' },
    { value: 'AM', label: '🇦🇲 Ermenistan' },
    { value: 'AZ', label: '🇦🇿 Azerbaycan' },
    { value: 'KZ', label: '🇰🇿 Kazakistan' },
    { value: 'UZ', label: '🇺🇿 Özbekistan' },
    { value: 'TM', label: '🇹🇲 Türkmenistan' },
    { value: 'TJ', label: '🇹🇯 Tacikistan' },
    { value: 'KG', label: '🇰🇬 Kırgızistan' },
    { value: 'MN', label: '🇲🇳 Moğolistan' },
    { value: 'AF', label: '🇦🇫 Afganistan' },
    { value: 'NP', label: '🇳🇵 Nepal' },
    { value: 'BT', label: '🇧🇹 Butan' },
    { value: 'LK', label: '🇱🇰 Sri Lanka' },
    { value: 'MV', label: '🇲🇻 Maldivler' },
  ];

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter(country => 
      country.label.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countries, countrySearch]);

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

  // Handle raffle interest toggle
  const handleToggleRaffleInterest = async (raffleId: number) => {
    if (!isConnected) {
      toast({
        title: "Uyarı",
        description: "Hatırlatma için cüzdan bağlantısı gerekli",
        variant: "destructive",
      });
      return;
    }

    try {
      const isCurrentlyInterested = isInterested(raffleId);
      const action = isCurrentlyInterested ? 'remove' : 'add';
      
      const response = await apiRequest('POST', `/api/upcoming-raffles/${raffleId}/reminder`, { 
        action,
        userSession 
      });
      
      if (response.ok) {
        if (isCurrentlyInterested) {
          removeReminder(raffleId);
          toast({
            title: "Başarılı",
            description: "Hatırlatma iptal edildi",
          });
        } else {
          addReminder(raffleId);
          toast({
            title: "Başarılı",
            description: "Hatırlatma ayarlandı!",
          });
        }
        queryClient.invalidateQueries({ queryKey: ['/api/upcoming-raffles'] });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      });
    }
  };

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
      className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700/50 hover:border-[#FFC929] hover:shadow-lg hover:shadow-[#FFC929]/20 transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden h-48 flex flex-col"
      onClick={() => setLocation(`/community/${channel.id}`)}
    >
      {/* Header Section */}
      <CardHeader className="p-4 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/api/placeholder/48/48`} />
              <AvatarFallback className="bg-gradient-to-br from-[#FFC929] to-[#FFB800] text-black font-bold text-sm">
                Y
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white truncate">
                {channel.name}
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{channel.creator?.username || channel.creator?.walletAddress?.slice(0, 8) || 'user_44c417'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Badge className="bg-[#FFC929] text-black px-2 py-0.5 text-xs font-bold rounded-full">
              {channel.categoryName || 'Elektronik'}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Content Section - Flexible */}
      <CardContent className="flex-1 px-4 pb-4 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
            {channel.description || 'UI UX DESIGNER'}
          </p>
        </div>

        {/* Fixed Bottom Section */}
        <div className="flex justify-between items-center mt-4 pt-3">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 bg-[#B8860B]/20 dark:bg-[#B8860B]/20 rounded-full flex items-center justify-center">
                <Users className="h-2.5 w-2.5 text-[#B8860B] dark:text-[#B8860B]" />
              </div>
              <span className="font-medium text-gray-700 dark:text-white text-xs">{channel.subscriberCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 bg-[#B8860B]/20 dark:bg-[#B8860B]/20 rounded-full flex items-center justify-center">
                <DollarSign className="h-2.5 w-2.5 text-[#B8860B] dark:text-[#B8860B]" />
              </div>
              <span className="font-medium text-gray-700 dark:text-white text-xs">{channel.totalPrizeAmount || 0} USDT</span>
            </div>
          </div>
          <Button
            size="sm"
            variant={subscribedChannels.includes(channel.id) ? "default" : "outline"}
            className={subscribedChannels.includes(channel.id) 
              ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1 rounded-full text-xs h-6 border-0" 
              : "border border-[#FFC929] text-[#FFC929] hover:bg-[#FFC929] hover:text-black font-semibold px-3 py-1 rounded-full text-xs h-6"
            }
            onClick={(e) => {
              e.stopPropagation();
              handleSubscribe(channel.id);
            }}
          >
            {subscribedChannels.includes(channel.id) ? (
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-2.5 w-2.5" />
                <span>Abone</span>
              </div>
            ) : (
              'Abone Ol'
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
      <div className="relative overflow-hidden bg-gradient-to-r from-[#FFC929] via-[#FFB800] to-[#FFA500] dark:from-[#FFC929] dark:via-[#FFB800] dark:to-[#FFA500]">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFC929]/20 to-[#FFB800]/20"></div>
        
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
                  <Button className="bg-white dark:bg-gray-800 text-[#B8860B] dark:text-[#FFC929] hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all border dark:border-gray-600">
                    <Plus className="h-5 w-5 mr-2" />
                    Kanal Oluştur
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Dialog open={showCreateRaffle} onOpenChange={setShowCreateRaffle}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-3 rounded-xl shadow-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    Çekiliş Duyuru
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <DialogHeader className="text-center pb-4">
                    <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-black" />
                    </div>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#FFC929] to-[#FFB800] bg-clip-text text-transparent">Gelecek Çekiliş Duyurusu</DialogTitle>
                  </DialogHeader>
                  <Form {...raffleForm}>
                    <form onSubmit={raffleForm.handleSubmit(onSubmitRaffle)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={raffleForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                <Trophy className="w-4 h-4 mr-2 text-[#FFC929]" />
                                Başlık
                              </FormLabel>
                              <FormControl>
                                <Input {...field} 
                                  placeholder="Çekilişinizin başlığını girin..."
                                  className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200" 
                                />
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
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                <Tag className="w-4 h-4 mr-2 text-[#FFC929]" />
                                Kategori
                              </FormLabel>
                              <FormControl>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929]">
                                    <SelectValue placeholder="Kategori seçin" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    {categories
                                      .filter(cat => cat.id !== 'all')
                                      .map((category: any) => (
                                        <SelectItem 
                                          key={category.id} 
                                          value={category.id.toString()}
                                          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
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
                      </div>
                      
                      <FormField
                        control={raffleForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              <Edit className="w-4 h-4 mr-2 text-[#FFC929]" />
                              Açıklama
                            </FormLabel>
                            <FormControl>
                              <Textarea {...field} 
                                placeholder="Çekilişinizin detaylarını, kurallarını ve özelliklerini açıklayın..."
                                className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200 resize-none" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={raffleForm.control}
                          name="prizeValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                <DollarSign className="w-4 h-4 mr-2 text-[#FFC929]" />
                                Ödül (USDT)
                              </FormLabel>
                              <FormControl>
                                <Input {...field} 
                                  type="number" 
                                  step="0.000001" 
                                  placeholder="100.00"
                                  className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200" 
                                />
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
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                <Ticket className="w-4 h-4 mr-2 text-[#FFC929]" />
                                Bilet Fiyatı (USDT)
                              </FormLabel>
                              <FormControl>
                                <Input {...field} 
                                  type="number" 
                                  step="0.000001" 
                                  placeholder="1.00"
                                  className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200" 
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
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                <Hash className="w-4 h-4 mr-2 text-[#FFC929]" />
                                Max Bilet
                              </FormLabel>
                              <FormControl>
                                <Input {...field} 
                                  type="number" 
                                  placeholder="1000"
                                  className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200" 
                                />
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
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-[#FFC929]" />
                              Başlangıç Tarihi
                            </FormLabel>
                            <FormControl>
                              <Input {...field} 
                                type="datetime-local" 
                                className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200 [color-scheme:light] dark:[color-scheme:dark]" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          type="submit"
                          disabled={createUpcomingRaffleMutation.isPending}
                          className="h-14 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold w-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          {createUpcomingRaffleMutation.isPending ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                              Oluşturuluyor...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 mr-2" />
                              Duyuru Oluştur
                            </div>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Filters */}
        {activeTab === 'channels' && (
          <div className="mb-8">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Filter className="w-5 h-5" />
                  Filtreler ve Arama
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <Input
                      placeholder="Kanal ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 pl-10 focus:border-[#FFC929] dark:focus:border-[#FFC929] focus:ring-2 focus:ring-[#FFC929]/20"
                    />
                  </div>

                  {/* Category Filter */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-[#FFC929] dark:focus:border-[#FFC929] focus:ring-2 focus:ring-[#FFC929]/20">
                      <SelectValue placeholder="📁 Tüm Kategoriler" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Country Filter with Search */}
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="h-11 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-[#FFC929] dark:focus:border-[#FFC929] focus:ring-2 focus:ring-[#FFC929]/20 rounded-md px-3 py-2 text-left flex items-center justify-between"
                    >
                      <span className="truncate">
                        {selectedCountry === 'all' 
                          ? '🌍 Tüm Ülkeler' 
                          : countries.find(c => c.value === selectedCountry)?.label || '🌍 Tüm Ülkeler'
                        }
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isCountryDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              placeholder="Ülke ara..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className="pl-8 h-8 text-sm bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        
                        {/* Country List */}
                        <div className="max-h-48 overflow-y-auto">
                          {filteredCountries.map((country) => (
                            <button
                              key={country.value}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country.value);
                                setIsCountryDropdownOpen(false);
                                setCountrySearch('');
                              }}
                              className="w-full text-left px-3 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                            >
                              {country.label}
                            </button>
                          ))}
                          {filteredCountries.length === 0 && countrySearch && (
                            <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                              Ülke bulunamadı
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clear Filters */}
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedCountry('all');
                      setCountrySearch('');
                    }}
                    className="h-11 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold"
                  >
                    Filtreleri Temizle
                  </Button>
                </div>
                
                {/* Results Info inside filter card */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {filteredChannels.length} sonuç gösteriliyor ({channels.length} toplam kanal)
                  </p>
                  {searchQuery && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      "{searchQuery}" için arama sonuçları
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
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
                                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                                    {countries.map((country) => (
                                      <SelectItem 
                                        key={country.value} 
                                        value={country.value}
                                        className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
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
              <DialogContent className="max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white shadow-2xl">
                <DialogHeader className="pb-6">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FFC929]/20 to-[#FFB800]/30 rounded-2xl mx-auto mb-6 shadow-lg">
                    <Edit className="h-10 w-10 text-[#FFC929]" />
                  </div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#FFC929] to-[#FFB800] bg-clip-text text-transparent text-center">
                    Kanalı Düzenle
                  </DialogTitle>
                  <p className="text-gray-500 dark:text-gray-400 text-center text-sm mt-2">
                    Kanalınızın bilgilerini güncelleyebilirsiniz
                  </p>
                </DialogHeader>
                <Form {...editChannelForm}>
                  <form onSubmit={editChannelForm.handleSubmit(onSubmitEditChannel)} className="space-y-6">
                    <FormField
                      control={editChannelForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <User className="w-4 h-4 mr-2 text-[#FFC929]" />
                            Kanal Adı
                          </FormLabel>
                          <FormControl>
                            <Input {...field} 
                              placeholder="Kanal adınızı girin..."
                              className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200" 
                            />
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
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Edit className="w-4 h-4 mr-2 text-[#FFC929]" />
                            Açıklama
                          </FormLabel>
                          <FormControl>
                            <Textarea {...field} 
                              placeholder="Kanalınızın amacını ve kurallarını açıklayın..."
                              className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200 resize-none" 
                            />
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
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            <Trophy className="w-4 h-4 mr-2 text-[#FFC929]" />
                            Kategori
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800">
                                <SelectValue placeholder="Kategori seçin" className="text-gray-900 dark:text-white" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                                {categories
                                  .filter(cat => cat.id !== 'all')
                                  .map((category: any) => (
                                    <SelectItem 
                                      key={category.id} 
                                      value={category.id.toString()}
                                      className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
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
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="submit"
                        disabled={editChannelMutation.isPending}
                        className="h-14 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold w-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        {editChannelMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                            Güncelleniyor...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Edit className="h-5 w-5 mr-2" />
                            Kanalı Güncelle
                          </div>
                        )}
                      </Button>
                    </div>
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-[#FFC929]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gelecek Çekilişler</h2>
                <Badge variant="secondary" className="bg-[#FFC929]/20 text-[#FFC929] border border-[#FFC929]/30">
                  {upcomingRaffles.length}
                </Badge>
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingRaffles.map((raffle: any) => (
                  <RaffleCard 
                    key={raffle.id} 
                    raffle={raffle} 
                    isInterested={interestedRaffles.includes(raffle.id)}
                    onToggleInterest={handleToggleRaffleInterest}
                  />
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