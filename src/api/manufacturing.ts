import apiClient from './client';
import type { TechMap, TechOperation, PaginatedResponse, ListParams } from '@/types';

export const techMapApi = {
  getAll: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<TechMap>>('/tech-maps', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<TechMap>(`/tech-maps/${id}`).then((r) => r.data),

  create: (data: any) =>
    apiClient.post<TechMap>('/tech-maps', data).then((r) => r.data),

  update: (id: string, data: any) =>
    apiClient.put<TechMap>(`/tech-maps/${id}`, data).then((r) => r.data),

  toggleActive: (id: string) =>
    apiClient.patch(`/tech-maps/${id}/toggle-active`).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/tech-maps/${id}`).then((r) => r.data),
};

export const techOperationApi = {
  getAll: (params?: ListParams & { status?: string; priority?: string }) =>
    apiClient.get<PaginatedResponse<TechOperation>>('/tech-operations', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<TechOperation>(`/tech-operations/${id}`).then((r) => r.data),

  create: (data: any) =>
    apiClient.post<TechOperation>('/tech-operations', data).then((r) => r.data),

  update: (id: string, data: any) =>
    apiClient.put<TechOperation>(`/tech-operations/${id}`, data).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/tech-operations/${id}/status`, { status }).then((r) => r.data),

  toggleStepDone: (id: string, stepId: string, done: boolean) =>
    apiClient.patch(`/tech-operations/${id}/steps/toggle`, { stepId, done }).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/tech-operations/${id}`).then((r) => r.data),
};
