import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUsers, useCreateUser } from '@/hooks/useSettings';
import { rbacApi, type CustomRole } from '@/api/rbac';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { User } from '@/types';

const roleLabels: Record<string, string> = {
  OWNER: 'Владелец', ADMIN: 'Администратор', MANAGER: 'Менеджер',
  WAREHOUSE_WORKER: 'Кладовщик', ACCOUNTANT: 'Бухгалтер',
  owner: 'Владелец', admin: 'Администратор', manager: 'Менеджер',
  warehouse_worker: 'Кладовщик', accountant: 'Бухгалтер', viewer: 'Наблюдатель',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useUsers();
  const createUser = useCreateUser();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'MANAGER' as string, customRoleId: '' });

  const { data: customRoles = [] } = useQuery<CustomRole[]>({
    queryKey: ['rbac-roles'],
    queryFn: rbacApi.getRoles,
    retry: false,
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      rbacApi.assignRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Роль назначена');
    },
    onError: () => toast.error('Ошибка назначения роли'),
  });

  const handleCreate = () => {
    const payload = {
      ...form,
      customRoleId: form.customRoleId || undefined,
    };
    createUser.mutate(payload as any, {
      onSuccess: () => {
        toast.success('Пользователь создан');
        setShowCreate(false);
        setForm({ firstName: '', lastName: '', email: '', password: '', role: 'MANAGER', customRoleId: '' });
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error?.message || 'Ошибка при создании пользователя');
      },
    });
  };

  const columns: ColumnDef<User, unknown>[] = [
    {
      id: 'user',
      header: 'Пользователь',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {(row.original.firstName || '?')[0]}{(row.original.lastName || '?')[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.firstName || ''} {row.original.lastName || ''}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Системная роль',
      cell: ({ row }) => <Badge variant="secondary">{roleLabels[row.original.role] || row.original.role}</Badge>,
    },
    {
      id: 'customRole',
      header: 'Роль',
      cell: ({ row }) => {
        const userId = row.original.id;
        const currentRoleId = (row.original as any).customRoleId || '';

        if (customRoles.length === 0) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }

        return (
          <Select
            value={currentRoleId}
            onValueChange={(roleId) => {
              assignRoleMutation.mutate({ userId, roleId });
            }}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Назначить роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Без роли</SelectItem>
              {customRoles.map(role => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {role.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Статус',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'destructive'}>
          {row.original.isActive ? 'Активен' : 'Заблокирован'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Создан',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Пользователи</h1>
          <p className="text-muted-foreground">Управление пользователями и ролями</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />Добавить
        </Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} searchPlaceholder="Поиск..." isLoading={isLoading} />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новый пользователь</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя *</Label>
                <Input placeholder="Имя" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Фамилия *</Label>
                <Input placeholder="Фамилия" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Логин *</Label>
              <Input placeholder="Логин для входа" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Пароль *</Label>
              <Input type="password" placeholder="Минимум 6 символов" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Системная роль</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Администратор</SelectItem>
                  <SelectItem value="MANAGER">Менеджер</SelectItem>
                  <SelectItem value="WAREHOUSE_WORKER">Кладовщик</SelectItem>
                  <SelectItem value="ACCOUNTANT">Бухгалтер</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {customRoles.length > 0 && (
              <div className="space-y-2">
                <Label>Роль доступа</Label>
                <Select value={form.customRoleId || '_none'} onValueChange={(v) => setForm({ ...form, customRoleId: v === '_none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Без роли" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Без роли</SelectItem>
                    {customRoles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={!form.email || !form.password || !form.firstName || !form.lastName || createUser.isPending}>
              {createUser.isPending ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
