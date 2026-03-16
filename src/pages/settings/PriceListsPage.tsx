import React, { useState } from 'react';
import { Plus, Trash2, Star, ChevronDown, ChevronRight, Package } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import {
  usePriceLists,
  usePriceList,
  useCreatePriceList,
  useUpdatePriceList,
  useDeletePriceList,
  useSetPriceListItems,
} from '@/hooks/usePriceLists';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { PriceList, PriceListItem } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PriceListsPage() {
  const { data, isLoading } = usePriceLists();
  const createPriceList = useCreatePriceList();
  const updatePriceList = useUpdatePriceList();
  const deletePriceList = useDeletePriceList();
  const setItems = useSetPriceListItems();

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingList, setEditingList] = useState<PriceList | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({ name: '', isDefault: false });
  const [editForm, setEditForm] = useState({ name: '', isDefault: false });

  // Item editing state
  const [editingItems, setEditingItems] = useState<{ productId: string; price: string }[]>([]);

  const priceLists: PriceList[] = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];

  // Fetch expanded price list details
  const { data: expandedDetail, isLoading: isLoadingDetail } = usePriceList(expandedId);

  const handleOpenCreate = () => {
    setCreateForm({ name: '', isDefault: false });
    setShowCreate(true);
  };

  const handleCreate = () => {
    if (!createForm.name.trim()) {
      toast.error('Введите название прайс-листа');
      return;
    }
    createPriceList.mutate(
      { name: createForm.name.trim(), isDefault: createForm.isDefault },
      {
        onSuccess: () => {
          toast.success('Прайс-лист создан');
          setShowCreate(false);
        },
        onError: () => toast.error('Ошибка при создании прайс-листа'),
      },
    );
  };

  const handleOpenEdit = (pl: PriceList) => {
    setEditingList(pl);
    setEditForm({ name: pl.name, isDefault: pl.isDefault });
    setShowEdit(true);
  };

  const handleUpdate = () => {
    if (!editingList || !editForm.name.trim()) return;
    updatePriceList.mutate(
      { id: editingList.id, data: { name: editForm.name.trim(), isDefault: editForm.isDefault } },
      {
        onSuccess: () => {
          toast.success('Прайс-лист обновлён');
          setShowEdit(false);
          setEditingList(null);
        },
        onError: () => toast.error('Ошибка при обновлении'),
      },
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePriceList.mutate(id, {
      onSuccess: () => {
        toast.success('Прайс-лист удалён');
        if (expandedId === id) setExpandedId(null);
      },
      onError: () => toast.error('Ошибка при удалении прайс-листа'),
    });
  };

  const handleToggleExpand = (pl: PriceList) => {
    if (expandedId === pl.id) {
      setExpandedId(null);
    } else {
      setExpandedId(pl.id);
    }
  };

  const handleSaveItems = () => {
    if (!expandedId) return;
    const items = editingItems
      .filter((item) => item.productId && item.price)
      .map((item) => ({ productId: item.productId, price: parseFloat(item.price) }));
    setItems.mutate(
      { id: expandedId, items },
      {
        onSuccess: () => toast.success('Позиции сохранены'),
        onError: () => toast.error('Ошибка при сохранении позиций'),
      },
    );
  };

  const columns: ColumnDef<PriceList, unknown>[] = [
    {
      id: 'expand',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleExpand(row.original);
          }}
        >
          {expandedId === row.original.id ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ),
      size: 40,
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: 'Название',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.isDefault && (
            <Badge variant="default" className="gap-1">
              <Star className="h-3 w-3" />
              По умолчанию
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'itemCount',
      header: 'Товаров',
      cell: ({ row }) => {
        const count = row.original._count?.items ?? row.original.items?.length ?? 0;
        return (
          <span className="text-muted-foreground">{count}</span>
        );
      },
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row.original);
            }}
          >
            Изменить
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => handleDelete(row.original.id, e)}
            disabled={deletePriceList.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 160,
    },
  ];

  // Build detail section for expanded row
  const renderExpandedDetail = () => {
    if (!expandedId) return null;

    const items: PriceListItem[] = expandedDetail?.items ?? [];

    return (
      <Card className="mt-2 mb-4 mx-2">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              Позиции прайс-листа ({items.length})
            </h3>
          </div>

          {isLoadingDetail ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Нет позиций в прайс-листе</p>
              <p className="text-xs mt-1">Добавьте товары через API или импорт</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Артикул</TableHead>
                    <TableHead>Товар</TableHead>
                    <TableHead className="text-right">Цена</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {item.product?.sku ?? '-'}
                      </TableCell>
                      <TableCell>{item.product?.name ?? item.productId}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Прайс-листы</h1>
          <p className="text-muted-foreground">Управление ценовыми листами для разных групп клиентов</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Создать прайс-лист
        </Button>
      </div>

      {priceLists.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={<Package className="h-8 w-8 text-muted-foreground" />}
              title="Нет прайс-листов"
              description="Создайте прайс-лист для разных групп клиентов с индивидуальными ценами"
              actionLabel="Создать прайс-лист"
              onAction={handleOpenCreate}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={priceLists}
            searchPlaceholder="Поиск прайс-листов..."
            searchColumn="name"
            isLoading={isLoading}
          />
          {renderExpandedDetail()}
        </>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый прайс-лист</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название *</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Например: Розничный, Оптовый, VIP"
                autoFocus
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={createForm.isDefault}
                onCheckedChange={(checked) =>
                  setCreateForm({ ...createForm, isDefault: checked === true })
                }
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Использовать по умолчанию
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!createForm.name.trim() || createPriceList.isPending}
            >
              {createPriceList.isPending ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать прайс-лист</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Название прайс-листа"
                autoFocus
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefaultEdit"
                checked={editForm.isDefault}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, isDefault: checked === true })
                }
              />
              <Label htmlFor="isDefaultEdit" className="cursor-pointer">
                Использовать по умолчанию
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!editForm.name.trim() || updatePriceList.isPending}
            >
              {updatePriceList.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
