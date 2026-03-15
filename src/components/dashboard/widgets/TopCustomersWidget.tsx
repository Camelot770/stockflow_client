import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartCard } from '@/components/shared/ChartCard';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { Customer } from '@/types';

interface TopCustomersWidgetProps {
  data: { customer: Customer; revenue: number; orders: number }[];
}

export function TopCustomersWidget({ data }: TopCustomersWidgetProps) {
  const navigate = useNavigate();
  const safeData = data || [];

  return (
    <ChartCard title="Топ клиентов">
      <div className="space-y-3">
        {safeData.slice(0, 5).map((item) => (
          <div
            key={item.customer.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-md p-1.5 -mx-1.5 transition-colors"
            onClick={() => navigate(`/crm/contacts/${item.customer.id}`)}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {item.customer.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{item.customer.name}</p>
              <p className="text-xs text-muted-foreground">{formatNumber(item.orders)} заказов</p>
            </div>
            <span className="text-sm font-medium">{formatCurrency(item.revenue)}</span>
          </div>
        ))}
        {safeData.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
        )}
      </div>
    </ChartCard>
  );
}
