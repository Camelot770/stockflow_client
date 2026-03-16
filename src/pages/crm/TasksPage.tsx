import React, { useState, useMemo } from 'react';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { useTasks, useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Task } from '@/types';

const priorityMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'warning' }> = {
  LOW: { label: 'Низкий', variant: 'secondary' },
  MEDIUM: { label: 'Средний', variant: 'default' },
  HIGH: { label: 'Высокий', variant: 'warning' },
  URGENT: { label: 'Срочный', variant: 'destructive' },
};

const statusMap: Record<string, string> = { NEW: 'К выполнению', IN_PROGRESS: 'В работе', COMPLETED: 'Выполнена', CANCELLED: 'Отменена' };

export default function TasksPage() {
  const [params] = useState({ page: 1, limit: 50 });
  const { data, isLoading } = useTasks(params);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' as string, dueDate: '' });

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === 'COMPLETED' ? 'NEW' : 'COMPLETED';
    updateTask.mutate(
      { id: task.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(newStatus === 'COMPLETED' ? 'Задача выполнена' : 'Задача открыта заново');
        },
      },
    );
  };

  const columns: ColumnDef<Task, unknown>[] = useMemo(() => [
    {
      id: 'status_icon',
      header: '',
      cell: ({ row }) => {
        const isCompleted = row.original.status === 'COMPLETED';
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row.original);
            }}
            className="group flex items-center justify-center rounded-full transition-colors hover:bg-muted p-0.5"
            title={isCompleted ? 'Вернуть в работу' : 'Отметить выполненной'}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            )}
          </button>
        );
      },
      size: 40,
    },
    { accessorKey: 'title', header: 'Задача', cell: ({ row }) => <span className={row.original.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}>{row.original.title}</span> },
    { accessorKey: 'priority', header: 'Приоритет', cell: ({ row }) => { const p = priorityMap[row.original.priority]; return <Badge variant={p?.variant}>{p?.label}</Badge>; } },
    { accessorKey: 'status', header: 'Статус', cell: ({ row }) => statusMap[row.original.status] || row.original.status },
    { accessorKey: 'assignedUser', header: 'Ответственный', cell: ({ row }) => row.original.assignedUser ? `${row.original.assignedUser.firstName} ${row.original.assignedUser.lastName}` : '-' },
    { accessorKey: 'dueDate', header: 'Срок', cell: ({ row }) => row.original.dueDate ? formatDate(row.original.dueDate) : '-' },
  ], []);

  const handleCreate = () => {
    createTask.mutate({ title: form.title, description: form.description, priority: form.priority as Task['priority'], dueDate: form.dueDate || undefined }, {
      onSuccess: () => { toast.success('Задача создана'); setShowCreate(false); setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' }); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Задачи</h1><p className="text-muted-foreground">Управление задачами CRM</p></div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Новая задача</Button>
      </div>
      <DataTable columns={columns} data={data?.data || []} searchPlaceholder="Поиск задач..." searchColumn="title" isLoading={isLoading} />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новая задача</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Название *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Описание</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Приоритет</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="LOW">Низкий</SelectItem><SelectItem value="MEDIUM">Средний</SelectItem><SelectItem value="HIGH">Высокий</SelectItem><SelectItem value="URGENT">Срочный</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Срок</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button><Button onClick={handleCreate} disabled={!form.title}>Создать</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
