import apiClient from './client';

export interface TelegramSettings {
  id: string;
  botToken: string;
  isEnabled: boolean;
  notifyNewDeal: boolean;
  notifyNewOrder: boolean;
  notifyLowStock: boolean;
  notifyTask: boolean;
}

export interface TelegramChat {
  id: string;
  chatId: string;
  userId?: string;
  username?: string;
  firstName?: string;
  isActive: boolean;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

export const telegramApi = {
  getSettings: () => apiClient.get('/telegram/settings').then(r => r.data),
  updateSettings: (data: Partial<TelegramSettings>) =>
    apiClient.put('/telegram/settings', data).then(r => r.data),
  getChats: () => apiClient.get('/telegram/chats').then(r => r.data),
  removeChat: (id: string) =>
    apiClient.delete(`/telegram/chats/${id}`).then(r => r.data),
  sendTest: () => apiClient.post('/telegram/test').then(r => r.data),
};
