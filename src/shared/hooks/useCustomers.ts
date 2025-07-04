import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { CustomerFilters } from '../types';

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => apiClient.customers.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => apiClient.customers.getById(id),
    enabled: !!id,
  });
}

export function useCustomerWithStats(id: string) {
  return useQuery({
    queryKey: ['customers', id, 'stats'],
    queryFn: () => apiClient.customers.getWithStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCustomersWithStats(searchTerm?: string) {
  const filters = searchTerm ? { search: searchTerm } : undefined;

  return useQuery({
    queryKey: ['customers', 'with-stats', filters],
    queryFn: () => apiClient.customers.getAllWithStats(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}