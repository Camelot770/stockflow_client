import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWarehouses, useCreateStockOperation } from '@/hooks/useWarehouse';
import { useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';

interface OperationItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export default function OperationCreatePage() {
  const navigate = useNavigate();
  const { data: rawWarehouses } = useWarehouses();
  const warehouses = Array.isArray(rawWarehouses) ? rawWarehouses : Array.isArray((rawWarehouses as any)?.data) ? (rawWarehouses as any).data : [];
  const { data: rawProducts, isLoading: productsLoading } = useProducts({ limit: 500 });
  const products = (() => {
    if (Array.isArray(rawProducts)) return rawProducts;
    if (rawProducts && typeof rawProducts === 'object') {
      const rp = rawProducts as any;
      if (Array.isArray(rp.data)) return rp.data;
      if (Array.isArray(rp.products)) return rp.products;
    }
    return [];
  })();
  const createOp = useCreateStockOperation();

  const [type, setType] = useState<string>('receipt');
  const [warehouseFromId, setWarehouseFromId] = useState('');
  const [warehouseToId, setWarehouseToId] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<OperationItem[]>([]);

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, price: 0 }]);
  };

  const updateItem = (index: number, field: keyof OperationItem, value: string | number) => {
    const updated = [...items];
    (updated[index] as Record<string, unknown>)[field] = value;
    setItems(updated);
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId,
      productName: product?.name || '',
      price: product?.purchasePrice ?? product?.costPrice ?? 0,
    };
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const data: Record<string, unknown> = {
      type,
      note,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
    };
    if (type === 'transfer') {
      data.warehouseFromId = warehouseFromId;
      data.warehouseToId = warehouseToId;
    } else if (type === 'receipt') {
      data.warehouseToId = warehouseToId;
    } else {
      data.warehouseFromId = warehouseFromId;
    }

    createOp.mutate(data as any, {
      onSuccess: () => {
        toast.success('Операция создана');
        navigate('/warehouse/operations');
      },
      onError: (err: any) => {
        const error = err?.response?.data?.error;
        toast.error(error?.message || 'Ошибка создания операции');
      },
    });
  };

  // Товары, которые ещё не добавлены в операцию
  const availableProducts = products.filter(
    (p: any) => !items.some((item) => item.productId === p.id)
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/warehouse/operations')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Новая складская операция</h1>
          <p className="text-muted-foreground">Создание операции приёмки, отгрузки или перемещения</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Параметры операции</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Тип операции</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receipt">Приёмка</SelectItem>
                  <SelectItem value="shipment">Отгрузка</SelectItem>
                  <SelectItem value="transfer">Перемещение</SelectItem>
                  <SelectItem value="writeoff">Списание</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(type === 'shipment' || type === 'transfer' || type === 'writeoff') && (
              <div className="space-y-2">
                <Label>Склад-источник</Label>
                <Select value={warehouseFromId} onValueChange={setWarehouseFromId}>
                  <SelectTrigger><SelectValue placeholder="Выберите склад" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(type === 'receipt' || type === 'transfer') && (
              <div className="space-y-2">
                <Label>Склад-получатель</Label>
                <Select value={warehouseToId} onValueChange={setWarehouseToId}>
                  <SelectTrigger><SelectValue placeholder="Выберите склад" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Примечание</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Комментарий к операции" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Товары</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem} disabled={productsLoading || products.length === 0}>
            <Plus className="h-4 w-4 mr-1" />
            {productsLoading ? 'Загрузка...' : products.length === 0 ? 'Нет товаров' : 'Добавить'}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead>Количество</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Select value={item.productId} onValueChange={(val) => selectProduct(i, val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите товар" />
                      </SelectTrigger>
                      <SelectContent>
                        {products
                          .filter((p: any) => p.id === item.productId || !items.some((it) => it.productId === p.id))
                          .map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} className="w-24" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(i, 'price', Number(e.target.value))} className="w-32" />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(i)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Добавьте товары в операцию
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/warehouse/operations')}>Отмена</Button>
        <Button onClick={handleSubmit} disabled={createOp.isPending || items.length === 0 || items.some((i) => !i.productId)}>
          {createOp.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Создать операцию
        </Button>
      </div>
    </div>
  );
}
