import React, { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  ClipboardList,
  Package,
  AlertTriangle,
  ArrowDownUp,
  Pencil,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/shared/DataTable';
import { StatCard } from '@/components/shared/StatCard';
import { useStock, useWarehouses, useStockMovements, useCreateAdjustment } from '@/hooks/useWarehouse';
import { formatNumber, formatCurrency, formatDateTime } from '@/lib/utils';
import type { StockItem, StockMovement } from '@/types';

// --- Stock table columns ---

const stockColumns: ColumnDef<StockItem, unknown>[] = [
  {
    accessorKey: 'product.name',
    header: 'Товар',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.product?.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.product?.sku}</p>
      </div>
    ),
  },
  {
    accessorKey: 'warehouse.name',
    header: 'Склад',
    cell: ({ row }) => row.original.warehouse?.name || '-',
  },
  {
    accessorKey: 'quantity',
    header: 'Системный остаток',
    cell: ({ row }) => formatNumber(row.original.quantity ?? 0),
  },
  {
    accessorKey: 'reserved',
    header: 'Резерв',
    cell: ({ row }) => formatNumber((row.original as any).reserved ?? row.original.reservedQuantity ?? 0),
  },
  {
    id: 'available',
    header: 'Доступно',
    cell: ({ row }) => {
      const qty = row.original.quantity ?? 0;
      const reserved = (row.original as any).reserved ?? row.original.reservedQuantity ?? 0;
      const avail = qty - reserved;
      const min = row.original.product?.minStock || 0;
      return (
        <Badge variant={avail <= min ? 'destructive' : 'secondary'}>
          {formatNumber(avail)}
        </Badge>
      );
    },
  },
  {
    id: 'value',
    header: 'Стоимость',
    cell: ({ row }) => {
      const qty = row.original.quantity ?? 0;
      const p = row.original.product as any;
      const price = parseFloat(p?.costPrice) || parseFloat(p?.retailPrice) || p?.purchasePrice || 0;
      return formatCurrency(qty * Number(price));
    },
  },
];

// --- Movement type labels ---

const movementTypeLabels: Record<string, string> = {
  INCOMING: 'Поступление',
  OUTGOING: 'Списание',
  TRANSFER: 'Перемещение',
  WRITE_OFF: 'Списание',
  RETURN: 'Возврат',
  ADJUSTMENT: 'Корректировка',
};

const movementTypeBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  INCOMING: 'default',
  OUTGOING: 'destructive',
  TRANSFER: 'secondary',
  WRITE_OFF: 'destructive',
  RETURN: 'outline',
  ADJUSTMENT: 'secondary',
};

// --- Movements table columns ---

const movementColumns: ColumnDef<StockMovement, unknown>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Дата',
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    accessorKey: 'type',
    header: 'Тип',
    cell: ({ row }) => (
      <Badge variant={movementTypeBadgeVariant[row.original.type] || 'secondary'}>
        {movementTypeLabels[row.original.type] || row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: 'product.name',
    header: 'Товар',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.product?.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.product?.sku}</p>
      </div>
    ),
  },
  {
    accessorKey: 'warehouse.name',
    header: 'Склад',
    cell: ({ row }) => row.original.warehouse?.name || '-',
  },
  {
    accessorKey: 'quantity',
    header: 'Кол-во',
    cell: ({ row }) => {
      const qty = row.original.quantity;
      return (
        <span className={qty > 0 ? 'text-emerald-600 font-medium' : qty < 0 ? 'text-red-600 font-medium' : ''}>
          {qty > 0 ? '+' : ''}{formatNumber(qty)}
        </span>
      );
    },
  },
  {
    accessorKey: 'reason',
    header: 'Причина',
    cell: ({ row }) => row.original.reason || '-',
  },
  {
    accessorKey: 'user',
    header: 'Пользователь',
    cell: ({ row }) => {
      const u = row.original.user;
      return u ? `${u.firstName} ${u.lastName}` : '-';
    },
  },
];

// --- Main component ---

