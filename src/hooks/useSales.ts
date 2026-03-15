import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '@/api/sales';
import type { ListParams, SalesOrder, Return } from '@/types';

export function useSalesOrders(params?: ListParams) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => salesApi.getOrders(params),
  });
}

export function useSalesOrder(id: string) {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => salesApi.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SalesOrder>) => salesApi.createOrder(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales'] }),
  });
}

export function useUpdateSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SalesOrder> }) =>
      salesApi.updateOrder(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales'] }),
  });
}

export function useDeleteSalesOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesApi.deleteOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales'] }),
  });
}

export function useReturns(params?: ListParams) {
  return useQuery({
    queryKey: ['returns', params],
    queryFn: () => salesApi.getReturns(params),
  });
}

export function useCreateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Return>) => salesApi.createReturn(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['returns'] }),
  });
}
