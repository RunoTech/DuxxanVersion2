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

const createRaffleSchema = insertRaffleSchema.extend({
  endDate: z.string().min(1, 'End date is required'),
});

type CreateRaffleForm = z.infer<typeof createRaffleSchema>;

export default function CreateRaffle() {
  const [, navigate] = useLocation();
  const { isConnected, user, getApiHeaders } = useWallet();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const suggestTicketPrice = () => {
    const prizeValue = parseFloat(form.getValues('prizeValue') || '0');
    const maxTickets = form.getValues('maxTickets') || 100;
    
    if (prizeValue > 0 && maxTickets > 0) {
      // Suggest price that would generate 120% of prize value (20% platform profit margin)
      const suggestedPrice = (prizeValue * 1.2) / maxTickets;
      form.setValue('ticketPrice', suggestedPrice.toFixed(2));
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-duxxan-dark flex items-center justify-center">
        <Card className="duxxan-card max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-duxxan-text-secondary mb-6">
              Please connect your wallet to create a raffle.
            </p>
            <Link href="/">
              <Button className="duxxan-button-primary">
                Go Back Home
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
          <h1 className="text-3xl font-bold mb-2">Create New Raffle</h1>
          <p className="text-duxxan-text-secondary">
            Create an exciting raffle and let others win amazing prizes. 
            <span className="text-duxxan-yellow font-semibold"> Creation fee: 25 USDT</span>
          </p>
        </div>

        <Card className="duxxan-card">
          <CardHeader>
            <CardTitle className="text-xl">Raffle Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-duxxan-dark border-duxxan-border text-white">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-duxxan-surface border-duxxan-border">
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
                      <FormLabel>Raffle Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Ferrari 488 GTB - Ultimate Sports Car"
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your prize in detail. Include specifications, condition, value, and any special features..."
                          className="bg-duxxan-dark border-duxxan-border text-white min-h-[100px]"
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
                        <FormLabel>Prize Value (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="300000"
                            className="bg-duxxan-dark border-duxxan-border text-white"
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-suggest ticket price when prize value changes
                              setTimeout(suggestTicketPrice, 100);
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
                        <FormLabel>Maximum Tickets</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2000"
                            className="bg-duxxan-dark border-duxxan-border text-white"
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value) || 0);
                              // Auto-suggest ticket price when max tickets changes
                              setTimeout(suggestTicketPrice, 100);
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
                          Ticket Price (USDT)
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={suggestTicketPrice}
                            className="text-duxxan-yellow hover:text-yellow-400 h-auto p-0"
                          >
                            Auto-calculate
                          </Button>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="150.00"
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
                        <FormLabel>End Date</FormLabel>
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

                <div className="bg-duxxan-dark border border-duxxan-warning rounded-lg p-4">
                  <h4 className="font-semibold text-duxxan-warning mb-2">Important Notes</h4>
                  <ul className="text-sm text-duxxan-text-secondary space-y-1">
                    <li>• Creation fee of 25 USDT will be charged upon submission</li>
                    <li>• Platform takes 10% commission (5% to you, 5% to platform)</li>
                    <li>• If insufficient tickets are sold, participant funds are refunded</li>
                    <li>• Winner and creator must both approve transaction within 6 days</li>
                    <li>• All transactions are secured by smart contracts on BSC</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Link href="/raffles" className="flex-1">
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
                    className="duxxan-button-primary flex-1"
                  >
                    {isSubmitting ? 'Creating Raffle...' : 'Create Raffle (25 USDT)'}
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
