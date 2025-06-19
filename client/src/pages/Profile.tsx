import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Edit3, 
  Save, 
  X, 
  User, 
  MapPin, 
  Star,
  Camera,
  ExternalLink
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  profession?: string;
  city?: string;
  bio?: string;
  profileImage?: string;
  createdAt: string;
}

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    profession: '',
    city: '',
    bio: ''
  });

  // Fetch user data
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/me']
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        profession: user.profession || '',
        city: user.city || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return apiRequest('/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsEditing(false);
      toast({
        title: "Profil güncellendi",
        description: "Profil bilgileriniz başarıyla güncellendi."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Profil güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  });

  // Photo upload mutation
  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await fetch('/api/users/upload-photo', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Fotoğraf yüklenirken hata oluştu');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Fotoğraf güncellendi",
        description: "Profil fotoğrafınız başarıyla güncellendi."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Fotoğraf yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  });

  const handleUpdateProfile = () => {
    updateMutation.mutate(formData);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Dosya çok büyük",
          description: "Fotoğraf boyutu 5MB'dan küçük olmalıdır.",
          variant: "destructive"
        });
        return;
      }
      photoMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Profil yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Kullanıcı bulunamadı</div>
      </div>
    );
  }

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
                {(user?.name || user?.username || 'D')?.charAt(0)?.toUpperCase()}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold mb-1">
                @{user?.username || 'demo_user'}
              </h1>
              <p className="text-lg opacity-90 mb-3">
                {user?.profession || 'Geliştirici'}
              </p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-current text-yellow-300" />
                  <span className="font-medium">4.5</span>
                  <span className="text-sm opacity-75">(12 değerlendirme)</span>
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

        {/* Dark Content Section */}
        <div className="bg-gray-900 p-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8">
            <Button 
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium px-6 py-2 rounded-lg"
            >
              <User className="h-4 w-4 mr-2" />
              Profil Bilgileri
            </Button>
            <Button 
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-800 font-medium px-6 py-2 rounded-lg"
            >
              <Camera className="h-4 w-4 mr-2" />
              Fotoğraflar
            </Button>
            <Button 
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-800 font-medium px-6 py-2 rounded-lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Cihazlar & Güvenlik
            </Button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kişisel Bilgiler Card */}
            <Card className="bg-gray-800 border border-gray-700 rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-yellow-400 text-lg font-bold">
                  Kişisel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">Ad Soyad</h4>
                  <p className="text-white">{user?.name || 'Demo Kullanıcısı'}</p>
                </div>
                <div>
                  <h4 className="text-yellow-400 text-sm font-medium mb-1">E-posta</h4>
                  <p className="text-white">{user?.email || 'demo@example.com'}</p>
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
                <CardTitle className="text-yellow-400 text-lg font-bold">
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
                <CardTitle className="text-yellow-400 text-lg font-bold">
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
                <CardTitle className="text-yellow-400 text-lg font-bold">
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
        </div>
        
        {/* Edit Form Modal */}
        {isEditing && (
          <Card className="bg-gray-800 border border-gray-700 mt-6 mx-6 rounded-xl">
            <CardHeader className="bg-yellow-500 text-gray-900 rounded-t-xl">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Edit3 className="h-5 w-5" />
                Profili Düzenle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-yellow-400 text-sm font-medium mb-2 block">
                    Kullanıcı Adı
                  </label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-yellow-400 text-sm font-medium mb-2 block">
                    Ad Soyad
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-yellow-400 text-sm font-medium mb-2 block">
                    Meslek
                  </label>
                  <Input
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-yellow-400 text-sm font-medium mb-2 block">
                    Şehir
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-yellow-400 text-sm font-medium mb-2 block">
                  Biyografi
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updateMutation.isPending}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}