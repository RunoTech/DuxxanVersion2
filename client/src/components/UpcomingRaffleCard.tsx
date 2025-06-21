import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  Ticket, 
  Hash, 
  Clock, 
  User, 
  Bell, 
  BellOff,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface UpcomingRaffleCardProps {
  raffle: {
    id: number;
    title: string;
    description: string;
    prizeValue: string;
    ticketPrice: string;
    maxTickets: number;
    startDate: string;
    categoryId: number;
    creatorId: number;
    isActive: boolean;
    createdAt: string;
    interestedCount: number;
    creator: {
      id: number;
      username: string;
      walletAddress: string;
      name: string | null;
    };
    category: {
      id: number;
      name: string;
    };
  };
}

export function UpcomingRaffleCard({ raffle }: UpcomingRaffleCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInterested, setIsInterested] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Get user session from localStorage or context
  const userSession = localStorage.getItem('userSession') || `user_${Math.random().toString(36).substring(2)}${Date.now()}`;

  // Countdown timer effect
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(raffle.startDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown(); // Initial call
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [raffle.startDate]);

  // Toggle reminder mutation
  const toggleReminderMutation = useMutation({
    mutationFn: async (action: 'add' | 'remove') => {
      const response = await apiRequest('POST', `/api/upcoming-raffles/${raffle.id}/reminder`, {
        action,
        userSession
      });
      return response.json();
    },
    onSuccess: (data, action) => {
      setIsInterested(action === 'add');
      toast({
        title: action === 'add' ? "Hatırlatıcı Eklendi" : "Hatırlatıcı Kaldırıldı",
        description: action === 'add' 
          ? "Çekiliş başladığında bildirim alacaksınız" 
          : "Hatırlatıcı başarıyla kaldırıldı",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/upcoming-raffles'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Hatırlatıcı ayarlanırken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleToggleReminder = () => {
    const action = isInterested ? 'remove' : 'add';
    toggleReminderMutation.mutate(action);
  };

  // Format date
  const startDate = new Date(raffle.startDate);
  const now = new Date();
  const timeUntilStart = startDate.getTime() - now.getTime();
  const daysUntilStart = Math.ceil(timeUntilStart / (1000 * 60 * 60 * 24));
  
  // Format date string
  const formattedDate = startDate.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isStartingSoon = timeUntilStart > 0 && timeUntilStart < 24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#FFC929] dark:hover:border-[#FFC929] transition-all duration-300 hover:shadow-lg group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Trophy className="h-6 w-6 text-black" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-[#FFC929] transition-colors duration-300 line-clamp-1">
                {raffle.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs border-[#FFC929]/30 text-[#FFC929]">
                  {raffle.category.name}
                </Badge>
                {isStartingSoon && (
                  <Badge className="bg-red-500 text-white text-xs animate-pulse">
                    Yakında Başlıyor
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleReminder}
            disabled={toggleReminderMutation.isPending}
            className={`${
              isInterested 
                ? 'text-[#FFC929] hover:text-[#FFB800] bg-[#FFC929]/10 hover:bg-[#FFC929]/20' 
                : 'text-gray-400 hover:text-[#FFC929] hover:bg-[#FFC929]/10'
            } transition-all duration-300`}
          >
            {isInterested ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {raffle.description}
        </p>

        {/* Prize and Ticket Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-[#FFC929]" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Ödül</span>
            </div>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {parseFloat(raffle.prizeValue).toLocaleString()} USDT
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Ticket className="h-4 w-4 text-[#FFC929]" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Bilet</span>
            </div>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {parseFloat(raffle.ticketPrice).toLocaleString()} USDT
            </p>
          </div>
        </div>

        {/* Max Tickets and Interest Count */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Hash className="h-4 w-4" />
            <span>Max: {raffle.maxTickets.toLocaleString()} bilet</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Bell className="h-4 w-4" />
            <span>{raffle.interestedCount} kişi ilgileniyor</span>
          </div>
        </div>

        {/* Start Date */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FFC929]/10 to-[#FFB800]/10 rounded-lg border border-[#FFC929]/20">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#FFC929]" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Başlangıç</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{formattedDate}</p>
            {daysUntilStart > 0 && (
              <p className="text-xs text-[#FFC929]">
                {daysUntilStart === 1 ? 'Yarın' : `${daysUntilStart} gün sonra`}
              </p>
            )}
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-[#FFC929]/10 to-[#FFB800]/10 rounded-xl p-4 border border-[#FFC929]/20 mt-4">
          <div className="flex items-center justify-center mb-3">
            <Clock className="h-4 w-4 text-[#FFC929] mr-2" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Başlamaya Kalan Süre</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="bg-[#FFC929] text-black font-bold text-lg rounded-lg py-2 px-1 min-h-[2.5rem] flex items-center justify-center">
                {countdown.days.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Gün</div>
            </div>
            <div className="text-center">
              <div className="bg-[#FFC929] text-black font-bold text-lg rounded-lg py-2 px-1 min-h-[2.5rem] flex items-center justify-center">
                {countdown.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Saat</div>
            </div>
            <div className="text-center">
              <div className="bg-[#FFC929] text-black font-bold text-lg rounded-lg py-2 px-1 min-h-[2.5rem] flex items-center justify-center">
                {countdown.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Dakika</div>
            </div>
            <div className="text-center">
              <div className="bg-[#FFC929] text-black font-bold text-lg rounded-lg py-2 px-1 min-h-[2.5rem] flex items-center justify-center">
                {countdown.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">Saniye</div>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700 mt-4">
          <User className="h-3 w-3" />
          <span>Oluşturan: {raffle.creator.username}</span>
          <span>•</span>
          <Calendar className="h-3 w-3" />
          <span>{new Date(raffle.createdAt).toLocaleDateString('tr-TR')}</span>
        </div>
      </CardContent>
    </Card>
  );
}