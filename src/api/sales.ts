import apiClient from './client';
import type { SalesOrder, Return, PriceList, PaginatedResponse, ListParams } from '@/types';

export const salesApi = {
  /** Заказы на продажу */
  getOrders: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<SalesOrder>>('/sales', { params }).then((r) => r.data),

  getOrder: (id: string) =>
    apiClient.get<SalesOrder>(`/sales/${id}`).then((r) => r.data),

  createOrder: (data: Partial<SalesOrder>) =>
    apiClient.post<SalesOrder>('/sales', data).then((r) => r.data),

  updateOrder: (id: string, data: Partial<SalesOrder>) =>
    apiClient.patch<SalesOrder>(`/sales/${id}`, data).then((r) => r.data),

  deleteOrder: (id: string) =>
    apiClient.delete(`/sales/${id}`).then((r) => r.data),

  confirmOrder: (id: string) =>
    apiClient.post(`/sales/${id}/confirm`).then((r) => r.data),

  shipOrder: (id: string) =>
    apiClient.post(`/sales/${id}/ship`).then((r) => r.data),

  /** Возвраты */
  getReturns: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Return>>('/returns', { params }).then((r) => r.data),

  getReturn: (id: string) =>
    apiClient.get<Return>(`/returns/${id}`).then((r) => r.data),

  createReturn: (data: Partial<Return>) =>
    apiClient.post<Return>('/returns', data).then((r) => r.data),

  approveReturn: (id: string) =>
    apiClient.post(`/returns/${id}/approve`).then((r) => r.data),

  /** Прайс-листы */
  getPriceLists: () =>
    apiClient.get<PriceList[]>('/price-lists').then((r) => r.data),

  createPriceList: (data: Partial<PriceList>) =>
    apiClient.post<PriceList>('/price-lists', data).then((r) => r.data),

  updatePriceList: (id: string, data: Partial<PriceList>) =>
    apiClient.patch<PriceList>(`/price-lists/${id}`, data).then((r) => r.data),

  deletePriceList: (id: string) =>
    apiClient.delete(`/price-lists/${id}`).then((r) => r.data),
};
