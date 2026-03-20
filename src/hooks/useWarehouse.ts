import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseApi } from '@/api/warehouse';
import type { ListParams, Warehouse, StockOperation } from '@/types';

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseApi.getWarehouses(),
  });
}

export function useStock(params?: ListParams) {
  return useQuery({
    queryKey: ['stock', params],
    queryFn: () => warehouseApi.getStock(params),
  });
}

export function useStockOperations(params?: ListParams) {
  return useQuery({
    queryKey: ['stock-movements', params],
    queryFn: () => warehouseApi.getMovements(params),
  });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Warehouse>) => warehouseApi.createWarehouse(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }),
  });
}

export function useCreateStockOperation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StockOperation>) => warehouseApi.createOperation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-operations'] });
      qc.invalidateQueries({ queryKey: ['stock'] });
    },
  });
}


export function useStockMovements(params?: ListParams) {
  return useQuery({
    queryKey: ['stock-movements', params],
    queryFn: () => warehouseApi.getMovements(params),
  });
}

export function useCreateAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { warehouseId: string; productId: string; quantity: number; reason: string }) =>
      warehouseApi.createAdjustment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      qc.invalidateQueries({ queryKey: ['stock-movements'] });
    },
  });
}
