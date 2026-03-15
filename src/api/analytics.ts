import apiClient from './client';
import type { DashboardStats } from '@/types';

export const analyticsApi = {
  getDashboardStats: () =>
    apiClient.get<DashboardStats>('/analytics/dashboard').then((r) => r.data),

  getSalesAnalytics: (params?: { from?: string; to?: string; groupBy?: string }) =>
    apiClient.get('/analytics/sales', { params }).then((r) => r.data),

  getStockAnalytics: () =>
    apiClient.get('/analytics/stock').then((r) => r.data),

  getAbcAnalysis: () =>
    apiClient.get('/analytics/stock/abc').then((r) => r.data),

  getCrmAnalytics: (params?: { from?: string; to?: string }) =>
    apiClient.get('/analytics/crm', { params }).then((r) => r.data),

  getManagerAnalytics: (params?: { from?: string; to?: string }) =>
    apiClient.get('/analytics/managers', { params }).then((r) => r.data),

  getConversionFunnel: (pipelineId?: string) =>
    apiClient.get('/analytics/crm/funnel', { params: { pipelineId } }).then((r) => r.data),
};
