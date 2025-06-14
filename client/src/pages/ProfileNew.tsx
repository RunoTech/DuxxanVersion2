import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Shield,
  Star,
  MapPin,
  Upload,
  Trash2,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Calendar,
  Clock,
  AlertTriangle
} from 'lucide-react';


interface ProfileFormData {
  name?: string;
  email?: string;
  gender?: string;
  city?: string;
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState<ProfileFormData>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/users/me'],
  });

  // Show demo profile if no user data for testing
  const displayUser = user || {
    id: 1,
    username: 'demo_user',
    name: 'Demo Kullanıcı',
    email: 'demo@example.com',
    walletAddress: '0x1234567890123456789012345678901234567890',
    organizationType: 'individual' as const,
    country: 'Turkey',
    rating: '4.5',
    ratingCount: 12,
    profession: 'Geliştirici',
    city: 'İstanbul',
    bio: 'Blockchain teknolojileri ve kripto para alanında uzman geliştirici.',
    isVerified: false,
    organizationVerified: false,
    profileImage: undefined,
    gender: undefined,
    organizationName: undefined
  } as any;

  // Fetch user devices with demo data
  const { data: rawDevices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['/api/users/me/devices'],
    enabled: !!user,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const devices = user ? (rawDevices as any[]) : [
    {
      id: 1,
      deviceType: 'desktop',
      deviceName: 'Chrome Tarayıcı',
      browser: 'Chrome 120.0',
      operatingSystem: 'Windows 11',
      location: 'İstanbul, Türkiye',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      deviceType: 'mobile',
      deviceName: 'iPhone 15',
      browser: 'Safari Mobile',
      operatingSystem: 'iOS 17.2',
      location: 'İstanbul, Türkiye',
      lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Fetch user photos with demo data
  const { data: rawPhotos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['/api/users/me/photos'],
    enabled: !!user,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const photos = user ? (rawPhotos as any[]) : [];

  // Initialize form data when user data loads
  useEffect(() => {
    if (displayUser && !formData.name && !formData.email) {
      setFormData({
        name: displayUser.name || '',
        email: displayUser.email || '',
        gender: displayUser.gender || '',
        city: displayUser.city || '',
        profession: displayUser.profession || '',
        bio: displayUser.bio || '',
        organizationType: displayUser.organizationType || 'individual',
        organizationName: displayUser.organizationName || '',
        country: displayUser.country || '',
      });
    }
  }, [displayUser]);

  // Log device information on component mount
  useEffect(() => {
    const logDevice = async () => {
      if (!user) return; // Skip for demo mode
      
      try {
        const deviceInfo = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          screenResolution: `${screen.width}x${screen.height}`,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timestamp: new Date().toISOString()
        };

        await apiRequest('POST', '/api/users/me/devices', deviceInfo);
      } catch (error) {
        console.error('Failed to log device info:', error);
      }
    };

    logDevice();
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!user) {
        toast({
          title: "Demo Modu",
          description: "Demo modunda profil güncellenemez.",
          variant: "destructive",
        });
        return;
      }
      
      const response = await apiRequest('PATCH', '/api/users/me', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      setIsEditing(false);
      toast({
        title: "Profil Güncellendi",
        description: "Profil bilgileriniz başarıyla güncellendi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Güncelleme Hatası",
        description: error.message || "Profil güncellenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (photoData: string) => {
      if (!user) {
        toast({
          title: "Demo Modu",
          description: "Demo modunda fotoğraf yüklenemez.",
          variant: "destructive",
        });
        return;
      }
      
      const response = await apiRequest('POST', '/api/users/me/photos', {
        photoData,
        photoType: 'profile'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/photos'] });
      toast({
        title: "Fotoğraf Yüklendi",
        description: "Profil fotoğrafınız başarıyla güncellendi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Yükleme Hatası",
        description: error.message || "Fotoğraf yüklenirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      if (!user) {
        toast({
          title: "Demo Modu",
          description: "Demo modunda fotoğraf silinemez.",
          variant: "destructive",
        });
        return;
      }
      
      await apiRequest('DELETE', `/api/users/me/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/photos'] });
      toast({
        title: "Fotoğraf Silindi",
        description: "Fotoğraf başarıyla silindi.",
      });
    },
    onError: (error) => {
      toast({
        title: "Silme Hatası",
        description: error.message || "Fotoğraf silinirken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: displayUser?.name || '',
      email: displayUser?.email || '',
      phoneNumber: displayUser?.phoneNumber || '',
      dateOfBirth: displayUser?.dateOfBirth || '',
      gender: displayUser?.gender || '',
      city: displayUser?.city || '',
      address: displayUser?.address || '',
      website: displayUser?.website || '',
      profession: displayUser?.profession || '',
      bio: displayUser?.bio || '',
      organizationType: displayUser?.organizationType || 'individual',
      organizationName: displayUser?.organizationName || '',
      country: displayUser?.country || '',
    });
    setIsEditing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/jpeg')) {
      toast({
        title: "Geçersiz Dosya Türü",
        description: "Sadece JPEG formatında resim yükleyebilirsiniz.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Dosya Çok Büyük",
        description: "Maksimum 5MB boyutunda resim yükleyebilirsiniz.",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        uploadPhotoMutation.mutate(result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Yükleme Hatası",
        description: "Dosya yüklenirken hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-yellow-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="relative">
          <Card className="mb-8 overflow-hidden border-2 border-yellow-200 dark:border-yellow-800 shadow-xl">
            <div className="relative h-48 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800">
              <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />
              <div className="absolute top-4 right-4">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Düzenle
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      disabled={updateProfileMutation.isPending}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      {updateProfileMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      size="sm"
                      variant="outline"
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
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
                      src={photos.find((p: any) => p.photoType === 'profile')?.photoData || displayUser?.profileImage} 
                      alt={displayUser?.name || displayUser?.username}
                    />
                    <AvatarFallback className="bg-yellow-500 text-white text-2xl font-bold">
                      {(displayUser?.name || displayUser?.username)?.charAt(0).toUpperCase()}
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
                <div className="flex-1 text-center md:text-left bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {displayUser?.name || displayUser?.username}
                    </h1>
                    {displayUser?.isVerified && (
                      <Badge className="bg-blue-500 text-white">
                        <Shield className="h-3 w-3 mr-1" />
                        Doğrulanmış
                      </Badge>
                    )}
                    {displayUser?.organizationType === 'foundation' && (
                      <Badge className="bg-green-500 text-white">Vakıf</Badge>
                    )}
                    {displayUser?.organizationType === 'association' && (
                      <Badge className="bg-purple-500 text-white">Dernek</Badge>
                    )}
                  </div>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">
                    @{displayUser?.username}
                  </p>
                  {displayUser?.profession && (
                    <p className="text-gray-500 dark:text-gray-400 mb-3">
                      {displayUser?.profession}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span>{displayUser?.rating} ({displayUser?.ratingCount} değerlendirme)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{displayUser?.country}</span>
                    </div>
                    {displayUser?.country && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                        {displayUser.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border-2 border-yellow-200 dark:border-yellow-800">
            <TabsTrigger value="profile" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <User className="h-4 w-4 mr-2" />
              Profil Bilgileri
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <Camera className="h-4 w-4 mr-2" />
              Fotoğraflar
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              <Shield className="h-4 w-4 mr-2" />
              Cihazlar & Güvenlik
            </TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-400">Kişisel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ad Soyad"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.name || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="E-posta adresi"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.email || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                  
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Cinsiyet</Label>
                    {isEditing ? (
                      <Select value={formData.gender || ''} onValueChange={(value) => setFormData({...formData, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Cinsiyet seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Erkek</SelectItem>
                          <SelectItem value="female">Kadın</SelectItem>
                          <SelectItem value="other">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.gender === 'male' ? 'Erkek' : 
                         displayUser?.gender === 'female' ? 'Kadın' : 
                         displayUser?.gender === 'other' ? 'Diğer' : 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-400">Konum Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Şehir</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Şehir"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.city || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                  

                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-400">Profesyonel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profession">Meslek</Label>
                    {isEditing ? (
                      <Input
                        id="profession"
                        value={formData.profession || ''}
                        onChange={(e) => setFormData({...formData, profession: e.target.value})}
                        placeholder="Mesleğiniz"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.profession || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biyografi</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio || ''}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Kendinizi tanıtın..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.bio || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Organization Information */}
              <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-400">Organizasyon Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationType">Organizasyon Türü</Label>
                    {isEditing ? (
                      <Select value={formData.organizationType || 'individual'} onValueChange={(value) => setFormData({...formData, organizationType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Organizasyon türü seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Bireysel</SelectItem>
                          <SelectItem value="foundation">Vakıf</SelectItem>
                          <SelectItem value="association">Dernek</SelectItem>
                          <SelectItem value="company">Şirket</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.organizationType === 'individual' ? 'Bireysel' :
                         displayUser?.organizationType === 'foundation' ? 'Vakıf' :
                         displayUser?.organizationType === 'association' ? 'Dernek' :
                         displayUser?.organizationType === 'company' ? 'Şirket' : 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organizasyon Adı</Label>
                    {isEditing ? (
                      <Input
                        id="organizationName"
                        value={formData.organizationName || ''}
                        onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                        placeholder="Organizasyon adı"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {displayUser?.organizationName || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <Card className="border-2 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Fotoğraflarım
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sadece JPEG formatında fotoğraf yükleyebilirsiniz. Maksimum dosya boyutu 5MB.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    disabled={!user || uploadingPhoto}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingPhoto ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                  </Button>
                  {!user && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Demo modunda fotoğraf yüklenemez
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo: any) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={photo.photoData}
                          alt={`Fotoğraf ${photo.id}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        onClick={() => deletePhotoMutation.mutate(photo.id)}
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={deletePhotoMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {photos.length === 0 && (
                  <div className="text-center py-12">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Henüz fotoğraf yüklenmemiş
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security & Devices Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wallet Information */}
              <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Cüzdan Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cüzdan Adresi</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex-1 break-all">
                        {displayUser?.walletAddress}
                      </code>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Shield className="h-4 w-4" />
                    <span>Cüzdan bağlantısı güvenli</span>
                  </div>
                </CardContent>
              </Card>

              {/* Login Devices */}
              <Card className="border-2 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Giriş Yapılan Cihazlar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {devices.map((device: any) => (
                    <div key={device.id} className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getDeviceIcon(device.deviceType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">
                            {device.deviceName || device.deviceType}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {device.deviceType}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span>{device.browser}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" />
                            <span>{device.operatingSystem}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{device.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Son giriş: {formatDate(device.lastLoginAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {devices.length === 0 && (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Cihaz bilgisi bulunamadı
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}