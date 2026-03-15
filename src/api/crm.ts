import apiClient from './client';
import type {
  Customer, Deal, Pipeline, Activity, Task, Comment,
  PaginatedResponse, ListParams,
} from '@/types';

export const crmApi = {
  /** Клиенты */
  getCustomers: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Customer>>('/customers', { params }).then((r) => r.data),

  getCustomer: (id: string) =>
    apiClient.get<Customer>(`/customers/${id}`).then((r) => r.data),

  createCustomer: (data: Partial<Customer>) =>
    apiClient.post<Customer>('/customers', data).then((r) => r.data),

  updateCustomer: (id: string, data: Partial<Customer>) =>
    apiClient.patch<Customer>(`/customers/${id}`, data).then((r) => r.data),

  deleteCustomer: (id: string) =>
    apiClient.delete(`/customers/${id}`).then((r) => r.data),

  /** Сделки */
  getDeals: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Deal>>('/deals', { params }).then((r) => r.data),

  getDeal: (id: string) =>
    apiClient.get<Deal>(`/deals/${id}`).then((r) => r.data),

  createDeal: (data: Partial<Deal>) =>
    apiClient.post<Deal>('/deals', data).then((r) => r.data),

  updateDeal: (id: string, data: Partial<Deal>) =>
    apiClient.patch<Deal>(`/deals/${id}`, data).then((r) => r.data),

  deleteDeal: (id: string) =>
    apiClient.delete(`/deals/${id}`).then((r) => r.data),

  moveDeal: (id: string, stageId: string) =>
    apiClient.patch(`/deals/${id}/stage`, { stageId }).then((r) => r.data),

  /** Воронки */
  getPipelines: () =>
    apiClient.get<Pipeline[]>('/pipelines').then((r) => r.data),

  getPipeline: (id: string) =>
    apiClient.get<Pipeline>(`/pipelines/${id}`).then((r) => r.data),

  createPipeline: (data: Partial<Pipeline>) =>
    apiClient.post<Pipeline>('/pipelines', data).then((r) => r.data),

  updatePipeline: (id: string, data: Partial<Pipeline>) =>
    apiClient.patch<Pipeline>(`/pipelines/${id}`, data).then((r) => r.data),

  deletePipeline: (id: string) =>
    apiClient.delete(`/pipelines/${id}`).then((r) => r.data),

  /** Активности */
  getActivities: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Activity>>('/activities', { params }).then((r) => r.data),

  createActivity: (data: Partial<Activity>) =>
    apiClient.post<Activity>('/activities', data).then((r) => r.data),

  updateActivity: (id: string, data: Partial<Activity>) =>
    apiClient.patch<Activity>(`/activities/${id}`, data).then((r) => r.data),

  completeActivity: (id: string) =>
    apiClient.post(`/activities/${id}/complete`).then((r) => r.data),

  /** Задачи */
  getTasks: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<Task>>('/tasks', { params }).then((r) => r.data),

  getTask: (id: string) =>
    apiClient.get<Task>(`/tasks/${id}`).then((r) => r.data),

  createTask: (data: Partial<Task>) =>
    apiClient.post<Task>('/tasks', data).then((r) => r.data),

  updateTask: (id: string, data: Partial<Task>) =>
    apiClient.patch<Task>(`/tasks/${id}`, data).then((r) => r.data),

  deleteTask: (id: string) =>
    apiClient.delete(`/tasks/${id}`).then((r) => r.data),

  /** Комментарии */
  getComments: (dealId: string) =>
    apiClient.get<Comment[]>(`/deals/${dealId}/comments`).then((r) => r.data),

  addComment: (dealId: string, text: string) =>
    apiClient.post<Comment>(`/deals/${dealId}/comments`, { text }).then((r) => r.data),
};
