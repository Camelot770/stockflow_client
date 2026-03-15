import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartCard } from '@/components/shared/ChartCard';

/** Моковые данные для демонстрации */
const salesData = [
  { month: 'Янв', sales: 1200000 },
  { month: 'Фев', sales: 1450000 },
  { month: 'Мар', sales: 1350000 },
  { month: 'Апр', sales: 1600000 },
  { month: 'Май', sales: 1500000 },
  { month: 'Июн', sales: 1800000 },
];

const abcData = [
  { name: 'Группа A', value: 80, color: '#3b82f6' },
  { name: 'Группа B', value: 15, color: '#f59e0b' },
  { name: 'Группа C', value: 5, color: '#64748b' },
];

const conversionData = [
  { stage: 'Лиды', value: 100 },
  { stage: 'Квалификация', value: 75 },
  { stage: 'Предложение', value: 45 },
  { stage: 'Переговоры', value: 30 },
  { stage: 'Закрыто', value: 18 },
];

const managerData = [
  { name: 'Иванов', deals: 12, revenue: 850000 },
  { name: 'Петров', deals: 9, revenue: 620000 },
  { name: 'Сидоров', deals: 15, revenue: 1100000 },
  { name: 'Козлов', deals: 7, revenue: 430000 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Аналитика</h1><p className="text-muted-foreground">Анализ продаж, остатков и CRM</p></div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Продажи</TabsTrigger>
          <TabsTrigger value="stock">Остатки (ABC)</TabsTrigger>
          <TabsTrigger value="crm">CRM воронка</TabsTrigger>
          <TabsTrigger value="managers">Менеджеры</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <ChartCard title="Продажи по месяцам">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesData}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} formatter={(v: number) => [`${(v / 1000000).toFixed(2)} млн`, 'Продажи']} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="stock">
          <ChartCard title="ABC-анализ товаров">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={abcData} cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                    {abcData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </TabsContent>

        <TabsContent value="crm">
          <ChartCard title="Конверсия воронки CRM">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={conversionData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="stage" type="category" width={100} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="managers">
          <ChartCard title="Эффективность менеджеров">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={managerData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Bar dataKey="deals" fill="#3b82f6" name="Сделки" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
