import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DataTable } from '@/components/shared/DataTable';
import { useSuppliers, useCreateSupplier } from '@/hooks/usePurchases';
import { toast } from 'sonner';
import type { Supplier } from '@/types';

const columns: ColumnDef<Supplier, unknown>[] = [
  { accessorKey: 'name', header: 'Название' },
  { accessorKey: 'contactPerson', header: 'Контактное лицо', cell: ({ row }) => row.original.contactPerson || '-' },
  { accessorKey: 'phone', header: 'Телефон', cell: ({ row }) => row.original.phone || '-' },
  { accessorKey: 'email', header: 'Email', cell: ({ row }) => row.original.email || '-' },
  {
    accessorKey: 'isActive',
    header: 'Статус',
    cell: ({ row }) => <Badge variant={row.original.isActive !== false ? 'success' : 'secondary'}>{row.original.isActive !== false ? 'Активен' : 'Неактивен'}</Badge>,
  },
];

export default function SuppliersPage() {
  const [params] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useSuppliers(params);
  const createSupplier = useCreateSupplier();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '' });

  const handleCreate = () => {
    const payload: Record<string, unknown> = {
      name: form.name,
      contactPerson: form.contactPerson || undefined,
      phone: form.phone || undefined,
      email: form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? form.email : undefined,
      legalAddress: form.address || undefined,
    };
    createSupplier.mutate(payload as any, {
      onSuccess: () => { toast.success('Поставщик создан'); setShowCreate(false); setForm({ name: '', contactPerson: '', phone: '', email: '', address: '' }); },
      onError: (err: any) => { toast.error(err?.response?.data?.error?.message || 'Ошибка создания поставщика'); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Поставщики</h1>
          <p className="text-muted-foreground">Управление поставщиками</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Добавить</Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} searchPlaceholder="Поиск поставщиков..." searchColumn="name" isLoading={isLoading} />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новый поставщик</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Название *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Контактное лицо</Label><Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Телефон</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Адрес</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={!form.name}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
