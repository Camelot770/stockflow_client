import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/api/documents';
import type { Document } from '@/types';

export function useDocuments(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsApi.getAll(params),
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; number: string; relatedOrderId?: string; relatedOrderType?: string }) =>
      documentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  });
}
