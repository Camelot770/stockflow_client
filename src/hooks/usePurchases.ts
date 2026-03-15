import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchasesApi } from '@/api/purchases';
import type { ListParams, PurchaseOrder, Supplier } from '@/types';

export function usePurchaseOrders(params?: ListParams) {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: () => purchasesApi.getOrders(params),
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ['purchases', id],
    queryFn: () => purchasesApi.getOrder(id),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PurchaseOrder>) => purchasesApi.createOrder(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  });
}

export function useUpdatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PurchaseOrder> }) =>
      purchasesApi.updateOrder(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  });
}

export function useSuppliers(params?: ListParams) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => purchasesApi.getSuppliers(params),
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Supplier>) => purchasesApi.createSupplier(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) =>
      purchasesApi.updateSupplier(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}
