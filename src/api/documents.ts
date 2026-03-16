import apiClient from './client';
import type { Document } from '@/types';

export const documentsApi = {
  getAll: (params?: Record<string, any>) =>
    apiClient.get('/documents', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Document>(`/documents/${id}`).then((r) => r.data),

  create: (data: { type: string; number: string; relatedOrderId?: string; relatedOrderType?: string }) =>
    apiClient.post<Document>('/documents', data).then((r) => r.data),

  update: (id: string, data: Partial<Document>) =>
    apiClient.put<Document>(`/documents/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/documents/${id}`).then((r) => r.data),
};
