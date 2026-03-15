import apiClient from './client';
import type { AuthResponse, AuthTokens } from '@/types';

// Interceptor в client.ts автоматически разворачивает { success, data } → data
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }).then((r) => r.data as AuthResponse),

  // refresh возвращает только токены (без user)
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }).then((r) => r.data as AuthTokens),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }).then((r) => r.data),

  me: () => apiClient.get('/auth/me').then((r) => r.data),
};
