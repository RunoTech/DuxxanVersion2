import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  AlertCircle,
  Settings,
  Edit,
  Star,
  TrendingUp,
  Clock,
  Target,
  Award,
  MessageCircle,
  Heart,
  Bookmark,
  MoreHorizontal,
  Plus,
  Eye,
  Activity,
  FileText,
  Tag,
  X
} from 'lucide-react';

export default function CommunityDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: ''
  });

  // Fetch channel details
  const { data: channelData, isLoading: channelLoading, error: channelError, refetch } = useQuery({
    queryKey: [`/api/channels/${id}`],
    enabled: !!id,
  });

  // Fetch channel raffles
  const { data: rafflesData, isLoading: rafflesLoading } = useQuery({
    queryKey: [`/api/channels/${id}/raffles`],
    enabled: !!id,
  });

  // Parse API response properly
  const channel = channelData?.data || channelData;
  const raffles = rafflesData?.data || rafflesData || [];
  
  // Debug logging
  console.log('CommunityDetail - Channel ID:', id);
  console.log('CommunityDetail - Raw channel data:', channelData);
  console.log('CommunityDetail - Parsed channel:', channel);
  console.log('CommunityDetail - Loading:', channelLoading);
  console.log('CommunityDetail - Error:', channelError);
  
  // Parse demo content if available
  const demoContent = channel?.demoContent ? JSON.parse(channel.demoContent) : null;
  const displayRaffles = channel?.isDemo && demoContent?.sampleRaffles ? demoContent.sampleRaffles : raffles;

  // Check if current user is the channel creator (simplified for demo)
  const isChannelCreator = true; // In real app, check against authenticated user ID

  // Initialize edit form when channel data loads
  if (channel && editForm.name === '') {
    setEditForm({
      name: channel.name || '',
      description: channel.description || '',
      category: channel.category || ''
    });
  }

  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  // Initialize counts when channel data loads
  useEffect(() => {
    if (channel) {
      setLikeCount(channel.likeCount || 0);
      setViewCount(channel.viewCount || 0);
    }
  }, [channel]);

  // Check if user has already liked/favorited this channel
  useEffect(() => {
    const checkUserInteractions = async () => {
      if (id) {
        try {
          // Check like status
          const likeResponse = await fetch(`/api/channels/${id}/user-status/1`);
          if (likeResponse.ok) {
            const data = await likeResponse.json();
            setIsLiked(data.liked || false);
            setIsFavorited(data.favorited || false);
          }
        } catch (error) {
          console.error('Error checking user interactions:', error);
        }
      }
    };
    
    checkUserInteractions();
  }, [id]);

  const handleJoin = () => {
    // Simulate wallet connection action
    toast({
      title: "Topluluğa Katılın",
      description: "Cüzdanınızı bağlayarak topluluğa katılabilirsiniz.",
    });
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/channels/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 1 }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
        
        // Refresh channel data to get updated like count
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        toast({
          title: data.liked ? "Beğenildi!" : "Beğeni kaldırıldı",
          description: data.message,
        });
      }
    } catch (error) {
      console.error('Like error:', error);
      toast({
        title: "Hata",
        description: "Beğeni işlemi gerçekleştirilemedi.",
        variant: "destructive",
      });
    }
  };

  const handleFavorite = async () => {
    try {
      const response = await fetch(`/api/channels/${id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 1 }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.favorited);
        
        // Refresh favorites data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        toast({
          title: data.favorited ? "Favorilere eklendi!" : "Favorilerden çıkarıldı",
          description: data.message,
        });
      }
    } catch (error) {
      console.error('Favorite error:', error);
      toast({
        title: "Hata",
        description: "Favori işlemi gerçekleştirilemedi.",
        variant: "destructive",
      });
    }
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

  const handleEditChannel = async () => {
    try {
      const response = await apiRequest('PUT', `/api/channels/${id}`, editForm);
      if (response.ok) {
        toast({
          title: "Kanal güncellendi!",
          description: "Kanal bilgileri başarıyla güncellendi.",
        });
        setIsEditing(false);
        refetch();
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kanal güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Hero Section with Cover Image */}
      <div className="relative h-80 bg-gradient-to-r from-[#FFC929] via-[#FFB800] to-[#FFA500] overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        
        {/* Navigation */}
        <div className="relative z-10 flex items-center justify-between p-6">
          <Button
            onClick={() => setLocation('/community')}
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Topluluklar
          </Button>
          
          <div className="flex items-center gap-3">
            {isChannelCreator && (
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white shadow-2xl">
                  <DialogHeader className="pb-6">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FFC929]/20 to-[#FFB800]/30 rounded-2xl mx-auto mb-6 shadow-lg">
                      <Settings className="h-10 w-10 text-[#FFC929]" />
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#FFC929] to-[#FFB800] bg-clip-text text-transparent text-center">
                      Kanalı Düzenle
                    </DialogTitle>
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm mt-2">
                      Kanalınızın bilgilerini güncelleyebilirsiniz
                    </p>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                        <Users className="w-4 h-4 mr-2 text-[#FFC929]" />
                        Kanal Adı
                      </Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => handleEditFormChange('name', e.target.value)}
                        placeholder="Kanal adını girin..."
                        className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                        <FileText className="w-4 h-4 mr-2 text-[#FFC929]" />
                        Açıklama
                      </Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) => handleEditFormChange('description', e.target.value)}
                        placeholder="Kanalınızın amacını ve kurallarını açıklayın..."
                        rows={4}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white transition-all duration-200 resize-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                        <Tag className="w-4 h-4 mr-2 text-[#FFC929]" />
                        Kategori
                      </Label>
                      <Select
                        value={editForm.category}
                        onValueChange={(value) => handleEditFormChange('category', value)}
                      >
                        <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FFC929] focus:border-[#FFC929] focus:bg-white dark:focus:bg-gray-800">
                          <SelectValue placeholder="Kategori seçin" className="text-gray-900 dark:text-white" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                          <SelectItem value="kripto" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Kripto</SelectItem>
                          <SelectItem value="teknoloji" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Teknoloji</SelectItem>
                          <SelectItem value="finans" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Finans</SelectItem>
                          <SelectItem value="egitim" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Eğitim</SelectItem>
                          <SelectItem value="genel" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Genel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        onClick={handleEditChannel} 
                        className="flex-1 h-12 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Kaydet
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 h-12 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-lg transition-all duration-200"
                      >
                        <X className="h-5 w-5 mr-2" />
                        İptal
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <div className="relative">
              <Button
                onClick={handleShare}
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Paylaş
              </Button>
              
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl backdrop-blur-sm z-20">
                  <div className="p-2">
                    <button
                      onClick={copyToClipboard}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Bağlantıyı Kopyala
                    </button>
                    <button
                      onClick={() => shareToSocial('twitter')}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter'da Paylaş
                    </button>
                    <button
                      onClick={() => shareToSocial('facebook')}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook'ta Paylaş
                    </button>
                    <button
                      onClick={() => shareToSocial('telegram')}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Telegram'da Paylaş
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="flex items-end gap-6">
            <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl ring-2 ring-[#FFC929]/50">
              <AvatarImage src={channel?.avatar} alt={channel?.name} />
              <AvatarFallback className="bg-gradient-to-br from-[#FFC929] to-[#FFB800] text-black text-2xl font-bold">
                {(channel?.name || 'C').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{channel?.name}</h1>
                {channel?.isDemo && (
                  <Badge className="bg-[#FFC929]/90 text-black border-[#FFB800] px-3 py-1 text-sm backdrop-blur-sm font-semibold">
                    DEMO
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mb-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {channel?.category}
                </Badge>
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {channel?.creator?.username || 'Anonymous'}
                </span>
              </div>
              <p className="text-white/90 text-lg leading-relaxed max-w-2xl">
                {channel?.description}
              </p>
            </div>
            
            <Button
              onClick={handleJoin}
              size="lg"
              className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black border-0 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Users className="h-5 w-5 mr-2" />
              Katıl
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 -mt-12 relative z-10">
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-[#FFC929]/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Users className="h-6 w-6 text-black" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {(channel?.subscriberCount || 0).toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Abone</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-[#FFC929]/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                ${(channel?.totalPrizeAmount || 0).toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Toplam Ödül</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-[#FFC929]/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {channel?.activeRaffleCount || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Aktif Çekiliş</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-[#FFC929]/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <TrendingUp className="h-6 w-6 text-black" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {Math.floor(Math.random() * 100)}%
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Büyüme</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <Card className="flex-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-[#FFC929]/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-[#FFC929]" />
                    Topluluk Aktivitesi
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {viewCount.toLocaleString()} görüntüleme
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {likeCount.toLocaleString()} beğeni
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={`gap-2 border-[#FFC929]/50 hover:bg-[#FFC929]/10 transition-all ${
                      isLiked 
                        ? 'bg-[#FFC929]/10 text-[#FFC929] border-[#FFC929]' 
                        : 'text-[#FFC929]'
                    }`}
                    onClick={handleLike}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Beğenildi' : 'Beğen'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={`gap-2 border-[#FFC929]/50 hover:bg-[#FFC929]/10 transition-all ${
                      isFavorited 
                        ? 'bg-[#FFC929]/10 text-[#FFC929] border-[#FFC929]' 
                        : 'text-[#FFC929]'
                    }`}
                    onClick={handleFavorite}
                  >
                    <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                    {isFavorited ? 'Kaydedildi' : 'Kaydet'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isChannelCreator && (
            <Card className="bg-gradient-to-r from-[#FFC929]/10 to-[#FFB800]/10 dark:from-[#FFC929]/20 dark:to-[#FFB800]/20 border border-[#FFC929]/30 dark:border-[#FFC929]/40">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-[#FFC929]" />
                      Kanal Yönetimi
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Kanalınızı yönetin ve yeni içerik ekleyin
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold">
                      <Plus className="h-4 w-4" />
                      Çekiliş Ekle
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Raffles Section */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-[#FFC929]/20 shadow-xl">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-lg flex items-center justify-center shadow-lg">
                  <Target className="h-5 w-5 text-black" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {channel?.isDemo ? 'Demo Çekilişler' : 'Aktif ve Gelecek Çekilişler'}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {displayRaffles.length} çekiliş bulundu
                  </p>
                </div>
              </div>
              {channel?.isDemo && (
                <Badge className="bg-[#FFC929]/10 text-[#FFC929] dark:text-[#FFC929] border border-[#FFC929]/30 dark:border-[#FFC929]/40 px-3 py-1 font-semibold">
                  Örnek İçerik
                </Badge>
              )}
            </div>
            {channel?.isDemo && (
              <div className="mt-4 p-3 bg-[#FFC929]/10 dark:bg-[#FFC929]/20 border border-[#FFC929]/30 dark:border-[#FFC929]/40 rounded-lg">
                <p className="text-sm text-[#FFC929] dark:text-[#FFC929] flex items-center gap-2 font-medium">
                  <Info className="h-4 w-4" />
                  Bu demo kanalında örnek çekiliş içerikleri görüntülenmektedir. Gerçek çekiliş değildir.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {rafflesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Çekilişler yükleniyor...</p>
                </div>
              </div>
            ) : displayRaffles.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {displayRaffles.map((raffle: any, index: number) => (
                  <div
                    key={channel?.isDemo ? `demo-${index}` : raffle.id}
                    className={`p-6 transition-all duration-200 ${
                      channel?.isDemo 
                        ? 'cursor-default' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'
                    }`}
                    onClick={() => !channel?.isDemo && setLocation(`/raffles/${raffle.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#FFC929] to-[#FFB800] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Award className="h-8 w-8 text-black" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate">
                                {raffle.title}
                              </h3>
                              {channel?.isDemo && (
                                <Badge variant="outline" className="text-xs bg-[#FFC929]/10 text-[#FFC929] border-[#FFC929]/30 font-semibold">
                                  DEMO
                                </Badge>
                              )}
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                                Aktif
                              </Badge>
                            </div>
                            
                            {raffle.description && (
                              <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {raffle.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {channel?.isDemo 
                                    ? formatDate(raffle.endDate) 
                                    : formatDate(raffle.startDate || raffle.createdAt)
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <DollarSign className="h-4 w-4" />
                                <span>{raffle.prizeValue}</span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <Users className="h-4 w-4" />
                                <span>{Math.floor(Math.random() * 500) + 50} katılımcı</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {!channel?.isDemo ? (
                              <Button size="sm" className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold shadow-lg">
                                Katıl
                              </Button>
                            ) : (
                              <div className="text-xs text-[#FFC929] dark:text-[#FFC929] bg-[#FFC929]/10 dark:bg-[#FFC929]/20 px-3 py-1 rounded-full font-medium">
                                Önizleme
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              {!channel?.isDemo && <ExternalLink className="h-4 w-4 text-gray-400" />}
                              <Star className="h-4 w-4 text-[#FFC929]" />
                              <span className="text-xs text-gray-500">{(Math.random() * 5).toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar for Demo */}
                        {channel?.isDemo && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span>İlerleme</span>
                              <span>{Math.floor(Math.random() * 80) + 20}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-[#FFC929] to-[#FFB800] h-2 rounded-full shadow-sm" 
                                style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {channel?.isDemo ? 'Demo İçerik Yükleniyor' : 'Henüz Çekiliş Yok'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  {channel?.isDemo 
                    ? 'Demo çekiliş içerikleri hazırlanıyor. Lütfen bekleyin.'
                    : 'Bu toplulukta henüz aktif veya planlanmış çekiliş bulunmuyor. İlk çekilişi başlatmak için kanal oluşturucusuyla iletişime geçin.'
                  }
                </p>
                {!channel?.isDemo && isChannelCreator && (
                  <Button className="mt-4 bg-gradient-to-r from-[#FFC929] to-[#FFB800] hover:from-[#FFB800] hover:to-[#FFA500] text-black font-semibold shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Çekilişi Oluştur
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Features Section */}
        {channel?.isDemo && demoContent?.features && (
          <Card className="bg-gradient-to-br from-[#FFC929]/10 to-[#FFB800]/10 dark:from-[#FFC929]/20 dark:to-[#FFB800]/20 border border-[#FFC929]/30 dark:border-[#FFC929]/40">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#FFC929] dark:text-[#FFC929] flex items-center gap-2">
                <Info className="h-6 w-6" />
                Demo Özellikleri
              </CardTitle>
              <p className="text-[#FFC929]/80 dark:text-[#FFC929]/80">
                Bu demo kanalında deneyimleyebileceğiniz özellikler:
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoContent.features.map((feature: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-[#FFC929]/30 dark:border-[#FFC929]/40 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5 text-[#FFC929] dark:text-[#FFC929] flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-[#FFC929]/10 dark:bg-[#FFC929]/20 border border-[#FFC929]/30 dark:border-[#FFC929]/40 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#FFC929] dark:text-[#FFC929] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#FFC929] dark:text-[#FFC929] mb-1">
                      Demo Kanal Bilgisi
                    </h4>
                    <p className="text-[#FFC929]/80 dark:text-[#FFC929]/80 text-sm">
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