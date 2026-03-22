import React, { useState } from 'react';
import { Plus, Trash2, Edit, ChevronDown, ChevronRight, FileText } from 'lucide-react';
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
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface TechMapComponent {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
}

interface TechMapStep {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  order: number;
}

interface TechMap {
  id: string;
  name: string;
  description: string;
  resultProductId: string;
  resultProductName: string;
  resultQuantity: number;
  components: TechMapComponent[];
  steps: TechMapStep[];
  isActive: boolean;
  createdAt: string;
}

export default function TechMapsPage() {
  const { data: rawProducts } = useProducts({ limit: 500 });
  const products: Product[] = rawProducts?.data || (Array.isArray(rawProducts) ? rawProducts : []);

  const [maps, setMaps] = useState<TechMap[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedMap, setExpandedMap] = useState<string | null>(null);
  const [editingMap, setEditingMap] = useState<TechMap | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [resultProductId, setResultProductId] = useState('');
  const [resultQuantity, setResultQuantity] = useState(1);
  const [components, setComponents] = useState<TechMapComponent[]>([]);
  const [steps, setSteps] = useState<TechMapStep[]>([]);

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
    setDescription(map.description);
    setResultProductId(map.resultProductId);
    setResultQuantity(map.resultQuantity);
    setComponents([...map.components]);
    setSteps([...map.steps]);
    setShowCreate(true);
  };

  const addComponent = () => {
    setComponents([...components, { productId: '', productName: '', quantity: 1, unit: 'шт' }]);
  };

  const updateComponent = (index: number, field: keyof TechMapComponent, value: string | number) => {
    const updated = [...components];
    (updated[index] as any)[field] = value;
    if (field === 'productId') {
      const p = products.find((pr) => pr.id === value);
      updated[index].productName = p?.name || '';
    }
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
      order: steps.length + 1,
    }]);
  };

  const updateStep = (index: number, field: keyof TechMapStep, value: string | number) => {
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

    const resultProduct = products.find((p) => p.id === resultProductId);

    const mapData: TechMap = {
      id: editingMap?.id || crypto.randomUUID(),
      name,
      description,
      resultProductId,
      resultProductName: resultProduct?.name || '',
      resultQuantity,
      components: components.filter((c) => c.productId),
      steps,
      isActive: true,
      createdAt: editingMap?.createdAt || new Date().toISOString(),
    };

    if (editingMap) {
      setMaps(maps.map((m) => m.id === editingMap.id ? mapData : m));
      toast.success('Технологическая карта обновлена');
    } else {
      setMaps([mapData, ...maps]);
      toast.success('Технологическая карта создана');
    }

    setShowCreate(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Удалить технологическую карту?')) return;
    setMaps(maps.filter((m) => m.id !== id));
    toast.success('Карта удалена');
  };

  const totalDuration = (map: TechMap) => map.steps.reduce((sum, s) => sum + s.duration, 0);

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
                      Результат: {map.resultProductName} x{map.resultQuantity} | {map.components.length} компонентов | {map.steps.length} этапов | ~{totalDuration(map)} мин
                    </p>
                  </div>
                  <Badge variant={map.isActive ? 'success' : 'secondary'}>
                    {map.isActive ? 'Активна' : 'Неактивна'}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(map); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(map.id); }}>
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
                              <TableCell>{c.productName}</TableCell>
                              <TableCell>{c.quantity}</TableCell>
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
                          {map.steps.sort((a, b) => a.order - b.order).map((step) => (
                            <div key={step.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                              <Badge variant="outline" className="mt-0.5">{step.order}</Badge>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{step.name}</p>
                                {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
                              </div>
                              {step.duration > 0 && (
                                <span className="text-xs text-muted-foreground">{step.duration} мин</span>
                              )}
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
                        <div className="grid grid-cols-[1fr,100px] gap-2">
                          <Input value={step.description} onChange={(e) => updateStep(i, 'description', e.target.value)} placeholder="Описание (опционально)" />
                          <Input type="number" min={0} value={step.duration} onChange={(e) => updateStep(i, 'duration', Number(e.target.value))} placeholder="Мин" />
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
            <Button onClick={handleSave} disabled={!name || !resultProductId || components.length === 0}>
              {editingMap ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
