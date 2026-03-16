import apiClient from './client';
import type { AxiosResponse } from 'axios';

export const exportApi = {
  exportProducts: (): Promise<AxiosResponse<Blob>> =>
    apiClient.get('/export/products', { responseType: 'blob' }),
  exportCustomers: (): Promise<AxiosResponse<Blob>> =>
    apiClient.get('/export/customers', { responseType: 'blob' }),
  exportDeals: (): Promise<AxiosResponse<Blob>> =>
    apiClient.get('/export/deals', { responseType: 'blob' }),
  exportTransactions: (): Promise<AxiosResponse<Blob>> =>
    apiClient.get('/export/transactions', { responseType: 'blob' }),
  exportSalesOrders: (): Promise<AxiosResponse<Blob>> =>
    apiClient.get('/export/sales-orders', { responseType: 'blob' }),
};
