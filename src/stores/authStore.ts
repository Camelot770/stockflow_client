import { create } from 'zustand';
import type { User, AuthTokens } from '@/types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, tokens) => {
    localStorage.setItem('refreshToken', tokens.refreshToken);
    set({ user, tokens, isAuthenticated: true, isLoading: false });
  },

  setTokens: (tokens) => {
    localStorage.setItem('refreshToken', tokens.refreshToken);
    set({ tokens });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('refreshToken');
    set({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
