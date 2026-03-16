import React, { useState, useMemo } from 'react';
import {
  Plus, Loader2, Cog, Trash2, ArrowDownUp,
  PackagePlus, PackageMinus, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouse';
import { useCreateStockOperation } from '@/hooks/useWarehouse';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface ComponentItem {
  productId: string;
  productName: string;
  quantity: number;
}

interface ManufacturingOperation {
  id: string;
  type: 'assembly' | 'disassembly';
  resultProduct: string;
  resultProductName: string;
  resultQuantity: number;
  components: ComponentItem[];
  warehouseId: string;
  warehouseName: string;
  note: string;
  createdAt: string;
}

export default function ManufacturingPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [operations, setOperations] = useState<ManufacturingOperation[]>([]);

  // Form state
  const [operationType, setOperationType] = useState<'assembly' | 'disassembly'>('assembly');
  const [resultProductId, setResultProductId] = useState('');
  const [resultQuantity, setResultQuantity] = useState(1);
  const [warehouseId, setWarehouseId] = useState('');
  const [note, setNote] = useState('');
  const [components, setComponents] = useState<ComponentItem[]>([]);

  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 500 });
  const { data: rawWarehouses } = useWarehouses();
  const createStockOp = useCreateStockOperation();

  const products = productsData?.data || [];
  const warehouses = Array.isArray(rawWarehouses)
    ? rawWarehouses
    : Array.isArray((rawWarehouses as any)?.data)
      ? (rawWarehouses as any).data
      : [];

  const resultProduct = products.find((p: Product) => p.id === resultProductId);

  // Summary stats
  const thisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthOps = operations.filter((op) => op.createdAt >= monthStart);
    return {
      assemblies: monthOps.filter((op) => op.type === 'assembly').length,
      disassemblies: monthOps.filter((op) => op.type === 'disassembly').length,
      total: monthOps.length,
    };
  }, [operations]);

  const addComponent = () => {
    setComponents([...components, { productId: '', productName: '', quantity: 1 }]);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const updateComponent = (index: number, field: keyof ComponentItem, value: string | number) => {
    const updated = [...components];
    if (field === 'productId') {
      const product = products.find((p: Product) => p.id === value);
      updated[index] = { ...updated[index], productId: value as string, productName: product?.name || '' };
    } else {
      (updated[index] as any)[field] = value;
    }
    setComponents(updated);
  };

  const resetForm = () => {
    setOperationType('assembly');
    setResultProductId('');
    setResultQuantity(1);
    setWarehouseId('');
    setNote('');
    setComponents([]);
  };

  const handleCreate = () => {
    if (!resultProductId) {
      toast.error('Выберите итоговый товар');
      return;
    }
    if (!warehouseId) {
      toast.error('Выберите склад');
      return;
    }
    if (components.length === 0 || components.some((c) => !c.productId || c.quantity <= 0)) {
      toast.error('Добавьте компоненты с корректным количеством');
      return;
    }

    // Build stock operation items:
    // Assembly: components are consumed (negative adjustment), result is produced (positive)
    // Disassembly: result is consumed (negative), components are produced (positive)
    const items = operationType === 'assembly'
      ? [
          // Produce result
          { productId: resultProductId, quantity: resultQuantity, price: 0 },
          // Consume components (will be handled by adjustment type)
          ...components.map((c) => ({
            productId: c.productId,
            quantity: -c.quantity,
            price: 0,
          })),
        ]
      : [
          // Consume result
          { productId: resultProductId, quantity: -resultQuantity, price: 0 },
          // Produce components
          ...components.map((c) => ({
            productId: c.productId,
            quantity: c.quantity,
            price: 0,
          })),
        ];

    const opData = {
      type: 'adjustment' as const,
      warehouseToId: warehouseId,
      items,
      note: `${operationType === 'assembly' ? 'Сборка' : 'Разборка'}: ${resultProduct?.name || resultProductId}. ${note}`.trim(),
    };

    createStockOp.mutate(opData as any, {
      onSuccess: () => {
        const newOp: ManufacturingOperation = {
          id: Date.now().toString(),
          type: operationType,
          resultProduct: resultProductId,
          resultProductName: resultProduct?.name || '',
          resultQuantity,
          components: [...components],
          warehouseId,
          warehouseName: warehouses.find((w: any) => w.id === warehouseId)?.name || '',
          note,
          createdAt: new Date().toISOString(),
        };
        setOperations([newOp, ...operations]);
        toast.success(
          operationType === 'assembly'
            ? 'Сборка выполнена успешно'
            : 'Разборка выполнена успешно',
        );
        setDialogOpen(false);
        resetForm();
      },
      onError: () => {
        toast.error('Ошибка при выполнении операции');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Сборка и производство</h1>
          <p className="text-muted-foreground">Управление сборкой и разборкой товаров</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Новая операция
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <PackagePlus className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Сборок за месяц</p>
              <p className="text-2xl font-bold">{thisMonth.assemblies}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <PackageMinus className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Разборок за месяц</p>
              <p className="text-2xl font-bold">{thisMonth.disassemblies}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ArrowDownUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Всего операций за месяц</p>
              <p className="text-2xl font-bold">{thisMonth.total}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations table */}
      <Card>
        <CardHeader>
          <CardTitle>Последние операции</CardTitle>
        </CardHeader>
        <CardContent>
          {operations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Cog className="h-10 w-10 mb-3" />
              <p className="text-lg font-medium">Нет операций</p>
              <p className="text-sm">Создайте первую операцию сборки или разборки</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Тип</TableHead>
                  <TableHead>Товар</TableHead>
                  <TableHead>Кол-во</TableHead>
                  <TableHead>Компоненты</TableHead>
                  <TableHead>Склад</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Примечание</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell>
                      <Badge variant={op.type === 'assembly' ? 'default' : 'secondary'}>
                        {op.type === 'assembly' ? 'Сборка' : 'Разборка'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{op.resultProductName}</TableCell>
                    <TableCell>{op.resultQuantity}</TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {op.components.map((c, i) => (
                          <p key={i} className="text-xs">
                            {c.productName} x{c.quantity}
                          </p>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{op.warehouseName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(op.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {op.note || '---'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новая операция сборки / разборки</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Operation type */}
            <div className="space-y-2">
              <Label>Тип операции</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={operationType === 'assembly' ? 'default' : 'outline'}
                  onClick={() => setOperationType('assembly')}
                  className="w-full"
                >
                  <PackagePlus className="h-4 w-4 mr-2" />
                  Сборка
                </Button>
                <Button
                  type="button"
                  variant={operationType === 'disassembly' ? 'default' : 'outline'}
                  onClick={() => setOperationType('disassembly')}
                  className="w-full"
                >
                  <PackageMinus className="h-4 w-4 mr-2" />
                  Разборка
                </Button>
              </div>
            </div>

            {/* Warehouse */}
            <div className="space-y-2">
              <Label>Склад *</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите склад" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Result product */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>
                  {operationType === 'assembly' ? 'Итоговый товар *' : 'Разбираемый товар *'}
                </Label>
                <Select value={resultProductId} onValueChange={setResultProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите товар" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p: Product) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Количество</Label>
                <Input
                  type="number"
                  min={1}
                  value={resultQuantity}
                  onChange={(e) => setResultQuantity(Math.max(1, Number(e.target.value)))}
                />
              </div>
            </div>

            {/* Components */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {operationType === 'assembly' ? 'Компоненты для сборки' : 'Получаемые компоненты'}
                </Label>
                <Button variant="outline" size="sm" onClick={addComponent}>
                  <Plus className="h-3 w-3 mr-1" />
                  Добавить
                </Button>
              </div>

              {components.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Добавьте компоненты для операции
                </p>
              ) : (
                <div className="space-y-2">
                  {components.map((comp, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={comp.productId}
                        onValueChange={(val) => updateComponent(index, 'productId', val)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Товар" />
                        </SelectTrigger>
                        <SelectContent>
                          {products
                            .filter((p: Product) => p.id !== resultProductId)
                            .map((p: Product) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={1}
                        value={comp.quantity}
                        onChange={(e) =>
                          updateComponent(index, 'quantity', Math.max(1, Number(e.target.value)))
                        }
                        className="w-24"
                        placeholder="Кол-во"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-500"
                        onClick={() => removeComponent(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label>Примечание</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Дополнительная информация..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={createStockOp.isPending}>
              {createStockOp.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {operationType === 'assembly' ? 'Выполнить сборку' : 'Выполнить разборку'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
