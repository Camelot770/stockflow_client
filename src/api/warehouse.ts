import apiClient from './client';
import type { Warehouse, StockItem, StockOperation, PaginatedResponse, ListParams } from '@/types';

export const warehouseApi = {
  /** Склады */
  getWarehouses: () =>
    apiClient.get<Warehouse[]>('/warehouses').then((r) => r.data),

  getWarehouse: (id: string) =>
    apiClient.get<Warehouse>(`/warehouses/${id}`).then((r) => r.data),

  createWarehouse: (data: Partial<Warehouse>) =>
    apiClient.post<Warehouse>('/warehouses', data).then((r) => r.data),

  updateWarehouse: (id: string, data: Partial<Warehouse>) =>
    apiClient.patch<Warehouse>(`/warehouses/${id}`, data).then((r) => r.data),

  deleteWarehouse: (id: string) =>
    apiClient.delete(`/warehouses/${id}`).then((r) => r.data),

  /** Остатки */
  getStock: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<StockItem>>('/stock', { params }).then((r) => r.data),

  getStockByWarehouse: (warehouseId: string, params?: ListParams) =>
    apiClient.get<PaginatedResponse<StockItem>>(`/stock/warehouse/${warehouseId}`, { params }).then((r) => r.data),

  /** Складские операции */
  getOperations: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<StockOperation>>('/stock/operations', { params }).then((r) => r.data),

  getOperation: (id: string) =>
    apiClient.get<StockOperation>(`/stock/operations/${id}`).then((r) => r.data),

  createOperation: (data: Partial<StockOperation>) =>
    apiClient.post<StockOperation>('/stock/operations', data).then((r) => r.data),

  updateOperation: (id: string, data: Partial<StockOperation>) =>
    apiClient.patch<StockOperation>(`/stock/operations/${id}`, data).then((r) => r.data),

  completeOperation: (id: string) =>
    apiClient.post(`/stock/operations/${id}/complete`).then((r) => r.data),

  cancelOperation: (id: string) =>
    apiClient.post(`/stock/operations/${id}/cancel`).then((r) => r.data),

  /** Инвентаризация */
  getInventory: (params?: ListParams) =>
    apiClient.get('/stock/inventory', { params }).then((r) => r.data),

  createInventory: (data: { warehouseId: string; items: { productId: string; actualQuantity: number }[] }) =>
    apiClient.post('/stock/inventory', data).then((r) => r.data),
};
