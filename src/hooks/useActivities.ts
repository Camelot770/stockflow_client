import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '@/api/crm';
import type { ListParams, Activity } from '@/types';

export function useActivities(params?: ListParams) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => crmApi.getActivities(params),
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Activity>) => crmApi.createActivity(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Activity> }) =>
      crmApi.updateActivity(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useCompleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.completeActivity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmApi.deleteActivity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}
