import apiClient from './client';
import type { Warehouse, StockItem, StockOperation, PaginatedResponse, ListParams, StockMovement } from '@/types';

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

  /** Складские операции — отдельные эндпоинты */
  getMovements: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<StockMovement>>('/stock/movements', { params }).then((r) => r.data),

  /** Приёмка товара на склад */
  createIncoming: (data: { warehouseId: string; productId: string; quantity: number; reason?: string }) =>
    apiClient.post('/stock/incoming', data).then((r) => r.data),

  /** Отгрузка товара со склада */
  createOutgoing: (data: { warehouseId: string; productId: string; quantity: number; reason?: string }) =>
    apiClient.post('/stock/outgoing', data).then((r) => r.data),

  /** Перемещение между складами */
  createTransfer: (data: { fromWarehouseId: string; toWarehouseId: string; productId: string; quantity: number; reason?: string }) =>
    apiClient.post('/stock/transfer', data).then((r) => r.data),

  /**
   * Универсальная операция: разбивает items на отдельные запросы
   * Совместимость со старым интерфейсом OperationCreatePage
   */
  createOperation: async (data: any) => {
    const { type, items, warehouseToId, warehouseFromId, note } = data;
    const results = [];
    for (const item of items) {
      let result;
      if (type === 'receipt') {
        result = await apiClient.post('/stock/incoming', {
          warehouseId: warehouseToId,
          productId: item.productId,
          quantity: item.quantity,
          reason: note || undefined,
        });
      } else if (type === 'shipment' || type === 'writeoff') {
        result = await apiClient.post('/stock/outgoing', {
          warehouseId: warehouseFromId,
          productId: item.productId,
          quantity: item.quantity,
          reason: note || (type === 'writeoff' ? 'Списание' : undefined),
        });
      } else if (type === 'transfer') {
        result = await apiClient.post('/stock/transfer', {
          fromWarehouseId: warehouseFromId,
          toWarehouseId: warehouseToId,
          productId: item.productId,
          quantity: item.quantity,
          reason: note || undefined,
        });
      }
      results.push(result?.data);
    }
    return { success: true, data: results };
  },

  /** Корректировка остатков (инвентаризация) */
  createAdjustment: (data: { warehouseId: string; productId: string; quantity: number; reason: string }) =>
    apiClient.post('/stock/adjustment', data).then((r) => r.data),

  /** Инвентаризация (legacy) */
  getInventory: (params?: ListParams) =>
    apiClient.get('/stock/inventory', { params }).then((r) => r.data),

  createInventory: (data: { warehouseId: string; items: { productId: string; actualQuantity: number }[] }) =>
    apiClient.post('/stock/inventory', data).then((r) => r.data),
};
