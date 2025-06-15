import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  ArrowLeft,
  Users,
  DollarSign,
  Calendar,
  Share2,
  ExternalLink,
  Copy,
  Facebook,
  Twitter,
  Send
} from 'lucide-react';

export default function CommunityDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Fetch channel details
  const { data: channelData, isLoading: channelLoading } = useQuery({
    queryKey: ['/api/channels', id],
  });

  // Fetch channel raffles
  const { data: rafflesData, isLoading: rafflesLoading } = useQuery({
    queryKey: ['/api/channels', id, 'raffles'],
  });

  const channel = (channelData as any)?.data;
  const raffles = (rafflesData as any)?.data || [];

  const handleJoin = () => {
    // Simulate wallet connection action
    toast({
      title: "Topluluğa Katılın",
      description: "Cüzdanınızı bağlayarak topluluğa katılabilirsiniz.",
    });
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Bağlantı Kopyalandı",
      description: "Topluluk bağlantısı panoya kopyalandı.",
    });
    setShowShareMenu(false);
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${channel?.name} topluluğuna katılın!`);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
    }
    
    window.open(shareUrl, '_blank');
    setShowShareMenu(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (channelLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Topluluk Bulunamadı</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Aradığınız topluluk mevcut değil.</p>
            <Button onClick={() => setLocation('/community')} className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Topluluklara Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setLocation('/community')}
            variant="ghost"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          
          <div className="relative">
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Paylaş
            </Button>
            
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Bağlantıyı Kopyala
                  </button>
                  <button
                    onClick={() => shareToSocial('twitter')}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter'da Paylaş
                  </button>
                  <button
                    onClick={() => shareToSocial('facebook')}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook'ta Paylaş
                  </button>
                  <button
                    onClick={() => shareToSocial('telegram')}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Telegram'da Paylaş
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Community Header */}
        <Card className="bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-500 mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={channel.avatar} alt={channel.name} />
                <AvatarFallback className="bg-yellow-500 text-white text-2xl">
                  {(channel.name || 'T').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {channel.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-600">
                        {channel.category}
                      </Badge>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        Oluşturan: {channel.creator || 'Anonymous'}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleJoin}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 text-lg font-semibold"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Katıl
                  </Button>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {channel.description}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 text-center">
                <Users className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {(channel.subscriberCount || 0).toLocaleString()}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Abone</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${(channel.totalPrizes || 0).toLocaleString()}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Toplam Ödül</div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {raffles.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Aktif Çekiliş</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Raffles Section */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Aktif ve Gelecek Çekilişler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rafflesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full" />
              </div>
            ) : raffles.length > 0 ? (
              <div className="space-y-4">
                {raffles.map((raffle: any) => (
                  <div
                    key={raffle.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-yellow-400 dark:hover:border-yellow-500 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/raffles/${raffle.id}`)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                        {raffle.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(raffle.startDate || raffle.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {raffle.prizeValue} USDT
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz Çekiliş Yok
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Bu toplulukta henüz aktif veya planlanmış çekiliş bulunmuyor.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}