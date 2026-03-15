import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '@/api/crm';
import type { ListParams, Deal } from '@/types';

export function useDeals(params?: ListParams) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: () => crmApi.getDeals(params),
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => crmApi.getDeal(id),
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Deal>) => crmApi.createDeal(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Deal> }) => crmApi.updateDeal(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function useMoveDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) => crmApi.moveDeal(id, stageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteDeal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function usePipelines() {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: () => crmApi.getPipelines(),
  });
}

export function useDealComments(dealId: string) {
  return useQuery({
    queryKey: ['deals', dealId, 'comments'],
    queryFn: () => crmApi.getComments(dealId),
    enabled: !!dealId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, text }: { dealId: string; text: string }) =>
      crmApi.addComment(dealId, text),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ['deals', vars.dealId, 'comments'] }),
  });
}
