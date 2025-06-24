import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const createDonationSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  description: z.string().min(1, 'Açıklama gerekli'),
  goalAmount: z.string().min(1, 'Hedef miktar gerekli'),
  endDate: z.string().optional(),
  isUnlimited: z.boolean().default(false),
  countryRestriction: z.string().default('all'),
  allowedCountries: z.array(z.string()).default([]),
  excludedCountries: z.array(z.string()).default([]),
});

type CreateDonationForm = z.infer<typeof createDonationSchema>;

const countries = [
  { code: 'TR', name: 'Türkiye' },
  { code: 'US', name: 'Amerika Birleşik Devletleri' },
  { code: 'DE', name: 'Almanya' },
  { code: 'FR', name: 'Fransa' },
  { code: 'GB', name: 'İngiltere' },
  { code: 'IT', name: 'İtalya' },
  { code: 'ES', name: 'İspanya' },
  { code: 'NL', name: 'Hollanda' },
  { code: 'BE', name: 'Belçika' },
  { code: 'CH', name: 'İsviçre' },
  { code: 'AT', name: 'Avusturya' },
  { code: 'SE', name: 'İsveç' },
  { code: 'NO', name: 'Norveç' },
  { code: 'DK', name: 'Danimarka' },
  { code: 'FI', name: 'Finlandiya' },
  { code: 'CA', name: 'Kanada' },
  { code: 'AU', name: 'Avustralya' },
  { code: 'JP', name: 'Japonya' },
  { code: 'KR', name: 'Güney Kore' },
  { code: 'SG', name: 'Singapur' }
];

export default function AdminDonationCreate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateDonationForm>({
    resolver: zodResolver(createDonationSchema),
    defaultValues: {
      title: '',
      description: '',
      goalAmount: '',
      endDate: '',
      isUnlimited: false,
      countryRestriction: 'all',
      allowedCountries: [],
      excludedCountries: [],
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: CreateDonationForm) => {
      return apiRequest('/api/donations/create-manual', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          goalAmount: parseFloat(data.goalAmount),
          endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
          countryRestriction: data.countryRestriction,
          allowedCountries: JSON.stringify(data.allowedCountries),
          excludedCountries: JSON.stringify(data.excludedCountries),
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Manuel Bağış Kampanyası Oluşturuldu',
        description: 'Bağış kampanyası başarıyla oluşturuldu ve yayınlandı.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Bağış kampanyası oluşturulurken bir hata oluştu.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateDonationForm) => {
    createDonationMutation.mutate(data);
  };

  const isUnlimited = form.watch('isUnlimited');

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-duxxan-yellow">
            Manuel Bağış Kampanyası Oluştur
          </CardTitle>
          <p className="text-muted-foreground">
            Platform kontrolünde manuel bağış kampanyası oluşturun
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
                    <FormLabel>Kampanya Başlığı</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Deprem Mağdurları İçin Yardım" {...field} />
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
                        placeholder="Bağış kampanyası hakkında detaylı bilgi..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hedef Miktar (USDT)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isUnlimited"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Süresiz Bağış Kampanyası
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Kampanyanın bitiş tarihi olmayacak
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {!isUnlimited && (
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
              )}

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  🔒 Gizli Bağış Kampanyası
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Bu kampanya kullanıcılara tamamen gerçek görünecek. Bağışlar sahte olacak ancak 
                  gerçekçi görünecek. İstediğiniz zaman kontrol edebilirsiniz.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-duxxan-yellow text-duxxan-dark hover:bg-duxxan-yellow/90"
                disabled={createDonationMutation.isPending}
              >
                {createDonationMutation.isPending ? 'Oluşturuluyor...' : 'Bağış Kampanyası Oluştur'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}