import React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCompanySettings, useUpdateCompanySettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: org, isLoading } = useCompanySettings();
  const updateOrg = useUpdateCompanySettings();

  const { register, handleSubmit } = useForm({
    values: org ? { name: org.name, inn: org.inn || '', kpp: org.kpp || '', legalAddress: org.legalAddress || '', phone: org.phone || '', email: org.email || '' } : undefined,
  });

  const onSubmit = (data: Record<string, string>) => {
    updateOrg.mutate(data, { onSuccess: () => toast.success('Настройки сохранены') });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold">Настройки</h1><p className="text-muted-foreground">Настройки компании</p></div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Компания</CardTitle><CardDescription>Основные данные вашей компании</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Название компании</Label><Input {...register('name')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>ИНН</Label><Input {...register('inn')} /></div>
              <div className="space-y-2"><Label>КПП</Label><Input {...register('kpp')} /></div>
            </div>
            <div className="space-y-2"><Label>Юридический адрес</Label><Input {...register('legalAddress')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Телефон</Label><Input {...register('phone')} /></div>
              <div className="space-y-2"><Label>Email</Label><Input {...register('email')} /></div>
            </div>
            <Separator />
            <Button type="submit" disabled={updateOrg.isPending}>
              {updateOrg.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
