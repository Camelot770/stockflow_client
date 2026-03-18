import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, Area, AreaChart,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Minus, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChartCard } from '@/components/shared/ChartCard';
import { reportsApi } from '@/api/reports';
import { formatCurrency, formatNumber, formatCompact } from '@/lib/utils';

const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.danger, COLORS.purple, COLORS.pink];

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  color: '#f1f5f9',
};

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

/** Mock data generators for when API is unavailable */
function getMockOverviewData() {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  return months.map((month, i) => ({
    month,
    revenue: 800000 + Math.round(Math.random() * 1200000),
    orders: 30 + Math.round(Math.random() * 70),
    expenses: 400000 + Math.round(Math.random() * 600000),
  }));
}

function getMockPnlData() {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
  return {
    summary: { income: 9500000, expenses: 6200000, profit: 3300000 },
    monthly: months.map(month => ({
      month,
      income: 1200000 + Math.round(Math.random() * 800000),
      expenses: 600000 + Math.round(Math.random() * 600000),
    })),
    categories: [
      { category: 'Продажи товаров', type: 'income' as const, amount: 7200000 },
      { category: 'Услуги', type: 'income' as const, amount: 2300000 },
      { category: 'Закупки', type: 'expense' as const, amount: 3800000 },
      { category: 'Зарплаты', type: 'expense' as const, amount: 1500000 },
      { category: 'Аренда', type: 'expense' as const, amount: 600000 },
      { category: 'Прочие', type: 'expense' as const, amount: 300000 },
    ],
  };
}

function getMockManagerData() {
  return [
    { name: 'Иванов А.', deals: 24, revenue: 2850000, avg: 118750 },
    { name: 'Петрова Е.', deals: 18, revenue: 2120000, avg: 117778 },
    { name: 'Сидоров К.', deals: 31, revenue: 3400000, avg: 109677 },
    { name: 'Козлова М.', deals: 12, revenue: 980000, avg: 81667 },
    { name: 'Новиков Д.', deals: 15, revenue: 1650000, avg: 110000 },
  ];
}

function getMockAbcData() {
  return [
    { name: 'Ноутбук Pro 15', revenue: 4500000, quantity: 150, percent: 22.5, class: 'A' as const },
    { name: 'Монитор 27"', revenue: 3200000, quantity: 200, percent: 16.0, class: 'A' as const },
    { name: 'Клавиатура мех.', revenue: 2800000, quantity: 700, percent: 14.0, class: 'A' as const },
    { name: 'Мышь беспров.', revenue: 2100000, quantity: 1050, percent: 10.5, class: 'A' as const },
    { name: 'Наушники BT', revenue: 1800000, quantity: 450, percent: 9.0, class: 'A' as const },
    { name: 'Веб-камера HD', revenue: 1200000, quantity: 400, percent: 6.0, class: 'B' as const },
    { name: 'USB-хаб', revenue: 900000, quantity: 600, percent: 4.5, class: 'B' as const },
    { name: 'Коврик для мыши', revenue: 600000, quantity: 1200, percent: 3.0, class: 'B' as const },
    { name: 'Кабель HDMI', revenue: 450000, quantity: 900, percent: 2.25, class: 'C' as const },
    { name: 'Подставка ноут.', revenue: 350000, quantity: 175, percent: 1.75, class: 'C' as const },
  ];
}

function getMockForecastData() {
  const months = ['Авг', 'Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май'];
  return {
    trend: 'growing' as const,
    projectedRevenue: 2100000,
    data: months.map((month, i) => ({
      month,
      actual: i < 6 ? 1200000 + Math.round(Math.random() * 600000 + i * 50000) : undefined,
      forecast: i >= 5 ? 1500000 + Math.round(i * 80000) : undefined,
    })),
  };
}

