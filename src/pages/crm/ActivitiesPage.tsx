import React, { useState, useMemo } from 'react';
import { Plus, Phone, Mail, Calendar, FileText, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { useActivities, useCreateActivity, useCompleteActivity, useDeleteActivity } from '@/hooks/useActivities';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Activity } from '@/types';

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; badgeClass: string }> = {
  call:    { label: 'Звонок',  icon: Phone,        color: 'text-blue-400',   badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  meeting: { label: 'Встреча', icon: Calendar,      color: 'text-purple-400', badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  email:   { label: 'Email',   icon: Mail,          color: 'text-green-400',  badgeClass: 'bg-green-500/15 text-green-400 border-green-500/20' },
  note:    { label: 'Заметка', icon: FileText,      color: 'text-yellow-400', badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  task:    { label: 'Задача',  icon: CheckCircle2,  color: 'text-orange-400', badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  CALL:    { label: 'Звонок',  icon: Phone,        color: 'text-blue-400',   badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  MEETING: { label: 'Встреча', icon: Calendar,      color: 'text-purple-400', badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  EMAIL:   { label: 'Email',   icon: Mail,          color: 'text-green-400',  badgeClass: 'bg-green-500/15 text-green-400 border-green-500/20' },
  NOTE:    { label: 'Заметка', icon: FileText,      color: 'text-yellow-400', badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  TASK:    { label: 'Задача',  icon: CheckCircle2,  color: 'text-orange-400', badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
};

const typeSummaryOrder = ['call', 'meeting', 'email', 'note', 'task'] as const;

const defaultForm = { type: 'call' as string, title: '', description: '', scheduledAt: '', duration: '' };

export default function ActivitiesPage() {
  const [params] = useState({ page: 1, limit: 100 });
  const { data, isLoading } = useActivities(params);
  const createActivity = useCreateActivity();
  const completeActivity = useCompleteActivity();
  const deleteActivity = useDeleteActivity();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const activities = data?.data || [];

  // Count by type for summary cards
  const countByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of typeSummaryOrder) counts[t] = 0;
    for (const a of activities) {
      const t = a.type?.toLowerCase() || a.type;
      counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }, [activities]);

  const handleComplete = (activity: Activity) => {
    if (activity.isCompleted || activity.completedAt) {
      toast.info('Активность уже завершена');
      return;
    }
    completeActivity.mutate(activity.id, {
      onSuccess: () => toast.success('Активность завершена'),
    });
  };

  const handleDelete = (activity: Activity) => {
    deleteActivity.mutate(activity.id, {
      onSuccess: () => toast.success('Активность удалена'),
    });
  };

  const handleCreate = () => {
    const payload: any = {
      type: form.type.toUpperCase(),
      subject: form.title,
      description: form.description || undefined,
      scheduledAt: form.scheduledAt || undefined,
      duration: form.duration ? parseInt(form.duration) : undefined,
    };
    createActivity.mutate(payload, {
      onSuccess: () => {
        toast.success('Активность создана');
        setShowCreate(false);
        setForm(defaultForm);
      },
    });
  };

  const columns: ColumnDef<Activity, unknown>[] = useMemo(() => [
    {
      id: 'status_icon',
      header: '',
      cell: ({ row }) => {
        const a = row.original;
        const isCompleted = a.isCompleted || !!a.completedAt;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleComplete(a);
            }}
            className="group flex items-center justify-center rounded-full transition-colors hover:bg-muted p-0.5"
            title={isCompleted ? 'Завершена' : 'Отметить завершённой'}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            )}
          </button>
        );
      },
      size: 40,
    },
    {
      id: 'type_icon',
      header: '',
      cell: ({ row }) => {
        const cfg = typeConfig[row.original.type];
        if (!cfg) return null;
        const Icon = cfg.icon;
        return <Icon className={`h-4 w-4 ${cfg.color}`} />;
      },
      size: 36,
    },
    {
      accessorKey: 'title',
      header: 'Тема',
      cell: ({ row }) => (
        <span className={row.original.isCompleted || row.original.completedAt ? 'line-through text-muted-foreground' : ''}>
          {row.original.subject || row.original.title}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Тип',
      cell: ({ row }) => {
        const cfg = typeConfig[row.original.type];
        if (!cfg) return row.original.type;
        return <Badge variant="outline" className={cfg.badgeClass}>{cfg.label}</Badge>;
      },
    },
    {
      id: 'related',
      header: 'Связь',
      cell: ({ row }) => {
        const a = row.original;
        const parts: string[] = [];
        if ((a as any).customer?.name) parts.push((a as any).customer.name);
        if ((a as any).deal?.name || (a as any).deal?.title) parts.push((a as any).deal.name || (a as any).deal.title);
        return parts.length > 0 ? parts.join(' / ') : '-';
      },
    },
    {
      accessorKey: 'scheduledAt',
      header: 'Дата',
      cell: ({ row }) => row.original.scheduledAt ? formatDate(row.original.scheduledAt) : '-',
    },
    {
      id: 'status',
      header: 'Статус',
      cell: ({ row }) => {
        const done = row.original.isCompleted || !!row.original.completedAt;
        return done
          ? <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400">Завершена</Badge>
          : <Badge variant="secondary">Запланирована</Badge>;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.original);
          }}
          title="Удалить"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      ),
      size: 40,
    },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Активности</h1>
          <p className="text-muted-foreground">Звонки, встречи, email и прочие активности</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />Новая активность
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {typeSummaryOrder.map((t) => {
          const cfg = typeConfig[t];
          const Icon = cfg.icon;
          return (
            <Card key={t}>
              <CardContent className="pt-6 text-center">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${cfg.color}`} />
                <p className="text-sm font-medium">{cfg.label}</p>
                <p className="text-2xl font-bold mt-1">{countByType[t] || 0}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={activities}
        searchPlaceholder="Поиск по теме..."
        searchColumn="title"
        isLoading={isLoading}
      />

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новая активность</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Тип *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Звонок</SelectItem>
                  <SelectItem value="meeting">Встреча</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="note">Заметка</SelectItem>
                  <SelectItem value="task">Задача</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Тема *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Тема активности" />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Подробности..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата</Label>
                <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Длительность (мин)</Label>
                <Input type="number" min="0" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="30" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={!form.title || createActivity.isPending}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
