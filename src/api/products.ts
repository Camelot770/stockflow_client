import apiClient from './client';
import type { Product, Category, Unit, PaginatedResponse, ListParams } from '@/types';

/** Map backend product fields to frontend Product interface */
function mapProduct(raw: any): Product {
  if (!raw) return raw;
  return {
    ...raw,
    purchasePrice: parseFloat(raw.costPrice) || raw.purchasePrice || 0,
    sellingPrice: parseFloat(raw.retailPrice) || raw.sellingPrice || 0,
    totalStock: Array.isArray(raw.stockEntries)
      ? raw.stockEntries.reduce((sum: number, e: any) => sum + (e.quantity ?? 0), 0)
      : raw.totalStock ?? 0,
  };
}

export const productsApi = {
  getAll: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params }).then((r) => {
      const res = r.data as any;
      if (Array.isArray(res?.data)) {
        res.data = res.data.map(mapProduct);
      } else if (Array.isArray(res)) {
        return res.map(mapProduct);
      }
      return res;
    }),

  getById: (id: string) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => mapProduct(r.data)),

  create: (data: Partial<Product>) =>
    apiClient.post<Product>('/products', {
      ...data,
      costPrice: data.purchasePrice,
      retailPrice: data.sellingPrice,
    }).then((r) => mapProduct(r.data)),

  update: (id: string, data: Partial<Product>) =>
    apiClient.patch<Product>(`/products/${id}`, {
      ...data,
      costPrice: data.purchasePrice ?? (data as any).costPrice,
      retailPrice: data.sellingPrice ?? (data as any).retailPrice,
    }).then((r) => mapProduct(r.data)),

  delete: (id: string) =>
    apiClient.delete(`/products/${id}`).then((r) => r.data),

  bulkDelete: (ids: string[]) =>
    apiClient.post('/products/bulk-delete', { ids }).then((r) => r.data),

  importProducts: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post('/products/import', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  exportProducts: (params?: ListParams) =>
    apiClient.get('/products/export', { params, responseType: 'blob' }).then((r) => r.data),

  getMovements: (productId: string, params?: ListParams) =>
    apiClient.get(`/products/${productId}/movements`, { params }).then((r) => r.data),

  /** Категории */
  getCategories: () =>
    apiClient.get<Category[]>('/categories').then((r) => r.data),

  createCategory: (data: Partial<Category>) =>
    apiClient.post<Category>('/categories', data).then((r) => r.data),

  updateCategory: (id: string, data: Partial<Category>) =>
    apiClient.patch<Category>(`/categories/${id}`, data).then((r) => r.data),

  deleteCategory: (id: string) =>
    apiClient.delete(`/categories/${id}`).then((r) => r.data),

  /** Единицы измерения */
  getUnits: () =>
    apiClient.get<Unit[]>('/units').then((r) => r.data),

  createUnit: (data: Partial<Unit>) =>
    apiClient.post<Unit>('/units', data).then((r) => r.data),

  deleteUnit: (id: string) =>
    apiClient.delete(`/units/${id}`).then((r) => r.data),
};
