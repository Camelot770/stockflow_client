import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartCard } from '@/components/shared/ChartCard';
import { formatCurrency } from '@/lib/utils';

interface CrmFunnelWidgetProps {
  data: { stage: string; count: number; amount: number }[];
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

export function CrmFunnelWidget({ data }: CrmFunnelWidgetProps) {
  return (
    <ChartCard title="Воронка CRM">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" hide />
          <YAxis dataKey="stage" type="category" width={100} fontSize={12} stroke="#64748b" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }}
            formatter={(value: number, _: string, item: { payload: { amount: number } }) => [
              `${value} сделок (${formatCurrency(item.payload.amount)})`,
              'Кол-во',
            ]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
