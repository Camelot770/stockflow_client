import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsApi.getDashboardStats(),
  });
}

export function useSalesAnalytics(params?: { from?: string; to?: string; groupBy?: string }) {
  return useQuery({
    queryKey: ['analytics', 'sales', params],
    queryFn: () => analyticsApi.getSalesAnalytics(params),
  });
}

export function useStockAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'stock'],
    queryFn: () => analyticsApi.getStockAnalytics(),
  });
}

export function useAbcAnalysis() {
  return useQuery({
    queryKey: ['analytics', 'abc'],
    queryFn: () => analyticsApi.getAbcAnalysis(),
  });
}

export function useCrmAnalytics(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['analytics', 'crm', params],
    queryFn: () => analyticsApi.getCrmAnalytics(params),
  });
}

export function useManagerAnalytics(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['analytics', 'managers', params],
    queryFn: () => analyticsApi.getManagerAnalytics(params),
  });
}
