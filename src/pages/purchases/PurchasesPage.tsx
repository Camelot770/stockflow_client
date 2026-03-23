import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { usePurchaseOrders } from '@/hooks/usePurchases';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { PurchaseOrder } from '@/types';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' }> = {
  DRAFT: { label: 'Черновик', variant: 'secondary' },
  SENT: { label: 'Отправлен', variant: 'default' },
  CONFIRMED: { label: 'Подтверждён', variant: 'default' },
  PARTIALLY_RECEIVED: { label: 'Частично', variant: 'warning' },
  RECEIVED: { label: 'Получено', variant: 'success' },
  CANCELLED: { label: 'Отменено', variant: 'destructive' },
};

const columns: ColumnDef<PurchaseOrder, unknown>[] = [
  { accessorKey: 'number', header: '№ заказа' },
  {
    accessorKey: 'supplier.name',
    header: 'Поставщик',
    cell: ({ row }) => row.original.supplier?.name || '-',
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const s = statusMap[row.original.status];
      return <Badge variant={s?.variant}>{s?.label}</Badge>;
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Сумма',
    cell: ({ row }) => formatCurrency(row.original.totalAmount ?? 0),
  },
  {
    id: 'items',
    header: 'Позиций',
    cell: ({ row }) => (row.original as any)._count?.items ?? row.original.items?.length ?? 0,
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата',
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [params] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = usePurchaseOrders(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Закупки</h1>
          <p className="text-muted-foreground">Заказы поставщикам</p>
        </div>
        <Button onClick={() => navigate('/purchases/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Новая закупка
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        searchPlaceholder="Поиск по номеру..."
        searchColumn="number"
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/purchases/${row.id}`)}
      />
    </div>
  );
}
