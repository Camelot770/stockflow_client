import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, FileText, CheckCircle2, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useCustomer } from '@/hooks/useCustomers';
import { useActivities } from '@/hooks/useActivities';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

const activityTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string; badgeClass: string }> = {
  call:    { label: 'Звонок',  icon: Phone,        color: 'text-blue-400',   badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  meeting: { label: 'Встреча', icon: Calendar,      color: 'text-purple-400', badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  email:   { label: 'Email',   icon: Mail,          color: 'text-green-400',  badgeClass: 'bg-green-500/15 text-green-400 border-green-500/20' },
  note:    { label: 'Заметка', icon: FileText,      color: 'text-yellow-400', badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  task:    { label: 'Задача',  icon: CheckCircle2,  color: 'text-orange-400', badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
};

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(id!);
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({ customerId: id, limit: 50 });
  const activities = activitiesData?.data || [];

  if (isLoading) return <LoadingSkeleton type="form" rows={6} />;
  if (!customer) return <p className="text-center text-muted-foreground py-16">Контакт не найден</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/crm/contacts')}><ArrowLeft className="h-4 w-4" /></Button>
        <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary/10 text-primary text-lg">{(customer.name || '??').slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
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
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Заказы</span><span className="font-medium">{formatNumber(customer.totalOrders ?? 0)}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Выручка</span><span className="font-medium">{formatCurrency(customer.totalRevenue ?? 0)}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Создан</span><span className="font-medium">{formatDate(customer.createdAt)}</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>История взаимодействий</CardTitle></CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <LoadingSkeleton type="list" rows={3} />
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Inbox className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Нет записей в истории</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Активности по этому контакту появятся здесь</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const cfg = activityTypeConfig[activity.type];
                    const Icon = cfg?.icon || FileText;
                    const isCompleted = activity.isCompleted || !!activity.completedAt;
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-1.5 bg-muted ${cfg?.color || 'text-muted-foreground'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {activity.title}
                            </span>
                            {cfg && (
                              <Badge variant="outline" className={`shrink-0 text-xs ${cfg.badgeClass}`}>{cfg.label}</Badge>
                            )}
                            {isCompleted && (
                              <Badge variant="secondary" className="shrink-0 text-xs bg-emerald-500/15 text-emerald-400">Завершена</Badge>
                            )}
                          </div>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{activity.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatDate(activity.scheduledAt || activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
