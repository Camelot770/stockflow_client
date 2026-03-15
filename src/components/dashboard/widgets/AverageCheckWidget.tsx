import React from 'react';
import { Receipt } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency } from '@/lib/utils';

interface AverageCheckWidgetProps {
  averageCheck: number;
  trend: number;
}

export function AverageCheckWidget({ averageCheck, trend }: AverageCheckWidgetProps) {
  return (
    <StatCard
      title="Средний чек"
      value={formatCurrency(averageCheck)}
      trend={trend}
      trendLabel="к прошлому месяцу"
      icon={<Receipt className="h-6 w-6" />}
    />
  );
}
