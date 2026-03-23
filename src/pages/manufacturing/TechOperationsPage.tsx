import React, { useState } from 'react';
import { Plus, Trash2, Play, CheckCircle2, Clock, AlertCircle, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouse';
import {
  useTechOperations, useCreateTechOperation, useUpdateTechOperationStatus,
  useToggleOperationStep, useDeleteTechOperation, useTechMaps,
} from '@/hooks/useManufacturing';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product, TechOperation } from '@/types';

type OperationStatus = TechOperation['status'];

const statusConfig: Record<OperationStatus, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive'; icon: React.ReactNode }> = {
  PLANNED: { label: 'Запланировано', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  IN_PROGRESS: { label: 'В работе', variant: 'default', icon: <Play className="h-3 w-3" /> },
  COMPLETED: { label: 'Завершено', variant: 'success', icon: <CheckCircle2 className="h-3 w-3" /> },
  CANCELLED: { label: 'Отменено', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
};

const priorityLabels: Record<string, string> = { LOW: 'Низкий', MEDIUM: 'Средний', HIGH: 'Высокий' };

export default function TechOperationsPage() {
  const { data: rawProducts } = useProducts({ limit: 500 });
  const products: Product[] = rawProducts?.data || (Array.isArray(rawProducts) ? rawProducts : []);
  const { data: rawWarehouses } = useWarehouses();
  const warehouses = Array.isArray(rawWarehouses) ? rawWarehouses : Array.isArray((rawWarehouses as any)?.data) ? (rawWarehouses as any).data : [];
  const { data: techMapsData } = useTechMaps({ limit: 100 });
  const techMaps = techMapsData?.data || [];

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const queryParams = filterStatus !== 'all' ? { status: filterStatus } : {};
  const { data: operationsData, isLoading } = useTechOperations(queryParams);
  const operations: TechOperation[] = operationsData?.data || [];

  const createMutation = useCreateTechOperation();
  const updateStatusMutation = useUpdateTechOperationStatus();
  const toggleStepMutation = useToggleOperationStep();
  const deleteMutation = useDeleteTechOperation();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [warehouseId, setWarehouseId] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [plannedDate, setPlannedDate] = useState('');
  const [techMapId, setTechMapId] = useState('');
  const [stepInputs, setStepInputs] = useState<string[]>(['']);

  const resetForm = () => {
    setName(''); setDescription(''); setProductId('');
    setQuantity(1); setWarehouseId(''); setAssignee('');
    setPriority('MEDIUM'); setPlannedDate(''); setTechMapId('');
    setStepInputs(['']);
  };

  const handleSelectTechMap = (mapId: string) => {
    setTechMapId(mapId);
    if (mapId) {
      const map = techMaps.find((m) => m.id === mapId);
      if (map) {
        if (!name) setName(`Производство: ${map.name}`);
        setProductId(map.resultProductId);
        setQuantity(map.resultQuantity);
        setStepInputs(map.steps.length > 0 ? map.steps.map((s) => s.name) : ['']);
      }
    }
  };

  const handleCreate = () => {
    if (!name.trim()) { toast.error('Укажите название операции'); return; }
    if (!productId) { toast.error('Выберите товар'); return; }
    if (!warehouseId) { toast.error('Выберите склад'); return; }
    if (!plannedDate) { toast.error('Укажите плановую дату'); return; }

    const payload = {
      name,
      description,
      techMapId: techMapId || undefined,
      productId,
      quantity,
      warehouseId,
      assignee,
      priority,
      plannedDate,
      steps: stepInputs.filter((s) => s.trim()).map((s) => ({ name: s })),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Операция создана');
        setShowCreate(false);
        resetForm();
      },
      onError: () => toast.error('Ошибка при создании'),
    });
  };

  const updateStatus = (id: string, status: OperationStatus) => {
    updateStatusMutation.mutate({ id, status }, {
      onSuccess: () => toast.success(`Статус обновлён: ${statusConfig[status].label}`),
      onError: () => toast.error('Ошибка при обновлении статуса'),
    });
  };

  const toggleStep = (opId: string, stepId: string, currentDone: boolean) => {
    toggleStepMutation.mutate({ id: opId, stepId, done: !currentDone });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => { toast.success('Операция удалена'); setDeleteId(null); },
      onError: () => toast.error('Ошибка при удалении'),
    });
  };

  // Stats from all operations (unfiltered would be better, but use what we have)
  const allOps = operations;
  const stats = {
    total: allOps.length,
    planned: allOps.filter((o) => o.status === 'PLANNED').length,
    inProgress: allOps.filter((o) => o.status === 'IN_PROGRESS').length,
    completed: allOps.filter((o) => o.status === 'COMPLETED').length,
  };

  if (isLoading) return <LoadingSkeleton />;

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
            <SelectItem value="PLANNED">Запланировано</SelectItem>
            <SelectItem value="IN_PROGRESS">В работе</SelectItem>
            <SelectItem value="COMPLETED">Завершено</SelectItem>
            <SelectItem value="CANCELLED">Отменено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Operations list */}
      {operations.length === 0 ? (
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
          {operations.map((op) => {
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
                        Товар: {op.product?.name || ''} x{op.quantity}
                        {op.warehouse?.name && ` | Склад: ${op.warehouse.name}`}
                        {op.assignee && ` | Исполнитель: ${op.assignee}`}
                      </p>
                      {op.description && <p className="text-sm text-muted-foreground mt-1">{op.description}</p>}

                      {/* Steps checklist */}
                      {op.steps.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Этапы ({stepsProgress})
                            {op.currentStep < op.steps.length && (
                              <span className="ml-2 text-primary font-semibold">
                                — Текущий: {op.steps[op.currentStep]?.name}
                              </span>
                            )}
                            {op.currentStep >= op.steps.length && op.steps.length > 0 && (
                              <span className="ml-2 text-green-500 font-semibold">— Все этапы завершены</span>
                            )}
                          </p>
                          {op.steps.map((step, si) => (
                            <label key={step.id} className={`flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded ${si === op.currentStep && !step.done ? 'bg-primary/10 border border-primary/20' : ''}`}>
                              <input
                                type="checkbox"
                                checked={step.done}
                                onChange={() => toggleStep(op.id, step.id, step.done)}
                                className="rounded"
                              />
                              <span className={step.done ? 'line-through text-muted-foreground' : si === op.currentStep ? 'font-medium text-primary' : ''}>
                                {step.name}
                              </span>
                              {si === op.currentStep && !step.done && (
                                <Badge variant="default" className="text-[10px] px-1.5 py-0">текущий</Badge>
                              )}
                            </label>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        Дата: {op.plannedDate ? new Date(op.plannedDate).toLocaleDateString('ru-RU') : ''}
                        {op.completedDate && ` | Завершено: ${formatDateTime(op.completedDate)}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {op.status === 'PLANNED' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(op.id, 'IN_PROGRESS')}>
                          <Play className="h-3 w-3 mr-1" />Начать
                        </Button>
                      )}
                      {op.status === 'IN_PROGRESS' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => updateStatus(op.id, 'COMPLETED')}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />Завершить
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => updateStatus(op.id, 'CANCELLED')}>
                            <Pause className="h-3 w-3 mr-1" />Отменить
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(op.id)}>
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
            {/* Tech Map Selection */}
            {techMaps.length > 0 && (
              <div className="space-y-2">
                <Label>Технологическая карта (опционально)</Label>
                <Select value={techMapId} onValueChange={handleSelectTechMap}>
                  <SelectTrigger><SelectValue placeholder="Выберите карту для авто-заполнения" /></SelectTrigger>
                  <SelectContent>
                    {techMaps.filter((m) => m.isActive).map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                    <SelectItem value="LOW">Низкий</SelectItem>
                    <SelectItem value="MEDIUM">Средний</SelectItem>
                    <SelectItem value="HIGH">Высокий</SelectItem>
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
                <Label>Склад *</Label>
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
                <Label>Плановая дата *</Label>
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
            <Button onClick={handleCreate} disabled={!name || !productId || !warehouseId || !plannedDate || createMutation.isPending}>
              {createMutation.isPending ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить операцию?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Это действие нельзя отменить. Операция будет удалена безвозвратно.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