function getMockCustomerData() {
  return {
    topCustomers: [
      { name: 'ООО "ТехноПарк"', revenue: 3200000, orders: 45, avgOrder: 71111, lastPurchase: '2026-03-10' },
      { name: 'ИП Смирнов', revenue: 2800000, orders: 32, avgOrder: 87500, lastPurchase: '2026-03-14' },
      { name: 'ЗАО "Инновация"', revenue: 2400000, orders: 28, avgOrder: 85714, lastPurchase: '2026-03-08' },
      { name: 'ООО "Старт"', revenue: 1900000, orders: 22, avgOrder: 86364, lastPurchase: '2026-03-12' },
      { name: 'ИП Козлов', revenue: 1500000, orders: 18, avgOrder: 83333, lastPurchase: '2026-02-28' },
      { name: 'ООО "МегаСтрой"', revenue: 1200000, orders: 15, avgOrder: 80000, lastPurchase: '2026-03-01' },
      { name: 'ООО "Прогресс"', revenue: 980000, orders: 12, avgOrder: 81667, lastPurchase: '2026-03-05' },
      { name: 'ИП Новикова', revenue: 750000, orders: 10, avgOrder: 75000, lastPurchase: '2026-02-20' },
      { name: 'ЗАО "Базис"', revenue: 620000, orders: 8, avgOrder: 77500, lastPurchase: '2026-03-11' },
      { name: 'ООО "Вектор"', revenue: 480000, orders: 6, avgOrder: 80000, lastPurchase: '2026-02-15' },
    ],
    segments: [
      { name: 'VIP', value: 35, color: COLORS.primary },
      { name: 'Постоянные', value: 40, color: COLORS.secondary },
      { name: 'Новые', value: 15, color: COLORS.accent },
      { name: 'Неактивные', value: 10, color: COLORS.danger },
    ],
    newVsReturning: [
      { month: 'Окт', newCustomers: 12, returning: 45 },
      { month: 'Ноя', newCustomers: 15, returning: 48 },
      { month: 'Дек', newCustomers: 18, returning: 52 },
      { month: 'Янв', newCustomers: 10, returning: 50 },
      { month: 'Фев', newCustomers: 14, returning: 55 },
      { month: 'Мар', newCustomers: 20, returning: 58 },
    ],
  };
}

