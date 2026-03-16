import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { rbacApi, type CustomRole } from '@/api/rbac';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

/** Группы разрешений */
const PERMISSION_GROUPS = [
  {
    group: 'Товары',
    permissions: [
      { key: 'products.view', label: 'Просмотр' },
      { key: 'products.create', label: 'Создание' },
      { key: 'products.edit', label: 'Редактирование' },
      { key: 'products.delete', label: 'Удаление' },
    ],
  },
  {
    group: 'Склад',
    permissions: [
      { key: 'warehouse.view', label: 'Просмотр' },
      { key: 'warehouse.manage', label: 'Управление' },
    ],
  },
  {
    group: 'Продажи',
    permissions: [
      { key: 'sales.view', label: 'Просмотр' },
      { key: 'sales.create', label: 'Создание' },
      { key: 'sales.manage', label: 'Управление' },
    ],
  },
  {
    group: 'Закупки',
    permissions: [
      { key: 'purchases.view', label: 'Просмотр' },
      { key: 'purchases.create', label: 'Создание' },
      { key: 'purchases.manage', label: 'Управление' },
    ],
  },
  {
    group: 'CRM',
    permissions: [
      { key: 'crm.view', label: 'Просмотр' },
      { key: 'crm.manage', label: 'Управление' },
    ],
  },
  {
    group: 'Финансы',
    permissions: [
      { key: 'finance.view', label: 'Просмотр' },
      { key: 'finance.manage', label: 'Управление' },
    ],
  },
  {
    group: 'Настройки',
    permissions: [
      { key: 'settings.view', label: 'Просмотр' },
      { key: 'settings.manage', label: 'Управление' },
    ],
  },
  {
    group: 'Пользователи',
    permissions: [
      { key: 'users.view', label: 'Просмотр' },
      { key: 'users.manage', label: 'Управление' },
    ],
  },
  {
    group: 'Отчёты',
    permissions: [
      { key: 'reports.view', label: 'Просмотр' },
    ],
  },
  {
    group: 'Экспорт',
    permissions: [
      { key: 'export.allowed', label: 'Разрешён' },
    ],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key));

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

const emptyForm: RoleFormData = { name: '', description: '', permissions: [] };

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [form, setForm] = useState<RoleFormData>(emptyForm);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: roles = [], isLoading } = useQuery<CustomRole[]>({
    queryKey: ['rbac-roles'],
    queryFn: rbacApi.getRoles,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; permissions: string[] }) =>
      rbacApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      toast.success('Роль создана');
      closeDialog();
    },
    onError: () => toast.error('Ошибка при создании роли'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; permissions?: string[] } }) =>
      rbacApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      toast.success('Роль обновлена');
      closeDialog();
    },
    onError: () => toast.error('Ошибка при обновлении роли'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rbacApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles'] });
      toast.success('Роль удалена');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Ошибка при удалении роли'),
  });

  function openCreate() {
    setEditingRole(null);
    setForm(emptyForm);
    setShowDialog(true);
  }

  function openEdit(role: CustomRole) {
    setEditingRole(role);
    setForm({
      name: role.name,
      description: role.description || '',
      permissions: [...role.permissions],
    });
    setShowDialog(true);
  }

  function closeDialog() {
    setShowDialog(false);
    setEditingRole(null);
    setForm(emptyForm);
  }

  function handleSave() {
    const payload = {
      name: form.name,
      description: form.description || undefined,
      permissions: form.permissions,
    };
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function togglePermission(key: string) {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  }

  function toggleGroupAll(groupPermissions: string[]) {
    const allSelected = groupPermissions.every(p => form.permissions.includes(p));
    setForm(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !groupPermissions.includes(p))
        : [...new Set([...prev.permissions, ...groupPermissions])],
    }));
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Роли и права</h1>
          <p className="text-muted-foreground">Управление ролями и разрешениями пользователей</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Создать роль
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Название</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Пользователей</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Создана</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Нет ролей. Создайте первую роль.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map(role => (
                  <React.Fragment key={role.id}>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell
                        onClick={() =>
                          setExpandedRole(expandedRole === role.id ? null : role.id)
                        }
                      >
                        {expandedRole === role.id ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell
                        className="font-medium"
                        onClick={() =>
                          setExpandedRole(expandedRole === role.id ? null : role.id)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{role._count?.users ?? 0}</Badge>
                      </TableCell>
                      <TableCell>
                        {role.isSystem ? (
                          <Badge variant="outline">Системная</Badge>
                        ) : (
                          <Badge variant="secondary">Пользовательская</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(role.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(role)}
                            disabled={role.isSystem}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {deleteConfirm === role.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteMutation.mutate(role.id)}
                                disabled={deleteMutation.isPending}
                              >
                                Да
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                Нет
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirm(role.id)}
                              disabled={role.isSystem}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded permissions view */}
                    {expandedRole === role.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30 px-8 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {PERMISSION_GROUPS.map(group => (
                              <div key={group.group}>
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                  {group.group}
                                </p>
                                <div className="space-y-1">
                                  {group.permissions.map(perm => (
                                    <div key={perm.key} className="flex items-center gap-2">
                                      {role.permissions.includes(perm.key) ? (
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                      ) : (
                                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                      )}
                                      <span className="text-xs">{perm.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Редактировать роль' : 'Создать роль'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Например: Старший менеджер"
              />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Описание роли и её назначения"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Разрешения</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const allSelected = ALL_PERMISSION_KEYS.every(p =>
                      form.permissions.includes(p)
                    );
                    setForm(prev => ({
                      ...prev,
                      permissions: allSelected ? [] : [...ALL_PERMISSION_KEYS],
                    }));
                  }}
                >
                  {ALL_PERMISSION_KEYS.every(p => form.permissions.includes(p))
                    ? 'Снять все'
                    : 'Выбрать все'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PERMISSION_GROUPS.map(group => {
                  const groupKeys = group.permissions.map(p => p.key);
                  const allGroupSelected = groupKeys.every(k =>
                    form.permissions.includes(k)
                  );
                  const someGroupSelected =
                    !allGroupSelected &&
                    groupKeys.some(k => form.permissions.includes(k));

                  return (
                    <div
                      key={group.group}
                      className="rounded-lg border border-border p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={allGroupSelected ? true : someGroupSelected ? 'indeterminate' : false}
                          onCheckedChange={() => toggleGroupAll(groupKeys)}
                        />
                        <span className="text-sm font-medium">{group.group}</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {group.permissions.map(perm => (
                          <div key={perm.key} className="flex items-center gap-2">
                            <Checkbox
                              checked={form.permissions.includes(perm.key)}
                              onCheckedChange={() => togglePermission(perm.key)}
                            />
                            <span className="text-sm">{perm.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || isSaving}>
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
