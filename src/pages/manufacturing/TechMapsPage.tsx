import React, { useState } from 'react';
import { Plus, Trash2, Edit, ChevronDown, ChevronRight, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useProducts } from '@/hooks/useProducts';
import { useTechMaps, useCreateTechMap, useUpdateTechMap, useDeleteTechMap, useToggleTechMapActive } from '@/hooks/useManufacturing';
import { toast } from 'sonner';
import type { Product, TechMap } from '@/types';

interface FormComponent {
  productId: string;
  quantity: number;
  unit: string;
}

interface FormStep {
  id: string;
  name: string;
  description: string;
  duration: number;
  deadline: number;
  order: number;
}

export default function TechMapsPage() {
  const { data: rawProducts } = useProducts({ limit: 500 });
  const products: Product[] = rawProducts?.data || (Array.isArray(rawProducts) ? rawProducts : []);

  const { data: techMapsData, isLoading } = useTechMaps({ limit: 100 });
  const maps: TechMap[] = techMapsData?.data || [];

  const createMutation = useCreateTechMap();
  const updateMutation = useUpdateTechMap();
  const deleteMutation = useDeleteTechMap();
  const toggleActiveMutation = useToggleTechMapActive();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState<string | null>(null);
  const [editingMap, setEditingMap] = useState<TechMap | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [resultProductId, setResultProductId] = useState('');
  const [resultQuantity, setResultQuantity] = useState(1);
  const [components, setComponents] = useState<FormComponent[]>([]);
  const [steps, setSteps] = useState<FormStep[]>([]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setResultProductId('');
    setResultQuantity(1);
    setComponents([]);
    setSteps([]);
    setEditingMap(null);
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const openEdit = (map: TechMap) => {
    setEditingMap(map);
    setName(map.name);
    setDescription(map.description || '');
    setResultProductId(map.resultProductId);
    setResultQuantity(map.resultQuantity);
    setComponents(map.components.map((c) => ({
      productId: c.productId,
      quantity: Number(c.quantity),
      unit: c.unit,
    })));
    setSteps(map.steps.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description || '',
      duration: s.duration,
      deadline: s.deadline,
      order: s.order,
    })));
    setShowCreate(true);
  };

  const addComponent = () => {
    setComponents([...components, { productId: '', quantity: 1, unit: 'шт' }]);
  };

  const updateComponent = (index: number, field: keyof FormComponent, value: string | number) => {
    const updated = [...components];
    (updated[index] as any)[field] = value;
    setComponents(updated);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([...steps, {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      duration: 0,
      deadline: 1,
      order: steps.length + 1,
    }]);
  };

  const updateStep = (index: number, field: keyof FormStep, value: string | number) => {
    const updated = [...steps];
    (updated[index] as any)[field] = value;
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error('Укажите название'); return; }
    if (!resultProductId) { toast.error('Выберите готовое изделие'); return; }
    if (components.length === 0) { toast.error('Добавьте хотя бы один компонент'); return; }

    const payload = {
      name,
      description,
      resultProductId,
      resultQuantity,
      components: components.filter((c) => c.productId),
      steps: steps.map((s, i) => ({
        name: s.name,
        description: s.description,
        duration: s.duration,
        deadline: s.deadline,
        order: s.order || i + 1,
      })),
    };

    if (editingMap) {
      updateMutation.mutate({ id: editingMap.id, data: payload }, {
        onSuccess: () => {
          toast.success('Технологическая карта обновлена');
          setShowCreate(false);
          resetForm();
        },
        onError: () => toast.error('Ошибка при обновлении'),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Технологическая карта создана');
          setShowCreate(false);
          resetForm();
        },
        onError: () => toast.error('Ошибка при создании'),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => { toast.success('Карта удалена'); setDeleteId(null); },
      onError: () => toast.error('Ошибка при удалении'),
    });
  };

  const handleToggleActive = (id: string) => {
    toggleActiveMutation.mutate(id, {
      onSuccess: () => toast.success('Статус обновлён'),
      onError: () => toast.error('Ошибка при обновлении статуса'),
    });
  };

  const getProductName = (map: TechMap) => map.resultProduct?.name || '';
  const getComponentName = (comp: TechMap['components'][0]) => comp.product?.name || '';
  const totalDuration = (map: TechMap) => map.steps.reduce((sum, s) => sum + s.duration, 0);
  const totalDeadline = (map: TechMap) => map.steps.reduce((sum, s) => sum + (s.deadline || 0), 0);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Технологические карты</h1>
          <p className="text-muted-foreground">Рецепты и составы готовых изделий</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Создать карту
        </Button>
      </div>

      {maps.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              title="Нет технологических карт"
              description="Создайте первую технологическую карту для производства"
              actionLabel="Создать карту"
              onAction={openCreate}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {maps.map((map) => (
            <Card key={map.id}>
              <CardContent className="pt-4 pb-4">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedMap(expandedMap === map.id ? null : map.id)}
                >
                  {expandedMap === map.id
                    ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{map.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Результат: {getProductName(map)} x{map.resultQuantity} | {map.components.length} компонентов | {map.steps.length} этапов | Срок: {totalDeadline(map)} дн. | ~{totalDuration(map)} мин
                    </p>
                  </div>
                  <Badge
                    variant={map.isActive ? 'success' : 'secondary'}
                    className="cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(map.id); }}
                  >
                    {map.isActive ? 'Активна' : 'Неактивна'}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(map); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteId(map.id); }}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                {expandedMap === map.id && (
                  <div className="mt-4 space-y-4 pl-8">
                    {map.description && <p className="text-sm text-muted-foreground">{map.description}</p>}

                    <div>
                      <p className="text-sm font-medium mb-2">Компоненты:</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Материал</TableHead>
                            <TableHead>Количество</TableHead>
                            <TableHead>Ед. изм.</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {map.components.map((c, i) => (
                            <TableRow key={i}>
                              <TableCell>{getComponentName(c)}</TableCell>
                              <TableCell>{Number(c.quantity)}</TableCell>
                              <TableCell>{c.unit}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {map.steps.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Этапы производства:</p>
                        <div className="space-y-2">
                          {[...map.steps].sort((a, b) => a.order - b.order).map((step) => (
                            <div key={step.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                              <Badge variant="outline" className="mt-0.5">{step.order}</Badge>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{step.name}</p>
                                {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {step.deadline > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {step.deadline} {step.deadline === 1 ? 'день' : step.deadline < 5 ? 'дня' : 'дней'}
                                  </span>
                                )}
                                {step.duration > 0 && (
                                  <span>{step.duration} мин</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить технологическую карту?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Это действие нельзя отменить. Карта будет удалена безвозвратно.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) { setShowCreate(false); resetForm(); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMap ? 'Редактировать' : 'Новая'} технологическая карта</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Название *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Букет Классический" />
              </div>
              <div className="space-y-2">
                <Label>Готовое изделие *</Label>
                <Select value={resultProductId} onValueChange={setResultProductId}>
                  <SelectTrigger><SelectValue placeholder="Выберите товар" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Количество на выходе</Label>
                <Input type="number" min={1} value={resultQuantity} onChange={(e) => setResultQuantity(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Краткое описание" />
              </div>
            </div>

            {/* Components */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base">Компоненты (материалы)</Label>
                <Button variant="outline" size="sm" onClick={addComponent}>
                  <Plus className="h-3 w-3 mr-1" />Добавить
                </Button>
              </div>
              {components.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Добавьте компоненты для сборки</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Материал</TableHead>
                      <TableHead className="w-24">Кол-во</TableHead>
                      <TableHead className="w-24">Ед. изм.</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {components.map((comp, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Select value={comp.productId} onValueChange={(v) => updateComponent(i, 'productId', v)}>
                            <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                            <SelectContent>
                              {products.filter((p) => p.id === comp.productId || !components.some((c) => c.productId === p.id)).map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={0.01} step={0.01} value={comp.quantity} onChange={(e) => updateComponent(i, 'quantity', Number(e.target.value))} />
                        </TableCell>
                        <TableCell>
                          <Input value={comp.unit} onChange={(e) => updateComponent(i, 'unit', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeComponent(i)}>
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base">Этапы производства</Label>
                <Button variant="outline" size="sm" onClick={addStep}>
                  <Plus className="h-3 w-3 mr-1" />Добавить этап
                </Button>
              </div>
              {steps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Добавьте этапы производства (опционально)</p>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Badge variant="outline" className="mt-2">{i + 1}</Badge>
                      <div className="flex-1 space-y-2">
                        <Input value={step.name} onChange={(e) => updateStep(i, 'name', e.target.value)} placeholder="Название этапа" />
                        <div className="grid grid-cols-[1fr,80px,80px] gap-2">
                          <Input value={step.description} onChange={(e) => updateStep(i, 'description', e.target.value)} placeholder="Описание (опционально)" />
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Срок (дн.)</span>
                            <Input type="number" min={0} value={step.deadline} onChange={(e) => updateStep(i, 'deadline', Number(e.target.value))} />
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Длит. (мин)</span>
                            <Input type="number" min={0} value={step.duration} onChange={(e) => updateStep(i, 'duration', Number(e.target.value))} />
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeStep(i)} className="mt-2">
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Отмена</Button>
            <Button
              onClick={handleSave}
              disabled={!name || !resultProductId || components.length === 0 || createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Сохранение...' : editingMap ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
