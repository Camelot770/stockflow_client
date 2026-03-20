import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { useStock } from '@/hooks/useWarehouse';
import { formatNumber, formatCurrency } from '@/lib/utils';
import type { StockItem } from '@/types';

const columns: ColumnDef<StockItem, unknown>[] = [
  {
    accessorKey: 'product.name',
    header: 'Товар',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.product?.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.product?.sku}</p>
      </div>
    ),
  },
  {
    accessorKey: 'warehouse.name',
    header: 'Склад',
    cell: ({ row }) => row.original.warehouse?.name || '-',
  },
  {
    accessorKey: 'quantity',
    header: 'На складе',
    cell: ({ row }) => formatNumber(row.original.quantity ?? 0),
  },
  {
    accessorKey: 'reservedQuantity',
    header: 'Резерв',
    cell: ({ row }) => formatNumber(row.original.reservedQuantity ?? 0),
  },
  {
    id: 'availableQuantity',
    header: 'Доступно',
    cell: ({ row }) => {
      const avail = (row.original.quantity ?? 0) - (row.original.reservedQuantity ?? 0);
      const min = row.original.product?.minStock || 0;
      return (
        <Badge variant={avail <= min ? 'destructive' : 'secondary'}>
          {formatNumber(avail)}
        </Badge>
      );
    },
  },
  {
    id: 'value',
    header: 'Стоимость',
    cell: ({ row }) => {
      const p = row.original.product;
      const price = parseFloat(p?.costPrice) || parseFloat(p?.retailPrice) || p?.purchasePrice || 0;
      return formatCurrency((row.original.quantity ?? 0) * price);
    },
  },
];

export default function WarehousePage() {
  const [params] = useState({ page: 1, limit: 50 });
  const { data, isLoading } = useStock(params);
  const stock = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Остатки на складе</h1>
        <p className="text-muted-foreground">Текущие остатки товаров по складам</p>
      </div>
      <DataTable
        columns={columns}
        data={stock}
        searchPlaceholder="Поиск по товару..."
        isLoading={isLoading}
      />
    </div>
  );
}
