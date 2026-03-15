import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useCustomer } from '@/hooks/useCustomers';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(id!);

  if (isLoading) return <LoadingSkeleton type="form" rows={6} />;
  if (!customer) return <p className="text-center text-muted-foreground py-16">Контакт не найден</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/crm/contacts')}><ArrowLeft className="h-4 w-4" /></Button>
        <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary/10 text-primary text-lg">{customer.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{customer.type === 'company' ? 'Компания' : 'Физлицо'}</Badge>
            {customer.tags?.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle>Контакты</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {customer.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{customer.phone}</span></div>}
              {customer.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{customer.email}</span></div>}
              {customer.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{customer.address}</span></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Статистика</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Заказы</span><span className="font-medium">{formatNumber(customer.totalOrders)}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Выручка</span><span className="font-medium">{formatCurrency(customer.totalRevenue)}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Создан</span><span className="font-medium">{formatDate(customer.createdAt)}</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>История взаимодействий</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">История загружается из API</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
