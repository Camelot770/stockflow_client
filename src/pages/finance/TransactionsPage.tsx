import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { ExportButton } from '@/components/shared/ExportButton';
import { useTransactions } from '@/hooks/useFinance';
import { exportApi } from '@/api/export';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Transaction } from '@/types';

const typeIcons: Record<string, React.ReactNode> = {
  income: <ArrowUpRight className="h-4 w-4 text-emerald-500" />,
  expense: <ArrowDownRight className="h-4 w-4 text-red-500" />,
  transfer: <ArrowLeftRight className="h-4 w-4 text-blue-500" />,
};

const typeLabels: Record<string, string> = { income: 'Доход', expense: 'Расход', transfer: 'Перевод' };

const columns: ColumnDef<Transaction, unknown>[] = [
  { accessorKey: 'date', header: 'Дата', cell: ({ row }) => formatDate(row.original.date) },
  { accessorKey: 'type', header: 'Тип', cell: ({ row }) => <div className="flex items-center gap-2">{typeIcons[row.original.type]}<span>{typeLabels[row.original.type]}</span></div> },
  { accessorKey: 'description', header: 'Описание', cell: ({ row }) => row.original.description || '-' },
  { accessorKey: 'account.name', header: 'Счёт', cell: ({ row }) => row.original.account?.name || '-' },
  { accessorKey: 'category.name', header: 'Категория', cell: ({ row }) => row.original.category?.name || '-' },
  { accessorKey: 'amount', header: 'Сумма', cell: ({ row }) => <span className={cn('font-medium', row.original.type === 'income' ? 'text-emerald-500' : row.original.type === 'expense' ? 'text-red-500' : '')}>{row.original.type === 'income' ? '+' : row.original.type === 'expense' ? '-' : ''}{formatCurrency(row.original.amount ?? 0)}</span> },
];

export default function TransactionsPage() {
  const [params] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useTransactions(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Транзакции</h1><p className="text-muted-foreground">Доходы, расходы и переводы</p></div>
        <div className="flex items-center gap-2">
          <ExportButton onExport={exportApi.exportTransactions} filename="transactions.xlsx" />
          <Button><Plus className="h-4 w-4 mr-2" />Новая транзакция</Button>
        </div>
      </div>
      <DataTable columns={columns} data={data?.data || []} searchPlaceholder="Поиск..." isLoading={isLoading} />
    </div>
  );
}
