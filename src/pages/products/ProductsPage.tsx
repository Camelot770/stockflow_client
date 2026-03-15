import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Download, Trash2 } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { Product } from '@/types';

const columns: ColumnDef<Product, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Наименование',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.sku}</p>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Категория',
    cell: ({ row }) => row.original.category?.name || '-',
  },
  {
    accessorKey: 'purchasePrice',
    header: 'Закупочная',
    cell: ({ row }) => formatCurrency(row.original.purchasePrice),
  },
  {
    accessorKey: 'sellingPrice',
    header: 'Продажная',
    cell: ({ row }) => formatCurrency(row.original.sellingPrice),
  },
  {
    accessorKey: 'totalStock',
    header: 'Остаток',
    cell: ({ row }) => {
      const stock = row.original.totalStock;
      const min = row.original.minStock;
      return (
        <Badge variant={stock <= min ? 'destructive' : stock <= min * 1.5 ? 'warning' : 'secondary'}>
          {formatNumber(stock)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Статус',
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
        {row.original.isActive ? 'Активен' : 'Неактивен'}
      </Badge>
    ),
  },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [params] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useProducts(params);
  const deleteProduct = useDeleteProduct();

  const products = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Товары</h1>
          <p className="text-muted-foreground">Управление каталогом товаров</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Импорт
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          <Button onClick={() => navigate('/products/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Поиск товаров..."
        searchColumn="name"
        enableRowSelection
        onRowClick={(row) => navigate(`/products/${row.id}`)}
        isLoading={isLoading}
        bulkActions={(rows) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => rows.forEach((r) => deleteProduct.mutate(r.id))}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Удалить
          </Button>
        )}
      />
    </div>
  );
}
