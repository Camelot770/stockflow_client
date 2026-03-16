import apiClient from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  getAll: (params?: { limit?: number; page?: number }): Promise<any> =>
    apiClient.get('/notifications', { params }).then((r) => r.data),

  getUnreadCount: (): Promise<number> =>
    apiClient.get('/notifications/unread-count').then((r) => {
      const data = r.data;
      return typeof data === 'number' ? data : (data as any)?.count ?? 0;
    }),

  markAsRead: (ids: string[]): Promise<void> =>
    apiClient.post('/notifications/mark-read', { ids }).then((r) => r.data),

  markAllAsRead: (): Promise<void> =>
    apiClient.post('/notifications/mark-all-read').then((r) => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/notifications/${id}`).then((r) => r.data),
};