export default function InventoryPage() {
  const [stockParams, setStockParams] = useState({ page: 1, limit: 50 });
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [movementParams] = useState({ page: 1, limit: 50, type: 'ADJUSTMENT' as const });
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [actualQuantity, setActualQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Queries
  const stockQuery = useStock({
    ...stockParams,
    ...(warehouseFilter !== 'all' ? { warehouseId: warehouseFilter } : {}),
  });
  const lowStockQuery = useStock({ page: 1, limit: 1000, lowStock: true });
  const movementsQuery = useStockMovements(movementParams);
  const warehousesQuery = useWarehouses();
  const adjustmentMutation = useCreateAdjustment();

  const stock: StockItem[] = stockQuery.data?.data || [];
  const movements: StockMovement[] = movementsQuery.data?.data || [];
  const warehouses = warehousesQuery.data || [];

  // Summary stats
  const stats = useMemo(() => {
    const totalItems = stock.reduce((sum, s) => sum + (s.quantity ?? 0), 0);
    const totalValue = stock.reduce(
      (sum, s) => {
        const p = s.product as any;
        const price = parseFloat(p?.costPrice) || parseFloat(p?.retailPrice) || p?.purchasePrice || 0;
        return sum + (s.quantity ?? 0) * price;
      },
      0,
    );
    const lowStockCount = (lowStockQuery.data?.data || []).length;
    return { totalItems, totalValue, lowStockCount };
  }, [stock, lowStockQuery.data]);

  // Action column for stock table
  const columnsWithActions: ColumnDef<StockItem, unknown>[] = useMemo(
    () => [
      ...stockColumns,
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openAdjustDialog(row.original)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Корректировка
          </Button>
        ),
      },
    ],
    [],
  );

  // Open adjust dialog
  function openAdjustDialog(item: StockItem) {
    setSelectedItem(item);
    setActualQuantity(String(item.quantity ?? 0));
    setAdjustReason('');
    setAdjustDialogOpen(true);
  }

  // Submit adjustment
  async function handleAdjustment() {
    if (!selectedItem) return;

    const qty = parseInt(actualQuantity, 10);
    if (isNaN(qty) || qty < 0) {
      toast.error('Укажите корректное количество');
      return;
    }
    if (!adjustReason.trim()) {
      toast.error('Укажите причину корректировки');
      return;
    }

    try {
      await adjustmentMutation.mutateAsync({
        warehouseId: selectedItem.warehouseId,
        productId: selectedItem.productId,
        quantity: qty,
        reason: adjustReason.trim(),
      });
      toast.success('Корректировка выполнена успешно');
      setAdjustDialogOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ошибка при корректировке');
    }
  }

  const diff =
    selectedItem != null
      ? parseInt(actualQuantity, 10) - (selectedItem.quantity ?? 0)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Инвентаризация</h1>
          <p className="text-muted-foreground">
            Проведение инвентаризации и корректировка остатков на складе
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Всего единиц товара"
          value={formatNumber(stats.totalItems)}
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Общая стоимость"
          value={formatCurrency(stats.totalValue)}
          icon={<WarehouseIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Товары с низким остатком"
          value={formatNumber(stats.lowStockCount)}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">
            <ClipboardList className="h-4 w-4 mr-2" />
            Остатки
          </TabsTrigger>
          <TabsTrigger value="movements">
            <ArrowDownUp className="h-4 w-4 mr-2" />
            История корректировок
          </TabsTrigger>
        </TabsList>

        {/* Stock tab */}
        <TabsContent value="stock" className="space-y-4">
          <DataTable
            columns={columnsWithActions}
            data={stock}
            searchPlaceholder="Поиск по товару..."
            isLoading={stockQuery.isLoading}
            toolbar={
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Все склады" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все склады</SelectItem>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        </TabsContent>

        {/* Movements tab */}
        <TabsContent value="movements" className="space-y-4">
          <DataTable
            columns={movementColumns}
            data={movements}
            searchPlaceholder="Поиск по товару..."
            isLoading={movementsQuery.isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Adjustment dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Корректировка остатка</DialogTitle>
            <DialogDescription>
              Укажите фактическое количество товара на складе
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Product info */}
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{selectedItem.product?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {selectedItem.product?.sku}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {selectedItem.warehouse?.name}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* System quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Системный остаток</Label>
                  <Input
                    value={formatNumber(selectedItem.quantity ?? 0)}
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="actual-qty">Фактический остаток</Label>
                  <Input
                    id="actual-qty"
                    type="number"
                    min={0}
                    value={actualQuantity}
                    onChange={(e) => setActualQuantity(e.target.value)}
                    className="mt-1"
                    autoFocus
                  />
                </div>
              </div>

              {/* Difference */}
              {!isNaN(diff) && (
                <div className="rounded-md border p-3 text-center">
                  <p className="text-sm text-muted-foreground">Разница</p>
                  <p
                    className={`text-xl font-bold ${
                      diff > 0
                        ? 'text-emerald-600'
                        : diff < 0
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {diff > 0 ? '+' : ''}
                    {isNaN(diff) ? 0 : diff}
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <Label htmlFor="adjust-reason">Причина корректировки *</Label>
                <Textarea
                  id="adjust-reason"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Например: инвентаризация, пересчёт, брак..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleAdjustment}
              disabled={adjustmentMutation.isPending}
            >
              {adjustmentMutation.isPending ? 'Сохранение...' : 'Сохранить корректировку'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
