import apiClient from './client';
import type { AuthResponse } from '@/types';

// Backend возвращает { success: true, data: { ... } } — достаём .data.data
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }).then((r) => r.data.data as AuthResponse),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }).then((r) => r.data.data as AuthResponse),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }).then((r) => r.data),

  me: () => apiClient.get('/auth/me').then((r) => r.data.data),
};
