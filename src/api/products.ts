import apiClient from './client';
import type { Product, Category, Unit, PaginatedResponse, ListParams } from '@/types';

export const productsApi = {
  getAll: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (data: Partial<Product>) =>
    apiClient.post<Product>('/products', data).then((r) => r.data),

  update: (id: string, data: Partial<Product>) =>
    apiClient.patch<Product>(`/products/${id}`, data).then((r) => r.data),

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
