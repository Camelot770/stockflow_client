import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { useStockMovements } from '@/hooks/useWarehouse';
import { formatDate } from '@/lib/utils';

interface StockMovementRow {
  id: string;
  type: string;
  quantity: number;
  reason?: string;
  createdAt: string;
  product?: { id: string; name: string; sku: string };
  warehouse?: { id: string; name: string };
  fromWarehouse?: { id: string; name: string } | null;
  toWarehouse?: { id: string; name: string } | null;
  user?: { firstName: string; lastName: string };
}

const typeLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' }> = {
  INCOMING: { label: 'Приёмка', variant: 'success' },
  OUTGOING: { label: 'Отгрузка', variant: 'destructive' },
  TRANSFER: { label: 'Перемещение', variant: 'default' },
  ADJUSTMENT: { label: 'Корректировка', variant: 'secondary' },
};

const columns: ColumnDef<StockMovementRow, unknown>[] = [
  {
    accessorKey: 'type',
    header: 'Тип',
    cell: ({ row }) => {
      const t = typeLabels[row.original.type];
      return <Badge variant={t?.variant || 'secondary'}>{t?.label || row.original.type}</Badge>;
    },
  },
  {
    id: 'product',
    header: 'Товар',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.product?.name || '-'}</p>
        <p className="text-xs text-muted-foreground">{row.original.product?.sku || ''}</p>
      </div>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Количество',
    cell: ({ row }) => {
      const qty = row.original.quantity;
      return (
        <span className={qty > 0 ? 'text-green-600 font-medium' : qty < 0 ? 'text-red-600 font-medium' : ''}>
          {qty > 0 ? `+${qty}` : qty}
        </span>
      );
    },
  },
  {
    id: 'warehouse',
    header: 'Склад',
    cell: ({ row }) => {
      const from = row.original.fromWarehouse?.name;
      const to = row.original.toWarehouse?.name;
      if (from && to) return `${from} → ${to}`;
      return row.original.warehouse?.name || to || from || '-';
    },
  },
  {
    id: 'user',
    header: 'Пользователь',
    cell: ({ row }) => {
      const u = row.original.user;
      return u ? `${u.firstName} ${u.lastName}` : '-';
    },
  },
  {
    accessorKey: 'reason',
    header: 'Примечание',
    cell: ({ row }) => row.original.reason || '-',
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
  const { data, isLoading } = useStockMovements(params);

  const movements = (() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.data)) return (data as any).data;
    return [];
  })();

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
        data={movements}
        searchPlaceholder="Поиск..."
        isLoading={isLoading}
      />
    </div>
  );
}
