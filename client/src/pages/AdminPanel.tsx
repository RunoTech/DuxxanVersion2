import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Plus, Settings, BarChart3, Users, Heart } from 'lucide-react';

export default function AdminPanel() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-duxxan-yellow mb-2">
          Admin Panel
        </h1>
        <p className="text-muted-foreground">
          Platform yönetim paneli
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manuel Çekiliş Oluştur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-duxxan-yellow" />
              Manuel Çekiliş
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Platform kontrolünde manuel çekiliş oluşturun
            </p>
            <Link href="/admin/create-raffle">
              <Button className="w-full bg-duxxan-yellow text-duxxan-dark hover:bg-duxxan-yellow/90">
                Çekiliş Oluştur
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Manuel Bağış Oluştur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-500" />
              Manuel Bağış
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Platform kontrolünde manuel bağış kampanyası oluşturun
            </p>
            <Link href="/admin/create-donation">
              <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                Bağış Oluştur
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* İstatistikler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              İstatistikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Platform performans ve kullanım verileri
            </p>
            <Button variant="outline" className="w-full" disabled>
              Yakında...
            </Button>
          </CardContent>
        </Card>

        {/* Kullanıcı Yönetimi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Kullanıcılar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Kullanıcı hesapları ve yetkilendirme
            </p>
            <Button variant="outline" className="w-full" disabled>
              Yakında...
            </Button>
          </CardContent>
        </Card>

        {/* Platform Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              Ayarlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Platform yapılandırması ve güvenlik
            </p>
            <Button variant="outline" className="w-full" disabled>
              Yakında...
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
          🔒 Gizli Admin Panel
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300">
          Bu panel gizlidir ve sadece URL ile erişilebilir. Manuel çekilişler kullanıcılara 
          tamamen gerçek görünür. Navigasyonda link bulunmaz.
        </p>
      </div>
    </div>
  );
}