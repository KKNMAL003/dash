import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';

export function useCustomersWithChats(searchTerm?: string) {
  return useQuery({
    queryKey: ['customers-with-chats', searchTerm],
    queryFn: () => apiClient.communications.getCustomersWithChats(searchTerm),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCustomerMessages(customerId: string) {
  return useQuery({
    queryKey: ['messages', customerId],
    queryFn: () => apiClient.communications.getByCustomerId(customerId),
    enabled: !!customerId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.communications.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-chats'] });
      toast.success('Message sent successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.communications.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers-with-chats'] });
    },
  });
}