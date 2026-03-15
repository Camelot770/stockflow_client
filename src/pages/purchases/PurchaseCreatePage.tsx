import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePurchaseOrder, useSuppliers } from '@/hooks/usePurchases';
import { useWarehouses } from '@/hooks/useWarehouse';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export default function PurchaseCreatePage() {
  const navigate = useNavigate();
  const { data: suppliersData } = useSuppliers();
  const { data: rawWarehouses } = useWarehouses();
  const warehouses = Array.isArray(rawWarehouses) ? rawWarehouses : Array.isArray((rawWarehouses as any)?.data) ? (rawWarehouses as any).data : [];
  const createOrder = useCreatePurchaseOrder();

  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [note, setNote] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);

  const suppliers = suppliersData?.data || [];
  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof OrderItem, value: string | number) => {
    const updated = [...items];
    (updated[i] as Record<string, unknown>)[field] = value;
    setItems(updated);
  };

  const handleSubmit = () => {
    createOrder.mutate(
      {
        supplierId, warehouseId, note,
        expectedDate: expectedDate || undefined,
        items: items.map((i) => ({ ...i, receivedQuantity: 0, amount: i.quantity * i.price })),
      } as any,
      {
        onSuccess: () => { toast.success('Закупка создана'); navigate('/purchases'); },
        onError: () => toast.error('Ошибка'),
      },
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchases')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Новая закупка</h1>
          <p className="text-muted-foreground">Создание заказа поставщику</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Параметры заказа</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Поставщик *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder="Выберите поставщика" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Склад получения *</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger><SelectValue placeholder="Выберите склад" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ожидаемая дата</Label>
              <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Примечание</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Комментарий" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Товары</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" />Добавить</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID товара</TableHead>
                <TableHead>Кол-во</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell><Input value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)} /></TableCell>
                  <TableCell><Input type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} className="w-24" /></TableCell>
                  <TableCell><Input type="number" value={item.price} onChange={(e) => updateItem(i, 'price', Number(e.target.value))} className="w-32" /></TableCell>
                  <TableCell>{formatCurrency(item.quantity * item.price)}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4">
            <p className="text-lg font-bold">Итого: {formatCurrency(total)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/purchases')}>Отмена</Button>
        <Button onClick={handleSubmit} disabled={createOrder.isPending || !supplierId}>
          {createOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Создать закупку
        </Button>
      </div>
    </div>
  );
}
