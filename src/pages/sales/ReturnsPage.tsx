import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { useReturns } from '@/hooks/useSales';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Return } from '@/types';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' }> = {
  NEW: { label: 'Новый', variant: 'secondary' },
  APPROVED: { label: 'Одобрен', variant: 'default' },
  PROCESSING: { label: 'В обработке', variant: 'warning' },
  COMPLETED: { label: 'Выполнен', variant: 'success' },
  REJECTED: { label: 'Отклонён', variant: 'destructive' },
};

const columns: ColumnDef<Return, unknown>[] = [
  { accessorKey: 'number', header: '№ возврата' },
  { accessorKey: 'salesOrder.number', header: '№ заказа', cell: ({ row }) => row.original.salesOrder?.number || '-' },
  { accessorKey: 'status', header: 'Статус', cell: ({ row }) => { const s = statusMap[row.original.status]; return <Badge variant={s?.variant}>{s?.label}</Badge>; } },
  { accessorKey: 'reason', header: 'Причина' },
  { accessorKey: 'totalAmount', header: 'Сумма', cell: ({ row }) => formatCurrency(row.original.totalAmount ?? 0) },
  { accessorKey: 'createdAt', header: 'Дата', cell: ({ row }) => formatDate(row.original.createdAt) },
];

export default function ReturnsPage() {
  const [params] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useReturns(params);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Возвраты</h1><p className="text-muted-foreground">Возвраты от клиентов</p></div>
      <DataTable columns={columns} data={data?.data || []} searchPlaceholder="Поиск..." isLoading={isLoading} />
    </div>
  );
}
