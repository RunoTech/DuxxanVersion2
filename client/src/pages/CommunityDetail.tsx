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
  Send,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function CommunityDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Fetch channel details
  const { data: channelData, isLoading: channelLoading } = useQuery({
    queryKey: [`/api/channels/${id}`],
    enabled: !!id,
  });

  // Fetch channel raffles
  const { data: rafflesData, isLoading: rafflesLoading } = useQuery({
    queryKey: [`/api/channels/${id}/raffles`],
    enabled: !!id,
  });

  const channel = (channelData as any)?.data;
  const raffles = (rafflesData as any)?.data || [];
  
  // Parse demo content if available
  const demoContent = channel?.demoContent ? JSON.parse(channel.demoContent) : null;
  const displayRaffles = channel?.isDemo && demoContent?.sampleRaffles ? demoContent.sampleRaffles : raffles;

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
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                        {channel.name}
                      </CardTitle>
                      {channel.isDemo && (
                        <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 border border-orange-300 dark:border-orange-600 px-3 py-1">
                          DEMO
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-600">
                        {channel.category}
                      </Badge>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        Oluşturan: {channel.creator?.username || 'Anonymous'}
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {channel?.isDemo ? 'Demo Çekilişler' : 'Aktif ve Gelecek Çekilişler'}
              </CardTitle>
              {channel?.isDemo && (
                <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 border border-blue-300 dark:border-blue-600">
                  Örnek İçerik
                </Badge>
              )}
            </div>
            {channel?.isDemo && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Bu demo kanalında örnek çekiliş içerikleri görüntülenmektedir. Gerçek çekiliş değildir.
              </p>
            )}
          </CardHeader>
          <CardContent>
            {rafflesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full" />
              </div>
            ) : displayRaffles.length > 0 ? (
              <div className="space-y-4">
                {displayRaffles.map((raffle: any, index: number) => (
                  <div
                    key={channel?.isDemo ? `demo-${index}` : raffle.id}
                    className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors ${
                      channel?.isDemo 
                        ? 'cursor-default border-dashed' 
                        : 'hover:border-yellow-400 dark:hover:border-yellow-500 cursor-pointer'
                    }`}
                    onClick={() => !channel?.isDemo && setLocation(`/raffles/${raffle.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {raffle.title}
                        </h3>
                        {channel?.isDemo && (
                          <Badge variant="outline" className="text-xs">
                            DEMO
                          </Badge>
                        )}
                      </div>
                      {raffle.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {raffle.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {channel?.isDemo 
                            ? formatDate(raffle.endDate) 
                            : formatDate(raffle.startDate || raffle.createdAt)
                          }
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {raffle.prizeValue}
                        </div>
                      </div>
                    </div>
                    {!channel?.isDemo && <ExternalLink className="h-5 w-5 text-gray-400" />}
                    {channel?.isDemo && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                        Önizleme
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {channel?.isDemo ? 'Demo İçerik Yükleniyor' : 'Henüz Çekiliş Yok'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {channel?.isDemo 
                    ? 'Demo çekiliş içerikleri hazırlanıyor...'
                    : 'Bu toplulukta henüz aktif veya planlanmış çekiliş bulunmuyor.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Features Section */}
        {channel?.isDemo && demoContent?.features && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <Info className="h-6 w-6" />
                Demo Özellikleri
              </CardTitle>
              <p className="text-blue-700 dark:text-blue-400">
                Bu demo kanalında deneyimleyebileceğiniz özellikler:
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoContent.features.map((feature: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                      Demo Kanal Bilgisi
                    </h4>
                    <p className="text-yellow-800 dark:text-yellow-400 text-sm">
                      Bu demo kanalında gerçek para transferi yapılmaz. Tüm işlemler simülasyon amaçlıdır ve 
                      platform özelliklerini denemeniz için tasarlanmıştır.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}