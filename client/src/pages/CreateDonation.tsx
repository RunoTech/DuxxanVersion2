import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { blockchainService } from '@/lib/blockchain';
import { insertDonationSchema } from '@shared/schema';
import { Link, useLocation } from 'wouter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, InfoIcon, AlertTriangleIcon } from 'lucide-react';
import { CountrySelector } from '@/components/CountrySelector';

const createDonationSchema = insertDonationSchema.extend({
  endDate: z.string().optional(),
  isUnlimited: z.boolean().default(false),
});

type CreateDonationForm = z.infer<typeof createDonationSchema>;

const DONATION_CATEGORIES = [
  { value: 'health', label: 'Sağlık' },
  { value: 'education', label: 'Eğitim' },
  { value: 'disaster', label: 'Afet Yardımı' },
  { value: 'environment', label: 'Çevre' },
  { value: 'animal', label: 'Hayvan Hakları' },
  { value: 'community', label: 'Toplum' },
  { value: 'technology', label: 'Teknoloji' },
  { value: 'general', label: 'Genel' },
];

const COUNTRIES = [
  { value: 'TUR', label: '🇹🇷 Türkiye' },
  { value: 'USA', label: '🇺🇸 Amerika' },
  { value: 'GER', label: '🇩🇪 Almanya' },
  { value: 'FRA', label: '🇫🇷 Fransa' },
  { value: 'GBR', label: '🇬🇧 İngiltere' },
  { value: 'JPN', label: '🇯🇵 Japonya' },
  { value: 'CHN', label: '🇨🇳 Çin' },
  { value: 'IND', label: '🇮🇳 Hindistan' },
];

