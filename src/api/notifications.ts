import apiClient from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  getAll: (params?: { limit?: number }): Promise<Notification[]> =>
    apiClient.get('/notifications', { params }).then((r) => r.data),
  markAsRead: (id: string): Promise<void> =>
    apiClient.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: (): Promise<void> =>
    apiClient.put('/notifications/read-all').then((r) => r.data),
};
