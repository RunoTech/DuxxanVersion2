import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const createRaffleSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  description: z.string().min(1, 'Açıklama gerekli'),
  prizeValue: z.string().min(1, 'Ödül değeri gerekli'),
  ticketPrice: z.string().min(1, 'Bilet fiyatı gerekli'),
  maxTickets: z.string().min(1, 'Maksimum bilet sayısı gerekli'),
  categoryId: z.string().min(1, 'Kategori seçin'),
  endDate: z.string().min(1, 'Bitiş tarihi gerekli'),
});

type CreateRaffleForm = z.infer<typeof createRaffleSchema>;

const categories = [
  { id: 1, name: 'Elektronik' },
  { id: 2, name: 'Ev & Yaşam' },
  { id: 3, name: 'Moda & Aksesuar' },
  { id: 4, name: 'Spor & Outdoor' },
  { id: 5, name: 'Kitap & Hobi' },
  { id: 6, name: 'Diğer' }
];

export default function AdminRaffleCreate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateRaffleForm>({
    resolver: zodResolver(createRaffleSchema),
    defaultValues: {
      title: '',
      description: '',
      prizeValue: '',
      ticketPrice: '',
      maxTickets: '',
      categoryId: '',
      endDate: '',
    },
  });

  const createRaffleMutation = useMutation({
    mutationFn: async (data: CreateRaffleForm) => {
      return apiRequest('/api/raffles/create-manual', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          prizeValue: parseFloat(data.prizeValue),
          ticketPrice: parseFloat(data.ticketPrice),
          maxTickets: parseInt(data.maxTickets),
          categoryId: parseInt(data.categoryId),
          endDate: new Date(data.endDate).toISOString(),
          isManual: true,
          createdByAdmin: true,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Manuel Çekiliş Oluşturuldu',
        description: 'Çekiliş başarıyla oluşturuldu ve yayınlandı.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/raffles'] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Çekiliş oluşturulurken bir hata oluştu.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateRaffleForm) => {
    createRaffleMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-duxxan-yellow">
            Manuel Çekiliş Oluştur
          </CardTitle>
          <p className="text-muted-foreground">
            Platform kontrolünde manuel çekiliş oluşturun
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Çekiliş Başlığı</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: iPhone 15 Pro Max Çekilişi" {...field} />
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
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Çekiliş hakkında detaylı bilgi..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prizeValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ödül Değeri (USDT)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ticketPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bilet Fiyatı (USDT)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxTickets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maksimum Bilet</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
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
              </div>

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitiş Tarihi</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  🔒 Gizli Çekiliş Oluştur
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Bu çekiliş kullanıcılara tamamen gerçek görünecek. Blockchain entegrasyonu olmaz, 
                  istediğiniz zaman kontrolü elinizde tutabilirsiniz. Platform yöneticisi kontrolünde.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-duxxan-yellow text-duxxan-dark hover:bg-duxxan-yellow/90"
                disabled={createRaffleMutation.isPending}
              >
                {createRaffleMutation.isPending ? 'Oluşturuluyor...' : 'Çekiliş Oluştur'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}