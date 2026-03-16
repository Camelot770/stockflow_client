import React, { useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { useDocuments, useCreateDocument, useDeleteDocument } from '@/hooks/useDocuments';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Document } from '@/types';

const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'warning' | 'destructive' }> = {
  INVOICE: { label: 'Счёт', variant: 'default' },
  RECEIPT: { label: 'Квитанция', variant: 'secondary' },
  WAYBILL: { label: 'Накладная', variant: 'warning' },
  ACT: { label: 'Акт', variant: 'default' },
  CONTRACT: { label: 'Договор', variant: 'secondary' },
  RETURN_DOC: { label: 'Возврат', variant: 'destructive' },
  OTHER: { label: 'Прочее', variant: 'secondary' },
};

function generateDocNumber(type: string): string {
  const prefixes: Record<string, string> = {
    INVOICE: 'СЧ',
    RECEIPT: 'КВ',
    WAYBILL: 'НКЛ',
    ACT: 'АКТ',
    CONTRACT: 'ДОГ',
    RETURN_DOC: 'ВОЗ',
    OTHER: 'ДОК',
  };
  const prefix = prefixes[type] || 'ДОК';
  const num = String(Date.now()).slice(-6);
  return `${prefix}-${num}`;
}

export default function DocumentsPage() {
  const [params] = useState({ page: 1, limit: 50 });
  const { data, isLoading } = useDocuments(params);
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: 'INVOICE', number: '' });

  const documents: Document[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  const handleOpenCreate = () => {
    setForm({ type: 'INVOICE', number: generateDocNumber('INVOICE') });
    setShowCreate(true);
  };

  const handleTypeChange = (type: string) => {
    setForm({ type, number: generateDocNumber(type) });
  };

  const handleCreate = () => {
    createDocument.mutate(
      { type: form.type, number: form.number },
      {
        onSuccess: () => {
          toast.success('Документ создан');
          setShowCreate(false);
        },
        onError: () => toast.error('Ошибка при создании документа'),
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteDocument.mutate(id, {
      onSuccess: () => toast.success('Документ удалён'),
    });
  };

  const columns: ColumnDef<Document, unknown>[] = [
    {
      accessorKey: 'number',
      header: 'Номер',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.number}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Тип',
      cell: ({ row }) => {
        const t = typeMap[row.original.type];
        return <Badge variant={t?.variant}>{t?.label || row.original.type}</Badge>;
      },
    },
    {
      accessorKey: 'user',
      header: 'Автор',
      cell: ({ row }) =>
        row.original.user
          ? `${row.original.user.firstName} ${row.original.user.lastName}`
          : '-',
    },
    {
      accessorKey: 'createdAt',
      header: 'Дата создания',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.original.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
      size: 50,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Документы</h1>
          <p className="text-muted-foreground">Счета, акты, накладные и отчёты</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Сформировать документ
        </Button>
      </div>

      {documents.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title="Нет документов"
              description="Документы формируются автоматически на основе заказов или вручную"
              actionLabel="Создать документ"
              onAction={handleOpenCreate}
            />
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={documents}
          searchPlaceholder="Поиск документов..."
          searchColumn="number"
          isLoading={isLoading}
        />
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый документ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Тип документа *</Label>
              <Select value={form.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INVOICE">Счёт</SelectItem>
                  <SelectItem value="RECEIPT">Квитанция</SelectItem>
                  <SelectItem value="WAYBILL">Накладная</SelectItem>
                  <SelectItem value="ACT">Акт</SelectItem>
                  <SelectItem value="CONTRACT">Договор</SelectItem>
                  <SelectItem value="RETURN_DOC">Документ возврата</SelectItem>
                  <SelectItem value="OTHER">Прочее</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Номер документа *</Label>
              <Input
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                placeholder="СЧ-000001"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={!form.number || createDocument.isPending}>
              {createDocument.isPending ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
