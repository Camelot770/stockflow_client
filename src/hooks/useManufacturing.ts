import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techMapApi, techOperationApi } from '@/api/manufacturing';
import type { ListParams } from '@/types';

// ========== Тех. карты ==========

export function useTechMaps(params?: ListParams) {
  return useQuery({
    queryKey: ['tech-maps', params],
    queryFn: () => techMapApi.getAll(params),
  });
}

export function useTechMap(id: string) {
  return useQuery({
    queryKey: ['tech-maps', id],
    queryFn: () => techMapApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTechMap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => techMapApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tech-maps'] }),
  });
}

export function useUpdateTechMap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => techMapApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tech-maps'] }),
  });
}

export function useToggleTechMapActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => techMapApi.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tech-maps'] }),
  });
}

export function useDeleteTechMap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => techMapApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tech-maps'] }),
  });
}

// ========== Тех. операции ==========

export function useTechOperations(params?: ListParams & { status?: string; priority?: string }) {
  return useQuery({
    queryKey: ['tech-operations', params],
    queryFn: () => techOperationApi.getAll(params),
  });
}

export function useTechOperation(id: string) {
  return useQuery({
    queryKey: ['tech-operations', id],
    queryFn: () => techOperationApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTechOperation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => techOperationApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tech-operations'] }),
  });
}

export function useUpdateTechOperation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => techOperationApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tech-operations'] }),
  });
}

export function useUpdateTechOperationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      techOperationApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tech-operations'] }),
  });
}

export function useToggleOperationStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stepId, done }: { id: string; stepId: string; done: boolean }) =>
      techOperationApi.toggleStepDone(id, stepId, done),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tech-operations'] }),
  });
}

export function useDeleteTechOperation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => techOperationApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tech-operations'] }),
  });
}
