import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForgotPassword } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Введите корректный email'),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const mutation = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: ForgotForm) => {
    mutation.mutate(data.email);
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
          <CardTitle className="text-xl">Восстановление пароля</CardTitle>
          <CardDescription>
            Введите email, указанный при регистрации
          </CardDescription>
        </CardHeader>
        {mutation.isSuccess ? (
          <CardContent className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Инструкции по восстановлению пароля отправлены на вашу почту.
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@company.ru" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Отправить ссылку
              </Button>
            </CardFooter>
          </form>
        )}
        <div className="px-6 pb-6">
          <Link to="/login" className="inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Вернуться ко входу
          </Link>
        </div>
      </Card>
    </div>
  );
}
