import apiClient from './client';

export const reportsApi = {
  getProfitLoss: (start: string, end: string) =>
    apiClient.get('/analytics/profit-loss', { params: { start, end } }).then(r => r.data),
  getSalesByManager: (start: string, end: string) =>
    apiClient.get('/analytics/sales-by-manager', { params: { start, end } }).then(r => r.data),
  getForecast: () =>
    apiClient.get('/analytics/forecast').then(r => r.data),
  getAbcAnalysis: () =>
    apiClient.get('/analytics/abc-analysis').then(r => r.data),
  getCustomerAnalysis: () =>
    apiClient.get('/analytics/customer-analysis').then(r => r.data),
};