export default function CreateDonation() {
  const [, navigate] = useLocation();
  const { isConnected, user, getApiHeaders } = useWallet();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryRestrictions, setCountryRestrictions] = useState<{
    restriction: "all" | "selected" | "exclude";
    allowedCountries?: string[];
    excludedCountries?: string[];
  }>({
    restriction: "all",
    allowedCountries: undefined,
    excludedCountries: undefined,
  });

  // Get user data to determine organization type and permissions
  const { data: userData } = useQuery({
    queryKey: ['/api/users/me'],
    enabled: isConnected,
  });

  const form = useForm<CreateDonationForm>({
    resolver: zodResolver(createDonationSchema),
    defaultValues: {
      title: '',
      description: '',
      goalAmount: '',
      category: 'general',
      country: 'TUR',
      isUnlimited: false,
      endDate: '',
    },
  });

  const isUnlimited = form.watch('isUnlimited');
  const isOrganization = userData?.organizationType !== 'individual';
  const canCreateUnlimited = isOrganization && userData?.organizationVerified;

  // Calculate commission rate and startup fee
  const commissionRate = isOrganization ? 2 : 10;
  const startupFee = isUnlimited && isOrganization ? 100 : 0;

  const createDonationMutation = useMutation({
    mutationFn: async (data: CreateDonationForm) => {
      if (!isConnected || !user) {
        throw new Error('Cüzdan bağlantısı gerekli');
      }

      // Validate unlimited donation permissions
      if (data.isUnlimited && !canCreateUnlimited) {
        throw new Error('Sınırsız bağış oluşturmak için doğrulanmış organizasyon hesabı gerekli');
      }

      // Validate end date for timed donations
      if (!data.isUnlimited && !data.endDate) {
        throw new Error('Süreli bağışlar için bitiş tarihi zorunludur');
      }

      const donationData = {
        title: data.title,
        description: data.description,
        goalAmount: data.goalAmount,
        category: data.category || 'general',
        country: data.country || 'TUR',
        isUnlimited: data.isUnlimited,
        endDate: data.endDate || null,
        countryRestriction: countryRestrictions.restriction,
        allowedCountries: countryRestrictions.allowedCountries ? JSON.stringify(countryRestrictions.allowedCountries) : null,
        excludedCountries: countryRestrictions.excludedCountries ? JSON.stringify(countryRestrictions.excludedCountries) : null,
      };

      // For unlimited donations with startup fee, handle payment first
      if (data.isUnlimited && startupFee > 0) {
        try {
          // Process startup fee payment through blockchain
          const startupFeeWei = (startupFee * 1e6).toString(); // Convert to USDT wei (6 decimals)
          const txHash = await blockchainService.transferUSDT(
            process.env.VITE_PLATFORM_WALLET || '0x0000000000000000000000000000000000000000',
            startupFeeWei
          );
          
          toast({
            title: "Başlangıç Ücreti Ödendi",
            description: `100 USDT başlangıç ücreti başarıyla ödendi. İşlem: ${txHash.slice(0, 10)}...`,
          });
        } catch (error) {
          throw new Error('Başlangıç ücreti ödemesi başarısız oldu');
        }
      }

      // Create donation via API
      const response = await apiRequest('POST', '/api/donations', donationData, getApiHeaders());
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bağış oluşturulamadı');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bağış Oluşturuldu",
        description: "Bağışınız başarıyla oluşturuldu!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      navigate('/donations');
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreateDonationForm) => {
    if (!isConnected) {
      toast({
        title: "Cüzdan Bağlantısı Gerekli",
        description: "Bağış oluşturmak için cüzdanınızı bağlayın",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createDonationMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-yellow-600">
                Cüzdan Bağlantısı Gerekli
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Bağış oluşturmak için öncelikle cüzdanınızı bağlayın
              </p>
              <Link href="/">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-2">
                  Ana Sayfaya Dön
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Yeni Bağış Oluştur
            </h1>
            <p className="text-gray-600">
              Toplumsal fayda için bağış kampanyası başlatın
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-2 border-yellow-400 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-yellow-600">Bağış Detayları</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Komisyon Bilgilendirme Kartı */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Bağış Komisyon Bilgileri</h3>
                            <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                              <div className="flex justify-between">
                                <span>• Platform Komisyonu:</span>
                                <span className="font-medium">%2</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Para Birimi:</span>
                                <span className="font-medium">USDT (BNB Smart Chain)</span>
                              </div>
                              <div className="flex justify-between">
                                <span>• Minimum Bağış:</span>
                                <span className="font-medium">0.1 USDT</span>
                              </div>
                            </div>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-3 bg-green-100 dark:bg-green-800 p-2 rounded">
                              ❤️ Düşük komisyon ile daha fazla yardım ulaştırın!
                            </p>
                          </div>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-yellow-700 font-medium">
                              Bağış Başlığı *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Bağışınız için açıklayıcı bir başlık"
                                className="bg-white border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-yellow-700 font-medium">
                              Açıklama *
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Bağışınızın amacını ve detaylarını açıklayın..."
                                className="bg-white border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900 min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="goalAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-yellow-700 font-medium">
                                Hedef Miktar (USDT) *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.000001"
                                  min="1"
                                  placeholder="1000"
                                  className="bg-white border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-yellow-700 font-medium">
                                Kategori *
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900">
                                    <SelectValue placeholder="Kategori seçin" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white border-yellow-400">
                                  {DONATION_CATEGORIES.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                      {category.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-yellow-700 font-medium">
                              Ülke
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900">
                                  <SelectValue placeholder="Ülke seçin" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white border-yellow-400">
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.value} value={country.value}>
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Unlimited Donation Toggle */}
                      <FormField
                        control={form.control}
                        name="isUnlimited"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-yellow-400 bg-white p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base text-yellow-700 font-medium">
                                Sınırsız Bağış
                              </FormLabel>
                              <FormDescription>
                                {canCreateUnlimited 
                                  ? "Süresiz bağış kampanyası (Sadece doğrulanmış organizasyonlar)"
                                  : "Bu özellik sadece doğrulanmış organizasyonlar için mevcuttur"}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canCreateUnlimited}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* End Date - Only show for timed donations */}
                      {!isUnlimited && (
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-yellow-700 font-medium">
                                Bitiş Tarihi *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  className="bg-white border-2 border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900"
                                  min={new Date().toISOString().slice(0, 16)}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting || createDonationMutation.isPending}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 text-lg font-semibold border-2 border-yellow-500 hover:border-yellow-600"
                      >
                        {isSubmitting || createDonationMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Oluşturuluyor...
                          </div>
                        ) : (
                          'Bağış Oluştur'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-4">
              {/* Account Info */}
              <Card className="bg-white border-2 border-yellow-400 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-600">Hesap Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hesap Türü:</span>
                    <Badge variant={isOrganization ? "default" : "secondary"}>
                      {isOrganization ? "Organizasyon" : "Bireysel"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Doğrulama:</span>
                    <Badge variant={userData?.organizationVerified ? "default" : "destructive"}>
                      {userData?.organizationVerified ? "Doğrulanmış" : "Beklemede"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Komisyon Oranı:</span>
                    <span className="text-sm font-semibold text-yellow-600">%{commissionRate}</span>
                  </div>
                </CardContent>
              </Card>

              {/* International Country Filtering System */}
              <CountrySelector
                value={countryRestrictions}
                onChange={setCountryRestrictions}
                label="Ülke Kısıtlamaları"
                description="Bu bağış kampanyası için katılım ülke kısıtlamaları belirleyin"
              />

              {/* Important Notice */}
              <Card className="bg-white border-2 border-red-400 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-red-600 flex items-center">
                    <AlertTriangleIcon className="w-5 h-5 mr-2" />
                    Önemli Bilgi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-red-700">
                    <p className="mb-2 font-semibold">
                      Bağış alan hesaplar çekiliş oluşturamaz
                    </p>
                    <p>
                      Bağış kampanyası oluşturduktan sonra sadece bağış kabul edebilirsiniz. 
                      Çekiliş yapmak için ayrı bir hesap kullanmanız gerekir.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Fee Information */}
              <Card className="bg-white border-2 border-yellow-400 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-600 flex items-center">
                    <InfoIcon className="w-5 h-5 mr-2" />
                    Ücret Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      <strong>Bireysel Hesaplar:</strong> %10 komisyon, maksimum 30 gün süre
                    </p>
                    <p className="mb-2">
                      <strong>Organizasyonlar:</strong> %2 komisyon
                    </p>
                    <p>
                      <strong>Sınırsız Bağışlar:</strong> 100 USDT başlangıç ücreti (iade edilmez)
                    </p>
                  </div>
                  {startupFee > 0 && (
                    <Alert>
                      <AlertTriangleIcon className="h-4 w-4" />
                      <AlertDescription>
                        Bu bağış için 100 USDT başlangıç ücreti gereklidir
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Guidelines */}
              <Card className="bg-white border-2 border-yellow-400 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-600">Bağış Kuralları</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>• Tüm bağışlar USDT (BSC) ile gerçekleştirilir</p>
                  <p>• Bağış açıklamaları net ve şeffaf olmalıdır</p>
                  <p>• Yasadışı faaliyetler için bağış açılamaz</p>
                  <p>• Platform kurallarına uygun davranın</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}