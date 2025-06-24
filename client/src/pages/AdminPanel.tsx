import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Plus, Settings, BarChart3, Users } from 'lucide-react';

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

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          ⚠️ Admin Panel Erişimi
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Bu panel sadece platform yöneticileri için tasarlanmıştır. Manuel çekilişler 
          gerçek görünecek ancak blockchain entegrasyonu olmayacaktır.
        </p>
      </div>
    </div>
  );
}