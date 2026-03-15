import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { useStockOperations } from '@/hooks/useWarehouse';
import { formatDate } from '@/lib/utils';
import type { StockOperation } from '@/types';

const typeLabels: Record<string, string> = {
  receipt: 'Приёмка',
  shipment: 'Отгрузка',
  transfer: 'Перемещение',
  writeoff: 'Списание',
  adjustment: 'Корректировка',
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' }> = {
  draft: { label: 'Черновик', variant: 'secondary' },
  confirmed: { label: 'Подтверждено', variant: 'default' },
  completed: { label: 'Выполнено', variant: 'success' },
  cancelled: { label: 'Отменено', variant: 'destructive' },
};

const columns: ColumnDef<StockOperation, unknown>[] = [
  { accessorKey: 'number', header: '№' },
  {
    accessorKey: 'type',
    header: 'Тип',
    cell: ({ row }) => typeLabels[row.original.type] || row.original.type,
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const s = statusLabels[row.original.status];
      return <Badge variant={s?.variant || 'secondary'}>{s?.label || row.original.status}</Badge>;
    },
  },
  {
    id: 'warehouse',
    header: 'Склад',
    cell: ({ row }) => {
      const from = row.original.warehouseFrom?.name;
      const to = row.original.warehouseTo?.name;
      if (from && to) return `${from} -> ${to}`;
      return to || from || '-';
    },
  },
  {
    id: 'items',
    header: 'Позиций',
    cell: ({ row }) => row.original.items?.length || 0,
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата',
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

export default function OperationsPage() {
  const navigate = useNavigate();
  const [params] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useStockOperations(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Складские операции</h1>
          <p className="text-muted-foreground">Приёмка, отгрузка, перемещение, списание</p>
        </div>
        <Button onClick={() => navigate('/warehouse/operations/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Новая операция
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        searchPlaceholder="Поиск по номеру..."
        searchColumn="number"
        isLoading={isLoading}
      />
    </div>
  );
}
