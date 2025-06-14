import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { blockchainService } from '@/lib/blockchain';
import { insertRaffleSchema } from '@shared/schema';
import { Link, useLocation } from 'wouter';
import { Upload, X, ImageIcon } from 'lucide-react';

const createRaffleSchema = insertRaffleSchema.extend({
  endDate: z.string().min(1, 'End date is required'),
});

type CreateRaffleForm = z.infer<typeof createRaffleSchema>;

export default function CreateRaffle() {
  const [, navigate] = useLocation();
  const { isConnected, user, getApiHeaders } = useWallet();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  const form = useForm<CreateRaffleForm>({
    resolver: zodResolver(createRaffleSchema),
    defaultValues: {
      title: '',
      description: '',
      prizeValue: '',
      ticketPrice: '',
      maxTickets: 100,
      categoryId: 1,
      endDate: '',
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const createRaffleMutation = useMutation({
    mutationFn: async (data: CreateRaffleForm) => {
      // Convert endDate string to Date object
      const raffleData = {
        ...data,
        endDate: new Date(data.endDate),
        prizeValue: data.prizeValue.toString(),
        ticketPrice: data.ticketPrice.toString(),
      };

      // First, create blockchain transaction
      const endTime = Math.floor(new Date(data.endDate).getTime() / 1000);
      const transactionHash = await blockchainService.createRaffle(
        data.ticketPrice.toString(),
        data.maxTickets,
        endTime
      );

      // Then create in database
      const response = await apiRequest('POST', '/api/raffles', raffleData);
      return response.json();
    },
    onSuccess: (raffle) => {
      toast({
        title: 'Raffle Created!',
        description: 'Your raffle has been successfully created and is now live.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/raffles'] });
      navigate('/raffles');
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create raffle',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: CreateRaffleForm) => {
    if (!isConnected || !user) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to create a raffle',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createRaffleMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateOptimalPrice = () => {
    const prizeValue = parseFloat(form.getValues('prizeValue') || '0');
    const maxTickets = form.getValues('maxTickets') || 100;
    
    if (prizeValue > 0 && maxTickets > 0) {
      // Platform takes 10% commission, so we need 110% of prize value to cover prize + commission
      const suggestedPrice = (prizeValue * 1.1) / maxTickets;
      form.setValue('ticketPrice', suggestedPrice.toFixed(2));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const remainingSlots = 10 - photos.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);
      setPhotos(prev => [...prev, ...filesToAdd]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-duxxan-dark flex items-center justify-center">
        <Card className="bg-white dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cüzdanınızı Bağlayın</h2>
            <p className="text-gray-600 dark:text-duxxan-text-secondary mb-6">
              Çekiliş oluşturmak için lütfen cüzdanınızı bağlayın.
            </p>
            <Link href="/">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                Ana Sayfaya Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-duxxan-dark py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Yeni Çekiliş Oluştur</h1>
          <p className="text-gray-600 dark:text-duxxan-text-secondary">
            Heyecan verici bir çekiliş oluşturun ve diğerlerinin harika ödüller kazanmasını sağlayın. 
            <span className="text-yellow-600 dark:text-duxxan-yellow font-semibold"> Oluşturma ücreti: 25 USDT</span>
          </p>
        </div>

        <Card className="bg-white dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white">Çekiliş Detayları</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white">
                            <SelectValue placeholder="Bir kategori seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-duxxan-surface border-gray-200 dark:border-duxxan-border">
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Çekiliş Başlığı</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="örn., Ferrari 488 GTB - Efsane Spor Araba"
                          className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photo Upload Section */}
                <div className="space-y-4">
                  <FormLabel>Ürün Fotoğrafları (En fazla 10 adet)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-yellow-300"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {photos.length < 10 && (
                      <label className="w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Fotoğraf Ekle</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {photos.length}/10 fotoğraf yüklendi. JPG, PNG formatları desteklenir.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Açıklama</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ödülünüzü detaylı olarak açıklayın. Özellikler, durum, değer ve özel özellikleri dahil edin..."
                          className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white min-h-[100px]"
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
                    name="prizeValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ödül Değeri (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="300000"
                            className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white"
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-calculate ticket price when prize value changes
                              setTimeout(calculateOptimalPrice, 100);
                            }}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxTickets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maksimum Bilet Sayısı</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2000"
                            className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white"
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value) || 0);
                              // Auto-calculate ticket price when max tickets changes
                              setTimeout(calculateOptimalPrice, 100);
                            }}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ticketPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          Bilet Fiyatı (USDT)
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={calculateOptimalPrice}
                            className="text-yellow-600 hover:text-yellow-500 h-auto p-0 text-sm"
                          >
                            Otomatik Hesapla
                          </Button>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="150.00"
                            className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bitiş Tarihi</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="bg-white dark:bg-duxxan-dark border-gray-300 dark:border-duxxan-border text-gray-900 dark:text-white"
                            min={new Date().toISOString().slice(0, 16)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Commission Calculator - Creator's 5% Share Only */}
                {form.watch('prizeValue') && form.watch('ticketPrice') && form.watch('maxTickets') && (
                  <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:border-yellow-600">
                    <CardContent className="p-4">
                      <h4 className="font-bold mb-3 text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                        </svg>
                        Tahmini Komisyon Geliriniz
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Bilet Geliri</div>
                            <div className="font-bold text-lg text-gray-900 dark:text-white">
                              ${(parseFloat(form.watch('ticketPrice') || '0') * (form.watch('maxTickets') || 0)).toLocaleString()} USDT
                            </div>
                          </div>
                          <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3">
                            <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Sizin Payınız (%5)</div>
                            <div className="font-bold text-xl text-yellow-800 dark:text-yellow-200">
                              ${((parseFloat(form.watch('ticketPrice') || '0') * (form.watch('maxTickets') || 0)) * 0.05).toLocaleString()} USDT
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded p-2">
                          <strong>Not:</strong> Platform toplam %10 komisyon alır. Bunun %5'i size, %5'i platforma gider. 
                          Yukarıdaki hesaplama sadece sizin alacağınız %5'lik payı gösterir.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-300 dark:border-blue-600 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Önemli Notlar</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Çekiliş oluşturma ücreti 25 USDT gönderimde tahsil edilecektir</li>
                    <li>• Platform %10 komisyon alır (%5 size, %5 platforma)</li>
                    <li>• Yetersiz bilet satılırsa, katılımcı fonları iade edilir</li>
                    <li>• Kazanan ve yaratıcı 6 gün içinde işlemi onaylamalıdır</li>
                    <li>• Tüm işlemler BSC üzerinde akıllı kontratlarla güvence altındadır</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Link href="/raffles" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      İptal
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isConnected}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  >
                    {isSubmitting ? 'Çekiliş Oluşturuluyor...' : 'Çekiliş Oluştur (25 USDT)'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
