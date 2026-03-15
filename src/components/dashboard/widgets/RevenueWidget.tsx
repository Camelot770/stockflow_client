import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartCard } from '@/components/shared/ChartCard';
import { formatCurrency } from '@/lib/utils';

interface RevenueWidgetProps {
  data: { date: string; revenue: number; expenses: number }[];
}

export function RevenueWidget({ data }: RevenueWidgetProps) {
  return (
    <ChartCard title="Выручка и расходы" className="col-span-2">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number, name: string) => [formatCurrency(value), name === 'revenue' ? 'Выручка' : 'Расходы']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
          <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpenses)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
