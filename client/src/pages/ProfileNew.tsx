import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/ThemeProvider';
import { 
  User, Camera, Upload, X, Save, Edit, Eye, EyeOff, 
  Globe, Phone, Mail, MapPin, Calendar, Briefcase,
  Monitor, Smartphone, Tablet, Trash2, Shield, Award, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileFormData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  address?: string;
  website?: string;
  profession?: string;
  bio?: string;
  organizationType?: string;
  organizationName?: string;
  country?: string;
}

interface DeviceInfo {
  id: number;
  deviceType: string;
  deviceName?: string;
  browser?: string;
  operatingSystem?: string;
  location?: string;
  lastLoginAt: string;
  createdAt: string;
}

interface UserPhoto {
  id: number;
  photoData: string;
  photoType: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt: string;
}

export default function ProfileNew() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users/me'],
  });

  // Fetch user devices
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['/api/users/me/devices'],
  });

  // Fetch user photos
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['/api/users/me/photos'],
  });

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        city: user.city || '',
        address: user.address || '',
        website: user.website || '',
        profession: user.profession || '',
        bio: user.bio || '',
        organizationType: user.organizationType || 'individual',
        organizationName: user.organizationName || '',
        country: user.country || '',
      });
    }
  }, [user]);

  // Log device information on component mount
  useEffect(() => {
    const logDevice = async () => {
      // Only log device if user is loaded and authenticated
      if (!user || userLoading) return;
      
      try {
        const deviceInfo = {
          deviceType: /Mobile|Android|iPhone/.test(navigator.userAgent) ? 'mobile' : 
                     /Tablet|iPad/.test(navigator.userAgent) ? 'tablet' : 'desktop',
          deviceName: navigator.platform,
          browser: navigator.userAgent.split(' ').find(item => item.includes('Chrome') || item.includes('Firefox') || item.includes('Safari')) || 'Unknown',
          operatingSystem: navigator.platform,
        };

        await apiRequest('POST', '/api/users/me/devices', deviceInfo);
      } catch (error) {
        // Silently handle device logging errors to prevent UI disruption
        console.error('Failed to log device:', error);
      }
    };

    logDevice();
  }, [user, userLoading]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest('PATCH', '/api/users/me', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      setIsEditing(false);
      toast({
        title: "Profil Güncellendi",
        description: "Profiliniz başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (photoData: any) => {
      const response = await apiRequest('POST', '/api/users/me/photos', photoData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/photos'] });
      toast({
        title: "Fotoğraf Yüklendi",
        description: "Fotoğrafınız başarıyla yüklendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Fotoğraf yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      await apiRequest('DELETE', `/api/users/me/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/photos'] });
      toast({
        title: "Fotoğraf Silindi",
        description: "Fotoğraf başarıyla silindi.",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/jpeg')) {
      toast({
        title: "Hata",
        description: "Sadece JPEG formatında fotoğraflar yükleyebilirsiniz.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Hata",
        description: "Fotoğraf boyutu 5MB'dan küçük olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      
      const photoData = {
        photoData: base64Data,
        photoType: 'profile',
        fileName: file.name,
        fileSize: file.size,
      };

      uploadPhotoMutation.mutate(photoData);
      setUploadingPhoto(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // If user is not authenticated, show message
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Cüzdan Bağlantısı Gerekli
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Profil sayfasını görüntülemek için cüzdanınızı bağlayın.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="relative">
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="h-32 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 dark:from-yellow-600 dark:via-yellow-700 dark:to-orange-600 rounded-t-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
              <div className="absolute top-4 right-4">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <CardContent className="pt-0 pb-8">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
                {/* Profile Photo */}
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-700 shadow-xl">
                    <AvatarImage 
                      src={photos.find(p => p.photoType === 'profile')?.photoData || user?.profileImage} 
                      alt={user?.name || user?.username}
                    />
                    <AvatarFallback className="bg-yellow-500 text-white text-2xl font-bold">
                      {(user?.name || user?.username)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing && (
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg"
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {user?.name || user?.username}
                    </h1>
                    {user?.isVerified && (
                      <Badge className="bg-blue-500 text-white">
                        <Shield className="h-3 w-3 mr-1" />
                        Doğrulanmış
                      </Badge>
                    )}
                    {user?.organizationType !== 'individual' && (
                      <Badge className="bg-purple-500 text-white">
                        {user?.organizationType === 'foundation' ? 'Vakıf' : 
                         user?.organizationType === 'association' ? 'Dernek' : 'Resmi'}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-2">@{user?.username}</p>
                  
                  {user?.profession && (
                    <p className="text-gray-700 dark:text-gray-200 mb-2 flex items-center justify-center md:justify-start gap-2">
                      <Briefcase className="h-4 w-4" />
                      {user.profession}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {user?.rating}/5.0 ({user?.ratingCount || 0} değerlendirme)
                    </div>
                    {user?.country && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {user.country}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="mt-6">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <TabsTrigger value="profile" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
                Profil Bilgileri
              </TabsTrigger>
              <TabsTrigger value="photos" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
                Fotoğraflar
              </TabsTrigger>
              <TabsTrigger value="devices" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
                Cihazlar & Güvenlik
              </TabsTrigger>
            </TabsList>

            {/* Profile Information Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <User className="h-5 w-5" />
                      Kişisel Bilgiler
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPersonalInfo(!showPersonalInfo)}
                        className="ml-auto"
                      >
                        {showPersonalInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Ad Soyad</Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-gray-700 dark:text-gray-300">{user?.name || 'Belirtilmemiş'}</p>
                        )}
                      </div>

                      {showPersonalInfo && (
                        <>
                          <div>
                            <Label htmlFor="email">E-posta</Label>
                            {isEditing ? (
                              <Input
                                id="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="mt-1"
                              />
                            ) : (
                              <p className="mt-1 text-gray-700 dark:text-gray-300">{user?.email || 'Belirtilmemiş'}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="phone">Telefon</Label>
                            {isEditing ? (
                              <Input
                                id="phone"
                                value={formData.phoneNumber || ''}
                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                className="mt-1"
                              />
                            ) : (
                              <p className="mt-1 text-gray-700 dark:text-gray-300">{user?.phoneNumber || 'Belirtilmemiş'}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="birthDate">Doğum Tarihi</Label>
                            {isEditing ? (
                              <Input
                                id="birthDate"
                                type="date"
                                value={formData.dateOfBirth || ''}
                                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                                className="mt-1"
                              />
                            ) : (
                              <p className="mt-1 text-gray-700 dark:text-gray-300">
                                {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="gender">Cinsiyet</Label>
                            {isEditing ? (
                              <Select value={formData.gender || ''} onValueChange={(value) => setFormData({...formData, gender: value})}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Cinsiyet seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Erkek</SelectItem>
                                  <SelectItem value="female">Kadın</SelectItem>
                                  <SelectItem value="other">Diğer</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="mt-1 text-gray-700 dark:text-gray-300">
                                {user?.gender === 'male' ? 'Erkek' : user?.gender === 'female' ? 'Kadın' : user?.gender === 'other' ? 'Diğer' : 'Belirtilmemiş'}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Contact */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <MapPin className="h-5 w-5" />
                      Konum & İletişim
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="city">Şehir</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          value={formData.city || ''}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{user?.city || 'Belirtilmemiş'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address">Adres</Label>
                      {isEditing ? (
                        <Textarea
                          id="address"
                          value={formData.address || ''}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="mt-1"
                          rows={3}
                        />
                      ) : (
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{user?.address || 'Belirtilmemiş'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      {isEditing ? (
                        <Input
                          id="website"
                          type="url"
                          value={formData.website || ''}
                          onChange={(e) => setFormData({...formData, website: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1">
                          {user?.website ? (
                            <a 
                              href={user.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-yellow-600 dark:text-yellow-400 hover:underline flex items-center gap-1"
                            >
                              <Globe className="h-4 w-4" />
                              {user.website}
                            </a>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300">Belirtilmemiş</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Info */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Briefcase className="h-5 w-5" />
                      Profesyonel Bilgiler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="profession">Meslek</Label>
                      {isEditing ? (
                        <Input
                          id="profession"
                          value={formData.profession || ''}
                          onChange={(e) => setFormData({...formData, profession: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{user?.profession || 'Belirtilmemiş'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="bio">Hakkımda</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={formData.bio || ''}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          className="mt-1"
                          rows={4}
                          placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                        />
                      ) : (
                        <p className="mt-1 text-gray-700 dark:text-gray-300">{user?.bio || 'Belirtilmemiş'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="orgType">Organizasyon Türü</Label>
                      {isEditing ? (
                        <Select value={formData.organizationType || ''} onValueChange={(value) => setFormData({...formData, organizationType: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Bireysel</SelectItem>
                            <SelectItem value="foundation">Vakıf</SelectItem>
                            <SelectItem value="association">Dernek</SelectItem>
                            <SelectItem value="official">Resmi Kurum</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-gray-700 dark:text-gray-300">
                          {user?.organizationType === 'individual' ? 'Bireysel' :
                           user?.organizationType === 'foundation' ? 'Vakıf' :
                           user?.organizationType === 'association' ? 'Dernek' :
                           user?.organizationType === 'official' ? 'Resmi Kurum' : 'Belirtilmemiş'}
                        </p>
                      )}
                    </div>

                    {formData.organizationType !== 'individual' && (
                      <div>
                        <Label htmlFor="orgName">Organizasyon Adı</Label>
                        {isEditing ? (
                          <Input
                            id="orgName"
                            value={formData.organizationName || ''}
                            onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-gray-700 dark:text-gray-300">{user?.organizationName || 'Belirtilmemiş'}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Sharing Options */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Share2 className="h-5 w-5" />
                      Çekiliş Paylaşım
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        DUXXAN DEX Platform
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Bu platform sadece çekiliş linklerinin paylaşımını destekler. 
                        Çekilişlerinizi oluşturup arkadaşlarınızla paylaşabilirsiniz.
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Profil Linki
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {window.location.origin}/profile/{user?.username}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/profile/${user?.username}`);
                          toast({
                            title: "Kopyalandı",
                            description: "Profil linki panoya kopyalandı.",
                          });
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        Kopyala
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Camera className="h-5 w-5" />
                    Fotoğraflar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo: UserPhoto) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.photoData}
                          alt={photo.fileName || 'User photo'}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePhotoMutation.mutate(photo.id)}
                            disabled={deletePhotoMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                          {photo.photoType}
                        </div>
                      </div>
                    ))}
                    
                    {/* Upload Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Fotoğraf Ekle</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Devices & Security Tab */}
            <TabsContent value="devices" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Security Settings */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Shield className="h-5 w-5" />
                      Güvenlik Ayarları
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Kişisel Bilgileri Göster</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          E-posta, telefon ve doğum tarihi bilgilerini göster
                        </p>
                      </div>
                      <Button
                        variant={showPersonalInfo ? "default" : "outline"}
                        onClick={() => setShowPersonalInfo(!showPersonalInfo)}
                        size="sm"
                      >
                        {showPersonalInfo ? "Gizle" : "Göster"}
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1">Cüzdan Adresi</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                          {user?.walletAddress}
                        </p>
                      </div>
                      <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1">Hesap Durumu</h5>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600 dark:text-green-400">Aktif</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Device Management */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Monitor className="h-5 w-5" />
                      Giriş Yapılan Cihazlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {devicesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full" />
                      </div>
                    ) : devices.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {devices.map((device: DeviceInfo) => (
                          <div key={device.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded">
                                {getDeviceIcon(device.deviceType)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                  {device.deviceName || device.deviceType}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {device.browser} • {device.operatingSystem}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Son giriş</p>
                              <p className="text-xs font-medium text-gray-900 dark:text-white">
                                {formatDate(device.lastLoginAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <Monitor className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Henüz kayıtlı cihaz bulunmuyor.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}