import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { priceListsApi } from '@/api/priceLists';

export function usePriceLists() {
  return useQuery({
    queryKey: ['price-lists'],
    queryFn: () => priceListsApi.getAll(),
  });
}

export function usePriceList(id: string | null) {
  return useQuery({
    queryKey: ['price-lists', id],
    queryFn: () => priceListsApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePriceList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; isDefault?: boolean }) =>
      priceListsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['price-lists'] }),
  });
}

export function useUpdatePriceList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; isDefault?: boolean } }) =>
      priceListsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['price-lists'] }),
  });
}

export function useDeletePriceList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => priceListsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['price-lists'] }),
  });
}

export function useSetPriceListItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: { productId: string; price: number }[] }) =>
      priceListsApi.setItems(id, items),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['price-lists'] });
      qc.invalidateQueries({ queryKey: ['price-lists', variables.id] });
    },
  });
}
