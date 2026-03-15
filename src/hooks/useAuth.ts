import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

/** Хук проверки авторизации при загрузке */
export function useAuthCheck() {
  const { setAuth, logout, setLoading } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        setLoading(false);
        return null;
      }
      try {
        const data = await authApi.refresh(refreshToken);
        setAuth(data.user, data.tokens);
        return data.user;
      } catch {
        logout();
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
  });
}

/** Хук входа */
export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      navigate('/');
    },
  });
}

/** Хук регистрации */
export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      companyName: string;
    }) => authApi.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      navigate('/');
    },
  });
}

/** Хук выхода */
export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return () => {
    logout();
    navigate('/login');
  };
}

/** Хук восстановления пароля */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}
