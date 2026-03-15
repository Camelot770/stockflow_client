import React from 'react';
import { ChartCard } from '@/components/shared/ChartCard';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { Product } from '@/types';

interface TopProductsWidgetProps {
  data: { product: Product; revenue: number; quantity: number }[];
}

export function TopProductsWidget({ data }: TopProductsWidgetProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <ChartCard title="Топ товаров">
      <div className="space-y-3">
        {data.slice(0, 5).map((item, i) => (
          <div key={item.product.id} className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-5">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{item.product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{formatCurrency(item.revenue)}</p>
              <p className="text-xs text-muted-foreground">{formatNumber(item.quantity)} шт</p>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Нет данных</p>
        )}
      </div>
    </ChartCard>
  );
}
