import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import type { Customer } from '@/types';

const columns: ColumnDef<Customer, unknown>[] = [
  { accessorKey: 'name', header: 'Имя / Компания', cell: ({ row }) => (<div><p className="font-medium">{row.original.name}</p>{row.original.companyName && <p className="text-xs text-muted-foreground">{row.original.companyName}</p>}</div>) },
  { accessorKey: 'phone', header: 'Телефон', cell: ({ row }) => row.original.phone || '-' },
  { accessorKey: 'email', header: 'Email', cell: ({ row }) => row.original.email || '-' },
  { accessorKey: 'type', header: 'Тип', cell: ({ row }) => <Badge variant="secondary">{row.original.type === 'company' ? 'Компания' : 'Физлицо'}</Badge> },
  { accessorKey: 'totalOrders', header: 'Заказы', cell: ({ row }) => formatNumber(row.original.totalOrders ?? 0) },
  { accessorKey: 'totalRevenue', header: 'Выручка', cell: ({ row }) => formatCurrency(row.original.totalRevenue ?? 0) },
];

export default function ContactsPage() {
  const navigate = useNavigate();
  const [params] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useCustomers(params);
  const createCustomer = useCreateCustomer();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'individual' as const, email: '', phone: '', companyName: '' });

  const handleCreate = () => {
    createCustomer.mutate(form, {
      onSuccess: () => { toast.success('Контакт создан'); setShowCreate(false); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Контакты</h1><p className="text-muted-foreground">Клиенты и контактные лица</p></div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Добавить контакт</Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} searchPlaceholder="Поиск контактов..." searchColumn="name" isLoading={isLoading} enableRowSelection onRowClick={(r) => navigate(`/crm/contacts/${r.id}`)} />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новый контакт</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Тип</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'individual' | 'company' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="individual">Физлицо</SelectItem><SelectItem value="company">Компания</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Имя *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            {form.type === 'company' && <div className="space-y-2"><Label>Компания</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Телефон</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button><Button onClick={handleCreate} disabled={!form.name}>Создать</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
