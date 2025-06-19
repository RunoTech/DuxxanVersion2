import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Edit3, Save, X, Camera, Upload, Trash2, Star, MapPin, 
  User, Shield, Monitor, Calendar, Globe, Clock, AlertTriangle 
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/users/me'],
    enabled: !!user,
  });

  // Fetch user photos
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['/api/users/me/photos'],
    enabled: !!user,
  });

  // Fetch user devices
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['/api/users/me/devices'],
    enabled: !!user,
  });

  // Demo user data for when not authenticated
  const demoUser = {
    id: 0,
    username: 'demo_user',
    name: 'Demo Kullanıcısı',
    email: 'demo@example.com',
    profession: 'Geliştirici',
    city: 'İstanbul',
    country: 'Turkey',
    rating: 4.5,
    ratingCount: 12,
    walletAddress: '0x1234567890123456789012345678901234567890',
    profileImage: null,
    bio: 'Blockchain teknolojileri ve kripto para alanında uzman geliştirici.',
    organizationType: 'individual',
    organizationName: null,
    gender: null
  };

  const displayUser = user && profile ? profile : demoUser;

  return (
    <div className="min-h-screen bg-gray-800 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        {/* Golden Header Section */}
        <div className="relative bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 p-8 mb-0">
          {/* Edit Button */}
          <div className="absolute top-4 right-4">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-black bg-opacity-20 hover:bg-opacity-30 text-white border border-white border-opacity-30 rounded-lg px-4 py-2 text-sm"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>

          {/* Profile Content */}
          <div className="flex items-center gap-6 mt-12">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-3xl font-bold text-gray-800">
                {(displayUser?.name || displayUser?.username || 'D')?.charAt(0)?.toUpperCase()}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold mb-1">
                @{displayUser?.username || 'demo_user'}
              </h1>
              <p className="text-lg opacity-90 mb-3">
                {displayUser?.profession || 'Geliştirici'}
              </p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-current text-yellow-300" />
                  <span className="font-medium">{displayUser?.rating || '4.5'}</span>
                  <span className="text-sm opacity-75">({displayUser?.ratingCount || 12} değerlendirme)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Turkey</span>
                  <Badge className="bg-yellow-400 text-gray-800 text-xs px-2 py-1 rounded">
                    Turkey
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dark Content Section with Tabs */}
        <div className="bg-gray-900 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 rounded-lg p-1 mb-8">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900 text-gray-400 font-medium rounded-md"
              >
                <User className="h-4 w-4 mr-2" />
                Profil Bilgileri
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900 text-gray-400 font-medium rounded-md"
              >
                <Shield className="h-4 w-4 mr-2" />
                Cihazlar & Güvenlik
              </TabsTrigger>
            </TabsList>

            {/* Profile Info Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kişisel Bilgiler Card */}
                <Card className="bg-gray-800 border border-gray-700 rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-yellow-400 text-lg font-bold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Kişisel Bilgiler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-yellow-400 text-sm font-medium mb-1">Ad Soyad</h4>
                      <p className="text-white">{displayUser?.name || 'Demo Kullanıcısı'}</p>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 text-sm font-medium mb-1">E-posta</h4>
                      <p className="text-white flex items-center gap-2">
                        <span>📧</span>
                        {displayUser?.email || 'demo@example.com'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 text-sm font-medium mb-1">Cinsiyet</h4>
                      <p className="text-white">Belirtilmemiş</p>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 text-sm font-medium mb-1">İkametgah</h4>
                      <p className="text-white">Belirtilmemiş</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Konum Bilgileri Card */}
                <Card className="bg-gray-800 border border-gray-700 rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-yellow-400 text-lg font-bold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Konum Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-yellow-400 text-sm font-medium mb-1">Şehir</h4>
                      <p className="text-white">İstanbul</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Profesyonel Bilgiler Card */}
                <Card className="bg-gray-800 border border-gray-700 rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-yellow-400 text-lg font-bold flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Profesyonel Bilgiler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-yellow-400 text-sm font-medium mb-1">Meslek</h4>
                      <p className="text-white">Geliştirici</p>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 text-sm font-medium mb-1">Biyografi</h4>
                      <p className="text-white">Blockchain teknolojileri ve kripto para alanında uzman geliştirici.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Organizasyon Bilgileri Card */}
                <Card className="bg-gray-800 border border-gray-700 rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-yellow-400 text-lg font-bold flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Organizasyon Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-yellow-400 text-sm font-medium mb-1">Organizasyon Türü</h4>
                      <p className="text-white">Bireysel</p>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 text-sm font-medium mb-1">Organizasyon Adı</h4>
                      <p className="text-white">Belirtilmemiş</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security & Devices Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cüzdan Bilgileri Card */}
                <Card className="bg-gray-800 border border-gray-700 rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-yellow-400 text-lg font-bold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Cüzdan Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-yellow-400 text-sm font-medium mb-2">Cüzdan Adresi</h4>
                      <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                        <code className="text-white text-sm font-mono">
                          0x1234567898123456789012345678901234567890
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Cüzdan bağlantısı güvenli</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Giriş Yapılan Cihazlar Card */}
                <Card className="bg-gray-800 border border-gray-700 rounded-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-yellow-400 text-lg font-bold flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Giriş Yapılan Cihazlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Desktop Device */}
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-600 p-2 rounded">
                          <span className="text-xs text-white bg-gray-500 px-2 py-1 rounded">desktop</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-white font-medium">Chrome Tarayıcı</h5>
                          <p className="text-gray-400 text-sm">Chrome 130.0</p>
                          <p className="text-gray-400 text-sm">Windows 11</p>
                          <p className="text-gray-400 text-xs flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            İstanbul, Türkiye
                          </p>
                          <p className="text-gray-500 text-xs">Son giriş: 17 Haziran 2025 16:46</p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Device */}
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-600 p-2 rounded">
                          <span className="text-xs text-white bg-gray-500 px-2 py-1 rounded">mobile</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-white font-medium">iPhone 15</h5>
                          <p className="text-gray-400 text-sm">Safari Mobile</p>
                          <p className="text-gray-400 text-sm">iOS 17.4</p>
                          <p className="text-gray-400 text-xs flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            İstanbul, Türkiye
                          </p>
                          <p className="text-gray-500 text-xs">Son giriş: 17 Haziran 2025 14:43</p>
                        </div>
                      </div>
                    </div>
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