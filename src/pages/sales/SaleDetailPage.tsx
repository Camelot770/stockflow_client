import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useSalesOrder } from '@/hooks/useSales';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' }> = {
  draft: { label: 'Черновик', variant: 'secondary' },
  confirmed: { label: 'Подтверждён', variant: 'default' },
  shipped: { label: 'Отгружен', variant: 'default' },
  delivered: { label: 'Доставлен', variant: 'success' },
  cancelled: { label: 'Отменён', variant: 'destructive' },
};

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useSalesOrder(id!);

  if (isLoading) return <LoadingSkeleton type="form" rows={6} />;
  if (!order) return <p className="text-center text-muted-foreground py-16">Заказ не найден</p>;

  const s = statusMap[order.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/sales')}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold">Продажа {order.number}</h1>
          <p className="text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={s?.variant}>{s?.label}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Клиент</p><p className="font-medium">{order.customer?.name || '-'}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Склад</p><p className="font-medium">{order.warehouse?.name || '-'}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Сумма</p><p className="text-xl font-bold">{formatCurrency(order.totalAmount)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Товары</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Товар</TableHead><TableHead>Кол-во</TableHead><TableHead>Цена</TableHead><TableHead>Скидка</TableHead><TableHead>Сумма</TableHead></TableRow></TableHeader>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product?.name || item.productId}</TableCell>
                  <TableCell>{formatNumber(item.quantity)}</TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                  <TableCell>{item.discount}%</TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
