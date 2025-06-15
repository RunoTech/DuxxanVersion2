import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { User, InsertUser } from '@shared/schema';

export function useUserProfile(walletAddress?: string) {
  return useQuery<User>({
    queryKey: ['user', 'profile', walletAddress],
    queryFn: () => apiRequest('GET', `/api/users/me`).then(res => res.json()),
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: Partial<InsertUser>) => 
      apiRequest('PATCH', '/api/users/me', userData).then(res => res.json()),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.setQueryData(['user', 'profile', data.walletAddress], data);
    },
  });
}

export function useUserDevices() {
  return useQuery({
    queryKey: ['user', 'devices'],
    queryFn: () => apiRequest('GET', '/api/users/me/devices').then(res => res.json()),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserPhotos(photoType?: string) {
  return useQuery({
    queryKey: ['user', 'photos', photoType],
    queryFn: () => {
      const url = photoType ? `/api/users/me/photos?type=${photoType}` : '/api/users/me/photos';
      return apiRequest('GET', url).then(res => res.json());
    },
    staleTime: 5 * 60 * 1000,
  });
}