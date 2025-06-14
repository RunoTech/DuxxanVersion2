import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { blockchainService } from '@/lib/blockchain';
import { insertDonationSchema } from '@shared/schema';
import { Link, useLocation } from 'wouter';

const createDonationSchema = insertDonationSchema.extend({
  endDate: z.string().min(1, 'End date is required'),
});

type CreateDonationForm = z.infer<typeof createDonationSchema>;

export default function CreateDonation() {
  const [, navigate] = useLocation();
  const { isConnected, user, getApiHeaders } = useWallet();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateDonationForm>({
    resolver: zodResolver(createDonationSchema),
    defaultValues: {
      title: '',
      description: '',
      goalAmount: '',
      endDate: '',
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: CreateDonationForm) => {
      // Convert endDate string to Date object
      const donationData = {
        ...data,
        endDate: new Date(data.endDate),
        goalAmount: data.goalAmount.toString(),
      };

      // First, create blockchain transaction
      const endTime = Math.floor(new Date(data.endDate).getTime() / 1000);
      const transactionHash = await blockchainService.createDonation(
        data.goalAmount.toString(),
        endTime
      );

      // Then create in database
      const response = await apiRequest('POST', '/api/donations', donationData);
      return response.json();
    },
    onSuccess: (donation) => {
      toast({
        title: 'Campaign Created!',
        description: 'Your donation campaign has been successfully created and is now live.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      navigate('/donations');
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create donation campaign',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: CreateDonationForm) => {
    if (!isConnected || !user) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to create a donation campaign',
        variant: 'destructive',
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

  const getDaysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 16);
  };

  const setPresetDuration = (days: number) => {
    form.setValue('endDate', getDaysFromNow(days));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Cüzdanınızı Bağlayın</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bağış kampanyası oluşturmak için lütfen cüzdanınızı bağlayın.
            </p>
            <Link href="/">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Ana Sayfaya Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-duxxan-dark py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Start Donation Campaign</h1>
          <p className="text-duxxan-text-secondary">
            Create a transparent donation campaign and make a positive impact. 
            <span className="text-duxxan-yellow font-semibold"> Creation fee: 25 USDT</span>
          </p>
        </div>

        <Card className="duxxan-card">
          <CardHeader>
            <CardTitle className="text-xl">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Clean Water Initiative for Rural Communities"
                          className="bg-duxxan-dark border-duxxan-border text-white"
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
                      <FormLabel>Campaign Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain your cause, how the funds will be used, and the impact you aim to make. Be transparent about your goals and how donors can make a difference..."
                          className="bg-duxxan-dark border-duxxan-border text-white min-h-[120px]"
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
                        <FormLabel>Fundraising Goal (USDT)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50000"
                            className="bg-duxxan-dark border-duxxan-border text-white"
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
                        <FormLabel>Campaign End Date</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="bg-duxxan-dark border-duxxan-border text-white"
                            min={new Date().toISOString().slice(0, 16)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Quick Duration Buttons */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Duration</label>
                  <div className="flex gap-2">
                    {[
                      { days: 30, label: '30 Days' },
                      { days: 60, label: '60 Days' },
                      { days: 90, label: '90 Days' },
                      { days: 180, label: '6 Months' },
                    ].map(({ days, label }) => (
                      <Button
                        key={days}
                        type="button"
                        onClick={() => setPresetDuration(days)}
                        variant="outline"
                        size="sm"
                        className="duxxan-button-secondary text-xs"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Campaign Preview */}
                {form.watch('goalAmount') && (
                  <Card className="bg-duxxan-dark border-duxxan-border">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 text-duxxan-success">Campaign Impact</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-duxxan-text-secondary">Fundraising Goal</div>
                          <div className="font-bold text-duxxan-success">
                            ${parseFloat(form.watch('goalAmount') || '0').toLocaleString()} USDT
                          </div>
                        </div>
                        <div>
                          <div className="text-duxxan-text-secondary">Platform Fee (10%)</div>
                          <div className="font-bold text-duxxan-warning">
                            ${(parseFloat(form.watch('goalAmount') || '0') * 0.1).toLocaleString()} USDT
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-duxxan-border">
                        <div className="text-duxxan-text-secondary text-xs">Net Amount to Cause</div>
                        <div className="font-bold text-white">
                          ${(parseFloat(form.watch('goalAmount') || '0') * 0.9).toLocaleString()} USDT
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="bg-duxxan-dark border border-duxxan-success rounded-lg p-4">
                  <h4 className="font-semibold text-duxxan-success mb-2">Transparency & Trust</h4>
                  <ul className="text-sm text-duxxan-text-secondary space-y-1">
                    <li>• All donations are recorded on the Binance Smart Chain</li>
                    <li>• Platform takes 10% commission for operational costs</li>
                    <li>• Donors can track exactly how their contributions are used</li>
                    <li>• Real-time updates on campaign progress and milestones</li>
                    <li>• Smart contract ensures secure and transparent fund distribution</li>
                  </ul>
                </div>

                <div className="bg-duxxan-dark border border-duxxan-warning rounded-lg p-4">
                  <h4 className="font-semibold text-duxxan-warning mb-2">Guidelines & Requirements</h4>
                  <ul className="text-sm text-duxxan-text-secondary space-y-1">
                    <li>• Creation fee of 25 USDT will be charged upon submission</li>
                    <li>• Campaign must comply with local laws and regulations</li>
                    <li>• Provide regular updates to donors about progress</li>
                    <li>• Misuse of funds may result in account suspension</li>
                    <li>• Campaign cannot be modified after creation</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Link href="/donations" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="duxxan-button-secondary w-full"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isConnected}
                    className="duxxan-button-success flex-1"
                  >
                    {isSubmitting ? 'Creating Campaign...' : 'Start Campaign (25 USDT)'}
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
