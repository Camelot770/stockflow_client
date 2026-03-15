import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { useSalesOrders } from '@/hooks/useSales';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { SalesOrder } from '@/types';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' }> = {
  draft: { label: 'Черновик', variant: 'secondary' },
  confirmed: { label: 'Подтверждён', variant: 'default' },
  shipped: { label: 'Отгружен', variant: 'warning' },
  delivered: { label: 'Доставлен', variant: 'success' },
  cancelled: { label: 'Отменён', variant: 'destructive' },
  returned: { label: 'Возврат', variant: 'destructive' },
};

const columns: ColumnDef<SalesOrder, unknown>[] = [
  { accessorKey: 'number', header: '№ заказа' },
  { accessorKey: 'customer.name', header: 'Клиент', cell: ({ row }) => row.original.customer?.name || '-' },
  { accessorKey: 'status', header: 'Статус', cell: ({ row }) => { const s = statusMap[row.original.status]; return <Badge variant={s?.variant}>{s?.label}</Badge>; } },
  { accessorKey: 'totalAmount', header: 'Сумма', cell: ({ row }) => formatCurrency(row.original.totalAmount) },
  { id: 'items', header: 'Позиций', cell: ({ row }) => row.original.items?.length || 0 },
  { accessorKey: 'createdAt', header: 'Дата', cell: ({ row }) => formatDate(row.original.createdAt) },
];

export default function SalesPage() {
  const navigate = useNavigate();
  const [params] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useSalesOrders(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Продажи</h1>
          <p className="text-muted-foreground">Заказы клиентов</p>
        </div>
        <Button onClick={() => navigate('/sales/new')}><Plus className="h-4 w-4 mr-2" />Новая продажа</Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} searchPlaceholder="Поиск по номеру..." searchColumn="number" isLoading={isLoading} onRowClick={(r) => navigate(`/sales/${r.id}`)} />
    </div>
  );
}
