import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/api/finance';
import type { ListParams, FinanceAccount, Transaction } from '@/types';

export function useFinanceAccounts() {
  return useQuery({
    queryKey: ['finance-accounts'],
    queryFn: () => financeApi.getAccounts(),
  });
}

export function useCreateFinanceAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FinanceAccount>) => financeApi.createAccount(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finance-accounts'] }),
  });
}

export function useTransactions(params?: ListParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => financeApi.getTransactions(params),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Transaction>) => financeApi.createTransaction(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['finance-accounts'] });
    },
  });
}

export function useTransactionCategories() {
  return useQuery({
    queryKey: ['transaction-categories'],
    queryFn: () => financeApi.getCategories(),
  });
}

export function usePnLReport(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['finance-reports', 'pnl', params],
    queryFn: () => financeApi.getPnLReport(params),
  });
}

export function useCashFlowReport(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['finance-reports', 'cash-flow', params],
    queryFn: () => financeApi.getCashFlowReport(params),
  });
}
