import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { WalletStatus } from '@/components/WalletStatus';
import { apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Wallet, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Star, 
  Trophy, 
  Target,
  Clock,
  DollarSign,
  Gift,
  Award,
  Calendar,
  MapPin,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser, isConnected, address } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    name: user?.name || '',
    profession: user?.profession || '',
    bio: user?.bio || '',
    website: user?.website || '',
    city: user?.city || '',
  });

  // Fetch user's raffle participations
  const { data: participations = [], isLoading: participationsLoading } = useQuery({
    queryKey: ['/api/users/me/participations'],
    enabled: isConnected && !!user?.id,
    staleTime: 60 * 1000,
  });

  // Fetch user's created raffles
  const { data: createdRafflesResponse, isLoading: createdRafflesLoading } = useQuery({
    queryKey: ['/api/raffles', { creator: user?.id }],
    enabled: isConnected && !!user?.id,
    staleTime: 60 * 1000,
  });

  const createdRaffles = (createdRafflesResponse as any)?.data || [];

  // Profile photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await apiRequest('POST', '/api/users/me/photo', formData, {
        'Content-Type': undefined, // Let browser set content type for FormData
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: "Profil fotoğrafınız güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Fotoğraf yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  if (!isConnected || !user) {
    return (
      <div className="min-h-screen bg-duxxan-page flex items-center justify-center transition-colors duration-200">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-duxxan-yellow" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cüzdanınızı Bağlayın</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Profilinizi görüntülemek için lütfen cüzdanınızı bağlayın.
            </p>
            <WalletStatus />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateUser(formData);
      setIsEditing(false);
      toast({
        title: "Başarılı",
        description: "Profiliniz güncellendi",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      name: user?.name || '',
      profession: user?.profession || '',
      bio: user?.bio || '',
      website: user?.website || '',
      city: user?.city || '',
    });
    setIsEditing(false);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Hata",
          description: "Dosya boyutu 5MB'dan küçük olmalıdır",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Hata",
          description: "Sadece resim dosyaları yüklenebilir",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      uploadPhotoMutation.mutate(file);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
      toast({
        title: "Kopyalandı",
        description: "Cüzdan adresi panoya kopyalandı",
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />);
    }
    
    return stars;
  };

  const getProfileStats = () => {
    const activeParticipations = participations.filter((p: any) => p.raffle?.isActive);
    const pastParticipations = participations.filter((p: any) => !p.raffle?.isActive);
    const wonRaffles = participations.filter((p: any) => p.raffle?.winnerId === user.id);
    const totalSpent = participations.reduce((sum: number, p: any) => 
      sum + parseFloat(p.totalAmount || '0'), 0
    );

    return {
      activeParticipations: activeParticipations.length,
      pastParticipations: pastParticipations.length,
      wonRaffles: wonRaffles.length,
      createdRaffles: createdRaffles.length,
      totalSpent,
    };
  };

  const stats = getProfileStats();

  return (
    <div className="min-h-screen bg-duxxan-page py-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <WalletStatus />
        </div>

        {/* Profile Header Card */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Photo */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-duxxan-yellow">
                  <AvatarImage 
                    src={user.profilePhoto || user.profileImage} 
                    alt={user.name || user.username} 
                  />
                  <AvatarFallback className="text-2xl font-bold bg-duxxan-yellow text-white">
                    {(user.name || user.username)?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-2 border-white dark:border-gray-800 bg-duxxan-yellow hover:bg-yellow-600 text-white"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {user.name || user.username}
                    </h1>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-duxxan-yellow text-white">
                        @{user.username}
                      </Badge>
                      {user.isVerified && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Award className="h-3 w-3 mr-1" />
                          Doğrulanmış
                        </Badge>
                      )}
                    </div>
                    {user.profession && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{user.profession}</p>
                    )}
                    {user.city && (
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{user.city}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="mt-4 md:mt-0"
                  >
                    {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                    {isEditing ? 'İptal' : 'Düzenle'}
                  </Button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {renderStars(parseFloat(user.rating || '0'))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user.rating} ({user.ratingCount || 0} değerlendirme)
                  </span>
                </div>

                {/* Wallet Address */}
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="h-4 w-4 text-gray-500" />
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0"
                  >
                    {copiedAddress ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{user.bio}</p>
                )}

                {/* Website */}
                {user.website && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-duxxan-yellow hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.activeParticipations}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Aktif Katılım</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-gray-500" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.pastParticipations}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Geçmiş Katılım</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.wonRaffles}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Kazanılan</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <Gift className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.createdRaffles}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Oluşturulan</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                ${stats.totalSpent.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Toplam Harcama</div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Profili Düzenle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Kullanıcı Adı
                  </label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Kullanıcı adınız"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Ad Soyad
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Adınız ve soyadınız"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Meslek
                  </label>
                  <Input
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="Mesleğiniz"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Şehir
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Yaşadığınız şehir"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Website
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://website.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Hakkında
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                  rows={4}
                  className="input-field"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} className="bg-duxxan-yellow hover:bg-yellow-600 text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Aktif Çekilişler</TabsTrigger>
            <TabsTrigger value="past">Geçmiş Katılımlar</TabsTrigger>
            <TabsTrigger value="created">Oluşturulanlar</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Aktif Çekiliş Katılımları</CardTitle>
              </CardHeader>
              <CardContent>
                {participationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participations
                      .filter((p: any) => p.raffle?.isActive)
                      .map((participation: any) => (
                        <div
                          key={participation.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {participation.raffle?.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {participation.ticketCount} bilet • ${participation.totalAmount}
                            </p>
                          </div>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Aktif
                          </Badge>
                        </div>
                      ))}
                    {participations.filter((p: any) => p.raffle?.isActive).length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Henüz aktif çekiliş katılımınız bulunmamaktadır.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Geçmiş Çekiliş Katılımları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {participations
                    .filter((p: any) => !p.raffle?.isActive)
                    .map((participation: any) => (
                      <div
                        key={participation.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {participation.raffle?.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {participation.ticketCount} bilet • ${participation.totalAmount}
                          </p>
                        </div>
                        <Badge 
                          variant={participation.raffle?.winnerId === user.id ? "default" : "secondary"}
                          className={participation.raffle?.winnerId === user.id ? "bg-yellow-100 text-yellow-800" : ""}
                        >
                          {participation.raffle?.winnerId === user.id ? "Kazandınız!" : "Bitti"}
                        </Badge>
                      </div>
                    ))}
                  {participations.filter((p: any) => !p.raffle?.isActive).length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Henüz geçmiş çekiliş katılımınız bulunmamaktadır.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="created">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Oluşturduğunuz Çekilişler</CardTitle>
              </CardHeader>
              <CardContent>
                {createdRafflesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {createdRaffles.map((raffle: any) => (
                      <div
                        key={raffle.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {raffle.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ${raffle.prizeValue} ödül • {raffle.ticketsSold}/{raffle.maxTickets} bilet
                          </p>
                        </div>
                        <Badge 
                          variant={raffle.isActive ? "default" : "secondary"}
                          className={raffle.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                          {raffle.isActive ? "Aktif" : "Bitti"}
                        </Badge>
                      </div>
                    ))}
                    {createdRaffles.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Henüz hiç çekiliş oluşturmadınız.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}