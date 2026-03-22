import React, { useState } from 'react';
import { Plus, Trash2, Play, CheckCircle2, Clock, AlertCircle, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouse';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/types';

type OperationStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

interface TechOperation {
  id: string;
  name: string;
  description: string;
  status: OperationStatus;
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  plannedDate: string;
  completedDate?: string;
  steps: { name: string; done: boolean }[];
  createdAt: string;
}

const statusConfig: Record<OperationStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive'; icon: React.ReactNode }> = {
  planned: { label: 'Запланировано', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  in_progress: { label: 'В работе', variant: 'default', icon: <Play className="h-3 w-3" /> },
  completed: { label: 'Завершено', variant: 'success', icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: 'Отменено', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
};

const priorityLabels: Record<string, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

export default function TechOperationsPage() {
  const { data: rawProducts } = useProducts({ limit: 500 });
  const products: Product[] = rawProducts?.data || (Array.isArray(rawProducts) ? rawProducts : []);
  const { data: rawWarehouses } = useWarehouses();
  const warehouses = Array.isArray(rawWarehouses) ? rawWarehouses : Array.isArray((rawWarehouses as any)?.data) ? (rawWarehouses as any).data : [];

  const [operations, setOperations] = useState<TechOperation[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [warehouseId, setWarehouseId] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [plannedDate, setPlannedDate] = useState('');
  const [stepInputs, setStepInputs] = useState<string[]>(['']);

  const resetForm = () => {
    setName(''); setDescription(''); setProductId('');
    setQuantity(1); setWarehouseId(''); setAssignee('');
    setPriority('medium'); setPlannedDate(''); setStepInputs(['']);
  };

  const handleCreate = () => {
    if (!name.trim()) { toast.error('Укажите название операции'); return; }
    if (!productId) { toast.error('Выберите товар'); return; }

    const product = products.find((p) => p.id === productId);
    const warehouse = warehouses.find((w: any) => w.id === warehouseId);

    const op: TechOperation = {
      id: crypto.randomUUID(),
      name,
      description,
      status: 'planned',
      productId,
      productName: product?.name || '',
      quantity,
      warehouseId,
      warehouseName: warehouse?.name || '',
      assignee,
      priority,
      plannedDate: plannedDate || new Date().toISOString().split('T')[0],
      steps: stepInputs.filter((s) => s.trim()).map((s) => ({ name: s, done: false })),
      createdAt: new Date().toISOString(),
    };

    setOperations([op, ...operations]);
    toast.success('Операция создана');
    setShowCreate(false);
    resetForm();
  };

  const updateStatus = (id: string, status: OperationStatus) => {
    setOperations(operations.map((op) =>
      op.id === id
        ? { ...op, status, completedDate: status === 'completed' ? new Date().toISOString() : op.completedDate }
        : op,
    ));
    toast.success(`Статус обновлён: ${statusConfig[status].label}`);
  };

  const toggleStep = (opId: string, stepIndex: number) => {
    setOperations(operations.map((op) => {
      if (op.id !== opId) return op;
      const newSteps = [...op.steps];
      newSteps[stepIndex] = { ...newSteps[stepIndex], done: !newSteps[stepIndex].done };
      return { ...op, steps: newSteps };
    }));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Удалить операцию?')) return;
    setOperations(operations.filter((op) => op.id !== id));
    toast.success('Операция удалена');
  };

  const filtered = filterStatus === 'all' ? operations : operations.filter((op) => op.status === filterStatus);

  // Stats
  const stats = {
    total: operations.length,
    planned: operations.filter((o) => o.status === 'planned').length,
    inProgress: operations.filter((o) => o.status === 'in_progress').length,
    completed: operations.filter((o) => o.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Технологические операции</h1>
          <p className="text-muted-foreground">Управление производственными процессами</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="h-4 w-4 mr-2" />Новая операция
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 pb-4"><p className="text-sm text-muted-foreground">Всего</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><p className="text-sm text-muted-foreground">Запланировано</p><p className="text-2xl font-bold text-gray-500">{stats.planned}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><p className="text-sm text-muted-foreground">В работе</p><p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4"><p className="text-sm text-muted-foreground">Завершено</p><p className="text-2xl font-bold text-green-500">{stats.completed}</p></CardContent></Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="planned">Запланировано</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="completed">Завершено</SelectItem>
            <SelectItem value="cancelled">Отменено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Operations list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              title="Нет операций"
              description="Создайте первую технологическую операцию"
              actionLabel="Создать"
              onAction={() => setShowCreate(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((op) => {
            const cfg = statusConfig[op.status];
            const stepsProgress = op.steps.length > 0
              ? `${op.steps.filter((s) => s.done).length}/${op.steps.length}`
              : null;

            return (
              <Card key={op.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{op.name}</p>
                        <Badge variant={cfg.variant as any} className="flex items-center gap-1">
                          {cfg.icon}{cfg.label}
                        </Badge>
                        <Badge variant="outline">{priorityLabels[op.priority]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Товар: {op.productName} x{op.quantity}
                        {op.warehouseName && ` | Склад: ${op.warehouseName}`}
                        {op.assignee && ` | Исполнитель: ${op.assignee}`}
                      </p>
                      {op.description && <p className="text-sm text-muted-foreground mt-1">{op.description}</p>}

                      {/* Steps checklist */}
                      {op.steps.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Этапы ({stepsProgress}):</p>
                          {op.steps.map((step, si) => (
                            <label key={si} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={step.done}
                                onChange={() => toggleStep(op.id, si)}
                                className="rounded"
                              />
                              <span className={step.done ? 'line-through text-muted-foreground' : ''}>{step.name}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        Дата: {op.plannedDate}
                        {op.completedDate && ` | Завершено: ${formatDateTime(op.completedDate)}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {op.status === 'planned' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(op.id, 'in_progress')}>
                          <Play className="h-3 w-3 mr-1" />Начать
                        </Button>
                      )}
                      {op.status === 'in_progress' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => updateStatus(op.id, 'completed')}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />Завершить
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => updateStatus(op.id, 'cancelled')}>
                            <Pause className="h-3 w-3 mr-1" />Отменить
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(op.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) setShowCreate(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новая технологическая операция</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Название операции *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Сборка букета" />
              </div>
              <div className="space-y-2">
                <Label>Приоритет</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Товар *</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger><SelectValue placeholder="Выберите товар" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Количество</Label>
                <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Склад</Label>
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                  <SelectTrigger><SelectValue placeholder="Выберите склад" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Плановая дата</Label>
                <Input type="date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Исполнитель</Label>
              <Input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Имя исполнителя" />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание операции" />
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Этапы выполнения</Label>
                <Button variant="outline" size="sm" onClick={() => setStepInputs([...stepInputs, ''])}>
                  <Plus className="h-3 w-3 mr-1" />Этап
                </Button>
              </div>
              <div className="space-y-2">
                {stepInputs.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                    <Input
                      value={s}
                      onChange={(e) => { const u = [...stepInputs]; u[i] = e.target.value; setStepInputs(u); }}
                      placeholder="Название этапа"
                    />
                    {stepInputs.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => setStepInputs(stepInputs.filter((_, j) => j !== i))}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={!name || !productId}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