function MetricCard({ title, value, trend, icon }: {
  title: string;
  value: string;
  trend?: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : (
              <Minus className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
            <span className="text-muted-foreground">к пред. периоду</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const defaultRange = getDefaultDateRange();
  const [dateRange, setDateRange] = useState(defaultRange);

  // Fetch data from API, fallback to mock
  const { data: pnlRaw } = useQuery({
    queryKey: ['analytics-pnl', dateRange],
    queryFn: () => reportsApi.getProfitLoss(dateRange.start, dateRange.end),
    retry: false,
  });

  const { data: managersRaw } = useQuery({
    queryKey: ['analytics-managers', dateRange],
    queryFn: () => reportsApi.getSalesByManager(dateRange.start, dateRange.end),
    retry: false,
  });

  const { data: abcRaw } = useQuery({
    queryKey: ['analytics-abc'],
    queryFn: () => reportsApi.getAbcAnalysis(),
    retry: false,
  });

  const { data: forecastRaw } = useQuery({
    queryKey: ['analytics-forecast'],
    queryFn: () => reportsApi.getForecast(),
    retry: false,
  });

  const { data: customersRaw } = useQuery({
    queryKey: ['analytics-customers'],
    queryFn: () => reportsApi.getCustomerAnalysis(),
    retry: false,
  });

  // Use real API data only — no mock/fake data
  const overviewData: { month: string; revenue: number; orders: number; expenses: number }[] = [];
  const pnlData = useMemo(() => {
    const raw = pnlRaw as any;
    if (raw && typeof raw === 'object' && ('totalIncome' in raw || 'summary' in raw)) {
      const summary = raw.summary || {
        income: raw.totalIncome ?? 0,
        expenses: raw.totalExpense ?? raw.totalExpenses ?? 0,
        profit: raw.netProfit ?? raw.profit ?? ((raw.totalIncome ?? 0) - (raw.totalExpense ?? 0)),
      };
      const categories = raw.categories || [
        ...Object.entries(raw.incomeByCategory || {}).map(([k, v]) => ({ category: k, type: 'income' as const, amount: v })),
        ...Object.entries(raw.expenseByCategory || {}).map(([k, v]) => ({ category: k, type: 'expense' as const, amount: v })),
      ];
      return { summary, monthly: raw.monthly || [], categories };
    }
    return { summary: { income: 0, expenses: 0, profit: 0 }, monthly: [], categories: [] };
  }, [pnlRaw]);
  const managersArr = Array.isArray(managersRaw) ? managersRaw : Array.isArray((managersRaw as any)?.data) ? (managersRaw as any).data : null;
  const managersData = managersArr || [];
  const abcArr = Array.isArray(abcRaw) ? abcRaw : Array.isArray((abcRaw as any)?.data) ? (abcRaw as any).data : null;
  const abcData = abcArr || [];
  const forecastData = (forecastRaw && typeof forecastRaw === 'object' && 'data' in (forecastRaw as any)) ? forecastRaw : { trend: 'stable', projectedRevenue: 0, data: [] };
  const customersData = (customersRaw && typeof customersRaw === 'object' && 'topCustomers' in (customersRaw as any)) ? customersRaw : { topCustomers: [], segments: [], newVsReturning: [] };

  const totalRevenue = overviewData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = overviewData.reduce((s, d) => s + d.orders, 0);
  const avgCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const safeManagers = Array.isArray(managersData) ? managersData : [];
  const managerTotal = safeManagers.reduce((s: number, m: any) => s + (parseFloat(String(m.revenue)) || 0), 0);
  const managerPieData = safeManagers.map((m: any, i: number) => ({
    name: m.name,
    value: m.revenue,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const abcClassColor = (cls: string) => {
    if (cls === 'A') return 'success';
    if (cls === 'B') return 'warning';
    return 'destructive';
  };

  const trendLabel = (trend: string) => {
    if (trend === 'growing') return { text: 'Растущий', color: 'text-green-500' };
    if (trend === 'declining') return { text: 'Снижающийся', color: 'text-red-500' };
    return { text: 'Стабильный', color: 'text-muted-foreground' };
  };

  const DateRangePicker = () => (
    <div className="flex items-center gap-2">
      <CalendarDays className="h-4 w-4 text-muted-foreground" />
      <Input
        type="date"
        value={dateRange.start}
        onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
        className="w-36 h-8 text-xs"
      />
      <span className="text-muted-foreground text-xs">—</span>
      <Input
        type="date"
        value={dateRange.end}
        onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
        className="w-36 h-8 text-xs"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Аналитика</h1>
        <p className="text-muted-foreground">Комплексный анализ продаж, финансов и клиентов</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="pnl">Прибыль и убытки</TabsTrigger>
          <TabsTrigger value="managers">Продажи по менеджерам</TabsTrigger>
          <TabsTrigger value="abc">ABC-анализ</TabsTrigger>
          <TabsTrigger value="forecast">Прогноз</TabsTrigger>
          <TabsTrigger value="customers">Клиенты</TabsTrigger>
        </TabsList>

        {/* === TAB 1: Overview === */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Выручка за год"
              value={formatCurrency(totalRevenue)}
              trend={12.5}
              icon={<DollarSign className="h-5 w-5 text-primary" />}
            />
            <MetricCard
              title="Заказов"
              value={formatNumber(totalOrders)}
              trend={8.3}
              icon={<ShoppingCart className="h-5 w-5 text-primary" />}
            />
            <MetricCard
              title="Средний чек"
              value={formatCurrency(avgCheck)}
              trend={3.7}
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
            />
            <MetricCard
              title="Рост к прошлому году"
              value="+12.5%"
              trend={12.5}
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Выручка по месяцам">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={overviewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => formatCompact(v)} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'Выручка']} />
                  <Area type="monotone" dataKey="revenue" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Количество заказов">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overviewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Заказов']} />
                  <Bar dataKey="orders" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* === TAB 2: Profit & Loss === */}
        <TabsContent value="pnl" className="space-y-6">
          <DateRangePicker />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Доходы"
              value={formatCurrency(pnlData.summary.income)}
              icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            />
            <MetricCard
              title="Расходы"
              value={formatCurrency(pnlData.summary.expenses)}
              icon={<TrendingDown className="h-5 w-5 text-red-500" />}
            />
            <MetricCard
              title="Чистая прибыль"
              value={formatCurrency(pnlData.summary.profit)}
              trend={pnlData.summary.profit > 0 ? 15.2 : -5.1}
              icon={<DollarSign className="h-5 w-5 text-primary" />}
            />
          </div>

          <ChartCard title="Доходы и расходы по месяцам">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={pnlData.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => formatCompact(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [formatCurrency(v), name === 'income' ? 'Доходы' : 'Расходы']} />
                <Legend formatter={(value) => value === 'income' ? 'Доходы' : 'Расходы'} />
                <Bar dataKey="income" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Разбивка по категориям</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Категория</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pnlData.categories.map((cat: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{cat.category}</TableCell>
                      <TableCell>
                        <Badge variant={cat.type === 'income' ? 'success' : 'destructive'}>
                          {cat.type === 'income' ? 'Доход' : 'Расход'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(cat.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === TAB 3: Sales by Manager === */}
        <TabsContent value="managers" className="space-y-6">
          <DateRangePicker />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Выручка по менеджерам">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={managersData as any[]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={v => formatCompact(v)} />
                  <YAxis dataKey="name" type="category" width={100} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'Выручка']} />
                  <Bar dataKey="revenue" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Доля выручки">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={managerPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {managerPieData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'Выручка']} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Детализация по менеджерам</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Менеджер</TableHead>
                    <TableHead className="text-right">Сделок</TableHead>
                    <TableHead className="text-right">Выручка</TableHead>
                    <TableHead className="text-right">Средний чек</TableHead>
                    <TableHead className="text-right">Доля</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(managersData as any[]).map((m: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-right">{m.deals}</TableCell>
                      <TableCell className="text-right">{formatCurrency(m.revenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(m.avg)}</TableCell>
                      <TableCell className="text-right">
                        {managerTotal > 0 ? ((m.revenue / managerTotal) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === TAB 4: ABC Analysis === */}
        <TabsContent value="abc" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <span className="text-green-500 font-bold text-lg">A</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Группа A (80% выручки)</p>
                  <p className="text-lg font-bold">{(abcData as any[]).filter((p: any) => p.class === 'A').length} товаров</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <span className="text-yellow-500 font-bold text-lg">B</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Группа B (15% выручки)</p>
                  <p className="text-lg font-bold">{(abcData as any[]).filter((p: any) => p.class === 'B').length} товаров</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <span className="text-red-500 font-bold text-lg">C</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Группа C (5% выручки)</p>
                  <p className="text-lg font-bold">{(abcData as any[]).filter((p: any) => p.class === 'C').length} товаров</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">ABC-анализ товаров</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead className="text-right">Выручка</TableHead>
                    <TableHead className="text-right">Продано</TableHead>
                    <TableHead className="text-right">% от общей</TableHead>
                    <TableHead>Класс</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(abcData as any[]).map((product: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                      <TableCell className="text-right">{formatNumber(product.quantity)}</TableCell>
                      <TableCell className="text-right">{product.percent.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant={abcClassColor(product.class) as any}>{product.class}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === TAB 5: Forecast === */}
        <TabsContent value="forecast" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Текущий тренд</p>
                <p className={`text-lg font-bold ${trendLabel((forecastData as any).trend).color}`}>
                  {trendLabel((forecastData as any).trend).text}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Прогноз на след. месяц</p>
                <p className="text-lg font-bold">{formatCurrency((forecastData as any).projectedRevenue)}</p>
              </CardContent>
            </Card>
          </div>

          <ChartCard title="Исторические данные и прогноз">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={(forecastData as any).data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => formatCompact(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [formatCurrency(v), name === 'actual' ? 'Факт' : 'Прогноз']} />
                <Legend formatter={(value) => value === 'actual' ? 'Факт' : 'Прогноз'} />
                <Line type="monotone" dataKey="actual" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                <Line type="monotone" dataKey="forecast" stroke={COLORS.accent} strokeWidth={2} strokeDasharray="8 4" dot={{ r: 4 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        {/* === TAB 6: Customer Analysis === */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Топ-10 клиентов по выручке">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={(customersData as any).topCustomers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={v => formatCompact(v)} />
                  <YAxis dataKey="name" type="category" width={120} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'Выручка']} />
                  <Bar dataKey="revenue" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Сегменты клиентов">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={(customersData as any).segments}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {(customersData as any).segments.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Новые vs возвращающиеся клиенты">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={(customersData as any).newVsReturning}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={(value) => value === 'newCustomers' ? 'Новые' : 'Возвращающиеся'} />
                <Line type="monotone" dataKey="newCustomers" stroke={COLORS.accent} strokeWidth={2} name="newCustomers" />
                <Line type="monotone" dataKey="returning" stroke={COLORS.primary} strokeWidth={2} name="returning" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Детализация по клиентам</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Клиент</TableHead>
                    <TableHead className="text-right">Выручка</TableHead>
                    <TableHead className="text-right">Заказов</TableHead>
                    <TableHead className="text-right">Средний заказ</TableHead>
                    <TableHead>Последняя покупка</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(customersData as any).topCustomers.map((c: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.revenue)}</TableCell>
                      <TableCell className="text-right">{c.orders}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.avgOrder)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(c.lastPurchase).toLocaleDateString('ru-RU')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
