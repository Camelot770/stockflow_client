import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { ExportButton } from '@/components/shared/ExportButton';
import { useTransactions, useCreateTransaction, useFinanceAccounts, useTransactionCategories } from '@/hooks/useFinance';
import { exportApi } from '@/api/export';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Transaction } from '@/types';

const typeIcons: Record<string, React.ReactNode> = {
  income: <ArrowUpRight className="h-4 w-4 text-emerald-500" />,
  expense: <ArrowDownRight className="h-4 w-4 text-red-500" />,
  transfer: <ArrowLeftRight className="h-4 w-4 text-blue-500" />,
  INCOME: <ArrowUpRight className="h-4 w-4 text-emerald-500" />,
  EXPENSE: <ArrowDownRight className="h-4 w-4 text-red-500" />,
  TRANSFER: <ArrowLeftRight className="h-4 w-4 text-blue-500" />,
};

const typeLabels: Record<string, string> = {
  income: 'Доход', expense: 'Расход', transfer: 'Перевод',
  INCOME: 'Доход', EXPENSE: 'Расход', TRANSFER: 'Перевод',
};

const columns: ColumnDef<Transaction, unknown>[] = [
  { accessorKey: 'date', header: 'Дата', cell: ({ row }) => formatDate(row.original.date) },
  {
    accessorKey: 'type', header: 'Тип', cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {typeIcons[row.original.type]}
        <span>{typeLabels[row.original.type] || row.original.type}</span>
      </div>
    ),
  },
  { accessorKey: 'description', header: 'Описание', cell: ({ row }) => row.original.description || '-' },
  { accessorKey: 'account.name', header: 'Счёт', cell: ({ row }) => row.original.account?.name || '-' },
  { accessorKey: 'category.name', header: 'Категория', cell: ({ row }) => row.original.category?.name || '-' },
  {
    accessorKey: 'amount', header: 'Сумма', cell: ({ row }) => {
      const t = row.original.type?.toLowerCase();
      return (
        <span className={cn('font-medium', t === 'income' ? 'text-emerald-500' : t === 'expense' ? 'text-red-500' : '')}>
          {t === 'income' ? '+' : t === 'expense' ? '-' : ''}{formatCurrency(row.original.amount ?? 0)}
        </span>
      );
    },
  },
];

const emptyForm = {
  type: 'EXPENSE' as string,
  amount: '',
  description: '',
  accountId: '',
  categoryId: '',
  date: new Date().toISOString().slice(0, 10),
};

export default function TransactionsPage() {
  const [params] = useState({ page: 1, limit: 20 });
  const { data, isLoading } = useTransactions(params);
  const createTransaction = useCreateTransaction();
  const { data: rawAccounts } = useFinanceAccounts();
  const { data: rawCategories } = useTransactionCategories();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const accounts = Array.isArray(rawAccounts) ? rawAccounts : Array.isArray((rawAccounts as any)?.data) ? (rawAccounts as any).data : [];
  const categories = Array.isArray(rawCategories) ? rawCategories : Array.isArray((rawCategories as any)?.data) ? (rawCategories as any).data : [];

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setShowCreate(true);
  };

  const handleCreate = () => {
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Укажите корректную сумму');
      return;
    }
    if (!form.accountId) {
      toast.error('Выберите счёт');
      return;
    }

    createTransaction.mutate(
      {
        type: form.type,
        amount,
        description: form.description || undefined,
        accountId: form.accountId,
        categoryId: form.categoryId || undefined,
        date: form.date,
      } as any,
      {
        onSuccess: () => {
          toast.success('Транзакция создана');
          setShowCreate(false);
        },
        onError: () => toast.error('Ошибка при создании транзакции'),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Транзакции</h1>
          <p className="text-muted-foreground">Доходы, расходы и переводы</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton onExport={exportApi.exportTransactions} filename="transactions.xlsx" />
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />Новая транзакция
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} searchPlaceholder="Поиск..." isLoading={isLoading} />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая транзакция</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Тип *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Доход</SelectItem>
                  <SelectItem value="EXPENSE">Расход</SelectItem>
                  <SelectItem value="TRANSFER">Перевод</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Сумма *</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Счёт *</Label>
              <Select value={form.accountId} onValueChange={(v) => setForm({ ...form, accountId: v })}>
                <SelectTrigger><SelectValue placeholder="Выберите счёт" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Категория</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v === '_none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Без категории" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Без категории</SelectItem>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Дата</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Комментарий к транзакции..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={createTransaction.isPending}>
              {createTransaction.isPending ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
