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
import { useCreateSalesOrder } from '@/hooks/useSales';
import { useWarehouses } from '@/hooks/useWarehouse';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface OrderItem { productId: string; quantity: number; price: number; discount: number }

export default function SaleCreatePage() {
  const navigate = useNavigate();
  const { data: rawWarehouses } = useWarehouses();
  const warehouses = Array.isArray(rawWarehouses) ? rawWarehouses : Array.isArray((rawWarehouses as any)?.data) ? (rawWarehouses as any).data : [];
  const { data: customersData } = useCustomers();
  const { data: productsData } = useProducts({ limit: 100 });
  const createOrder = useCreateSalesOrder();
  const products = productsData?.data || [];

  const [customerId, setCustomerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);

  const customers = customersData?.data || [];
  const total = items.reduce((s, i) => s + i.quantity * i.price * (1 - i.discount / 100), 0);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, price: 0, discount: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof OrderItem, value: string | number) => {
    const updated = [...items];
    (updated[i] as Record<string, unknown>)[field] = value;
    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) updated[i].price = product.sellingPrice;
    }
    setItems(updated);
  };

  const handleSubmit = () => {
    createOrder.mutate(
      {
        customerId: customerId || undefined,
        warehouseId: warehouseId || undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price, discount: i.discount })),
      } as any,
      {
        onSuccess: () => { toast.success('Продажа создана'); navigate('/sales'); },
        onError: () => toast.error('Ошибка'),
      },
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/sales')}><ArrowLeft className="h-4 w-4" /></Button>
        <div><h1 className="text-2xl font-bold">Новая продажа</h1><p className="text-muted-foreground">Создание заказа клиента</p></div>
      </div>

      <Card>
        <CardHeader><CardTitle>Параметры заказа</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Клиент</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Выберите клиента" /></SelectTrigger>
                <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Склад отгрузки *</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger><SelectValue placeholder="Выберите склад" /></SelectTrigger>
                <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Примечание</Label><Textarea value={note} onChange={(e) => setNote(e.target.value)} /></div>
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
                <TableHead>Товар</TableHead>
                <TableHead>Кол-во</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Скидка %</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Select value={item.productId} onValueChange={(v) => updateItem(i, 'productId', v)}>
                      <SelectTrigger className="w-[200px]"><SelectValue placeholder="Выберите товар" /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} className="w-20" /></TableCell>
                  <TableCell><Input type="number" value={item.price} onChange={(e) => updateItem(i, 'price', Number(e.target.value))} className="w-28" /></TableCell>
                  <TableCell><Input type="number" value={item.discount} onChange={(e) => updateItem(i, 'discount', Number(e.target.value))} className="w-20" /></TableCell>
                  <TableCell>{formatCurrency(item.quantity * item.price * (1 - item.discount / 100))}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4"><p className="text-lg font-bold">Итого: {formatCurrency(total)}</p></div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/sales')}>Отмена</Button>
        <Button onClick={handleSubmit} disabled={createOrder.isPending || !warehouseId}>
          {createOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Создать продажу
        </Button>
      </div>
    </div>
  );
}
