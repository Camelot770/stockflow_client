import apiClient from './client';
import type { CompanySettings, User, AuditLog, PaginatedResponse, ListParams } from '@/types';

export const settingsApi = {
  /** Настройки компании */
  getCompanySettings: () =>
    apiClient.get<CompanySettings>('/company').then((r) => r.data),

  updateCompanySettings: (data: Partial<CompanySettings>) =>
    apiClient.put<CompanySettings>('/company', data).then((r) => r.data),

  /** Пользователи */
  getUsers: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }).then((r) => r.data),

  getUser: (id: string) =>
    apiClient.get<User>(`/users/${id}`).then((r) => r.data),

  createUser: (data: Partial<User> & { password: string }) =>
    apiClient.post<User>('/users', data).then((r) => r.data),

  updateUser: (id: string, data: Partial<User>) =>
    apiClient.patch<User>(`/users/${id}`, data).then((r) => r.data),

  deleteUser: (id: string) =>
    apiClient.delete(`/users/${id}`).then((r) => r.data),

  /** Журнал аудита */
  getAuditLog: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<AuditLog>>('/audit', { params }).then((r) => r.data),

  /** Уведомления */
  getNotifications: () =>
    apiClient.get('/notifications').then((r) => r.data),

  markNotificationRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllNotificationsRead: () =>
    apiClient.post('/notifications/read-all').then((r) => r.data),
};
