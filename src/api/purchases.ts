import apiClient from './client';
import type { Supplier, PurchaseOrder, PaginatedResponse, ListParams } from '@/types';

export const purchasesApi = {
  /** Поставщики */
  getSuppliers: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Supplier>>('/suppliers', { params }).then((r) => r.data),

  getSupplier: (id: string) =>
    apiClient.get<Supplier>(`/suppliers/${id}`).then((r) => r.data),

  createSupplier: (data: Partial<Supplier>) =>
    apiClient.post<Supplier>('/suppliers', data).then((r) => r.data),

  updateSupplier: (id: string, data: Partial<Supplier>) =>
    apiClient.patch<Supplier>(`/suppliers/${id}`, data).then((r) => r.data),

  deleteSupplier: (id: string) =>
    apiClient.delete(`/suppliers/${id}`).then((r) => r.data),

  /** Заказы на закупку */
  getOrders: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<PurchaseOrder>>('/purchase-orders', { params }).then((r) => r.data),

  getOrder: (id: string) =>
    apiClient.get<PurchaseOrder>(`/purchases/${id}`).then((r) => r.data),

  createOrder: (data: Partial<PurchaseOrder>) =>
    apiClient.post<PurchaseOrder>('/purchase-orders', data).then((r) => r.data),

  updateOrder: (id: string, data: Partial<PurchaseOrder>) =>
    apiClient.patch<PurchaseOrder>(`/purchases/${id}`, data).then((r) => r.data),

  deleteOrder: (id: string) =>
    apiClient.delete(`/purchases/${id}`).then((r) => r.data),

  receiveOrder: (id: string, items: { productId: string; quantity: number }[]) =>
    apiClient.post(`/purchases/${id}/receive`, { items }).then((r) => r.data),
};
