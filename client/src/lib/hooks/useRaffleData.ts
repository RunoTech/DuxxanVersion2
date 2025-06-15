import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Raffle, InsertRaffle, Ticket, User, Category } from '@shared/schema';

export function useRaffles(limit = 20) {
  return useInfiniteQuery({
    queryKey: ['raffles', 'list'],
    queryFn: ({ pageParam = 0 }) => 
      apiRequest('GET', `/api/raffles?limit=${limit}&offset=${pageParam}`).then(res => res.json()),
    getNextPageParam: (lastPage: any[], allPages) => {
      return lastPage.length === limit ? allPages.length * limit : undefined;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useActiveRaffles() {
  return useQuery<(Raffle & { creator: User; category: Category })[]>({
    queryKey: ['raffles', 'active'],
    queryFn: () => apiRequest('GET', '/api/raffles/active').then(res => res.json()),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useRaffleDetail(id: number) {
  return useQuery<Raffle & { creator: User; category: Category }>({
    queryKey: ['raffles', 'detail', id],
    queryFn: () => apiRequest('GET', `/api/raffles/${id}`).then(res => res.json()),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useRaffleTickets(raffleId: number) {
  return useQuery<(Ticket & { user: User })[]>({
    queryKey: ['raffles', raffleId, 'tickets'],
    queryFn: () => apiRequest('GET', `/api/raffles/${raffleId}/tickets`).then(res => res.json()),
    enabled: !!raffleId,
    staleTime: 10 * 1000, // 10 seconds
  });
}

export function useCreateRaffle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (raffleData: InsertRaffle) => 
      apiRequest('POST', '/api/raffles', raffleData).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raffles'] });
    },
  });
}

export function usePurchaseTickets() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ raffleId, quantity }: { raffleId: number; quantity: number }) => 
      apiRequest('POST', `/api/raffles/${raffleId}/tickets`, { quantity }).then(res => res.json()),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['raffles', variables.raffleId, 'tickets'] });
      queryClient.invalidateQueries({ queryKey: ['raffles', 'detail', variables.raffleId] });
      queryClient.invalidateQueries({ queryKey: ['raffles', 'active'] });
    },
  });
}

export function useUserRaffles(userId: number) {
  return useQuery({
    queryKey: ['raffles', 'user', userId],
    queryFn: () => apiRequest('GET', `/api/users/${userId}/raffles`).then(res => res.json()),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRafflesByCategory(categoryId: number) {
  return useQuery({
    queryKey: ['raffles', 'category', categoryId],
    queryFn: () => apiRequest('GET', `/api/raffles?categoryId=${categoryId}`).then(res => res.json()),
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
}