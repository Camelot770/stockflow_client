import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().min(1, 'Введите логин'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const loginMutation = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              StockFlow
            </h1>
          </div>
          <CardTitle className="text-xl">Вход в систему</CardTitle>
          <CardDescription>
            Введите данные для входа в аккаунт
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Логин</Label>
              <Input
                id="email"
                type="text"
                placeholder="Введите логин"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Забыли пароль?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
            {loginMutation.isError && (
              <p className="text-sm text-red-500 text-center">
                Неверный email или пароль
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Войти
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
