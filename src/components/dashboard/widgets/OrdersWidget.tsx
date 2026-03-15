import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { formatNumber } from '@/lib/utils';

interface OrdersWidgetProps {
  orders: number;
  trend: number;
}

export function OrdersWidget({ orders, trend }: OrdersWidgetProps) {
  return (
    <StatCard
      title="Заказы"
      value={formatNumber(orders)}
      trend={trend}
      trendLabel="к прошлому месяцу"
      icon={<ShoppingCart className="h-6 w-6" />}
    />
  );
}
