import apiClient from './client';
import type {
  FinanceAccount, Transaction, TransactionCategory,
  PaginatedResponse, ListParams,
} from '@/types';

export const financeApi = {
  /** Счета */
  getAccounts: () =>
    apiClient.get<FinanceAccount[]>('/accounts').then((r) => r.data),

  getAccount: (id: string) =>
    apiClient.get<FinanceAccount>(`/finance/accounts/${id}`).then((r) => r.data),

  createAccount: (data: Partial<FinanceAccount>) =>
    apiClient.post<FinanceAccount>('/accounts', data).then((r) => r.data),

  updateAccount: (id: string, data: Partial<FinanceAccount>) =>
    apiClient.patch<FinanceAccount>(`/finance/accounts/${id}`, data).then((r) => r.data),

  deleteAccount: (id: string) =>
    apiClient.delete(`/finance/accounts/${id}`).then((r) => r.data),

  /** Транзакции */
  getTransactions: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Transaction>>('/transactions', { params }).then((r) => r.data),

  createTransaction: (data: Partial<Transaction>) =>
    apiClient.post<Transaction>('/transactions', data).then((r) => r.data),

  updateTransaction: (id: string, data: Partial<Transaction>) =>
    apiClient.patch<Transaction>(`/finance/transactions/${id}`, data).then((r) => r.data),

  deleteTransaction: (id: string) =>
    apiClient.delete(`/finance/transactions/${id}`).then((r) => r.data),

  /** Категории транзакций */
  getCategories: () =>
    apiClient.get<TransactionCategory[]>('/finance-categories').then((r) => r.data),

  createCategory: (data: Partial<TransactionCategory>) =>
    apiClient.post<TransactionCategory>('/finance-categories', data).then((r) => r.data),

  /** Отчёты */
  getPnLReport: (params?: { from?: string; to?: string }) =>
    apiClient.get('/analytics/profit-loss', { params }).then((r) => r.data),

  getCashFlowReport: (params?: { from?: string; to?: string }) =>
    apiClient.get('/analytics/cash-flow', { params }).then((r) => r.data),

  getReceivables: () =>
    apiClient.get('/analytics/receivables').then((r) => r.data),

  getPayables: () =>
    apiClient.get('/analytics/payables').then((r) => r.data),
};
