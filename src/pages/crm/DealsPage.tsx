import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DataTable } from '@/components/shared/DataTable';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ExportButton } from '@/components/shared/ExportButton';
import { useDeals, useCreateDeal, useMoveDeal, usePipelines } from '@/hooks/useDeals';
import { exportApi } from '@/api/export';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Deal, PipelineStage } from '@/types';

const columns: ColumnDef<Deal, unknown>[] = [
  { accessorKey: 'name', header: 'Сделка', cell: ({ row }) => row.original.name || row.original.title || '-' },
  { accessorKey: 'customer.name', header: 'Клиент', cell: ({ row }) => row.original.customer?.name || '-' },
  { accessorKey: 'amount', header: 'Сумма', cell: ({ row }) => formatCurrency(row.original.amount ?? 0) },
  { accessorKey: 'stage.name', header: 'Стадия', cell: ({ row }) => <Badge style={row.original.stage?.color ? { backgroundColor: row.original.stage.color + '20', color: row.original.stage.color } : undefined}>{row.original.stage?.name || '-'}</Badge> },
  { accessorKey: 'status', header: 'Статус', cell: ({ row }) => { const s = (row.original.status || '').toUpperCase(); return <Badge variant={s === 'WON' ? 'success' : s === 'LOST' ? 'destructive' : 'secondary'}>{s === 'WON' ? 'Выиграна' : s === 'LOST' ? 'Проиграна' : 'Открыта'}</Badge>; } },
  { accessorKey: 'createdAt', header: 'Дата', cell: ({ row }) => formatDate(row.original.createdAt) },
];

/** Пустой массив стадий — пользователь должен создать воронку в настройках */
const defaultStages: PipelineStage[] = [];

export default function DealsPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [params] = useState({ page: 1, limit: 100 });
  const { data, isLoading } = useDeals(params);
  const { data: pipelines } = usePipelines();
  const createDeal = useCreateDeal();
  const moveDeal = useMoveDeal();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', amount: 0 });

  const deals = data?.data || [];
  const pipelinesList = Array.isArray(pipelines) ? pipelines : Array.isArray((pipelines as any)?.data) ? (pipelines as any).data : [];
  const pipeline = pipelinesList[0];
  const stages = pipeline?.stages || defaultStages;

  const handleDealMove = (dealId: string, newStageId: string) => {
    moveDeal.mutate({ id: dealId, stageId: newStageId }, {
      onSuccess: () => toast.success('Сделка перемещена'),
    });
  };

  const handleCreate = () => {
    createDeal.mutate({ name: form.title, amount: form.amount, pipelineId: pipeline?.id, stageId: stages[0]?.id } as any, {
      onSuccess: () => { toast.success('Сделка создана'); setShowCreate(false); setForm({ title: '', amount: 0 }); },
      onError: () => toast.error('Ошибка создания сделки'),
    });
  };

  if (isLoading) return <LoadingSkeleton type="page" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Сделки</h1><p className="text-muted-foreground">Управление воронкой продаж</p></div>
        <div className="flex items-center gap-2">
          <ExportButton onExport={exportApi.exportDeals} filename="deals.xlsx" />
          <div className="flex rounded-lg border border-border">
            <Button variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')}><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
          </div>
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Новая сделка</Button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard stages={stages} deals={deals} onDealMove={handleDealMove} onDealClick={(d) => navigate(`/crm/deals/${d.id}`)} />
      ) : (
        <DataTable columns={columns} data={deals} searchPlaceholder="Поиск сделок..." searchColumn="title" onRowClick={(r) => navigate(`/crm/deals/${r.id}`)} />
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новая сделка</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Название *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Название сделки" /></div>
            <div className="space-y-2"><Label>Сумма</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button><Button onClick={handleCreate} disabled={!form.title}>Создать</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
