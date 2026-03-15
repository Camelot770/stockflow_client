import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api/settings';
import type { ListParams, CompanySettings, User } from '@/types';

export function useCompanySettings() {
  return useQuery({
    queryKey: ['company-settings'],
    queryFn: () => settingsApi.getCompanySettings(),
  });
}

export function useUpdateCompanySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CompanySettings>) => settingsApi.updateCompanySettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company-settings'] }),
  });
}

export function useUsers(params?: ListParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => settingsApi.getUsers(params),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User> & { password: string }) => settingsApi.createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      settingsApi.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useAuditLog(params?: ListParams) {
  return useQuery({
    queryKey: ['audit-log', params],
    queryFn: () => settingsApi.getAuditLog(params),
  });
}
