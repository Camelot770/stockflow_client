import apiClient from './client';
import type { PriceList, PriceListItem } from '@/types';

export const priceListsApi = {
  getAll: () =>
    apiClient.get<PriceList[]>('/price-lists').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<PriceList>(`/price-lists/${id}`).then((r) => r.data),

  create: (data: { name: string; isDefault?: boolean }) =>
    apiClient.post<PriceList>('/price-lists', data).then((r) => r.data),

  update: (id: string, data: { name?: string; isDefault?: boolean }) =>
    apiClient.put<PriceList>(`/price-lists/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/price-lists/${id}`).then((r) => r.data),

  setItems: (id: string, items: { productId: string; price: number }[]) =>
    apiClient.put<PriceListItem[]>(`/price-lists/${id}/items`, items).then((r) => r.data),
};
