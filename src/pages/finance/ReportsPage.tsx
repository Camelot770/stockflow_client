import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, LineChart, Line,
} from 'recharts';
import { FileBarChart, TrendingUp, TrendingDown, ArrowDownRight, Users, DollarSign, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChartCard } from '@/components/shared/ChartCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePnLReport, useCashFlowReport } from '@/hooks/useFinance';
import { formatCurrency, formatCompact } from '@/lib/utils';

const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
};

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  color: '#f1f5f9',
};

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}


export default function ReportsPage() {
  const defaultRange = getDefaultDateRange();
  const [dateRange, setDateRange] = useState(defaultRange);

  const { data: pnlRaw } = usePnLReport({ from: dateRange.start, to: dateRange.end });
  const { data: cashflowRaw } = useCashFlowReport({ from: dateRange.start, to: dateRange.end });

  // Трансформируем ответ бэкенда в формат для компонента
  const pnlData = useMemo(() => {
    if (!pnlRaw) return null;
    // Бэкенд возвращает { totalIncome, totalExpense, netProfit, margin, incomeByCategory, expenseByCategory }
    if ('totalIncome' in pnlRaw) {
      const raw = pnlRaw as any;
      const categories: { category: string; type: 'income' | 'expense'; amount: number }[] = [];
      if (raw.incomeByCategory) {
        Object.entries(raw.incomeByCategory).forEach(([cat, amount]) => {
          categories.push({ category: cat, type: 'income', amount: Number(amount) });
        });
      }
      if (raw.expenseByCategory) {
        Object.entries(raw.expenseByCategory).forEach(([cat, amount]) => {
          categories.push({ category: cat, type: 'expense', amount: Number(amount) });
        });
      }
      return {
        summary: {
          income: raw.totalIncome || 0,
          expenses: raw.totalExpense || 0,
          profit: raw.netProfit || 0,
        },
        monthly: raw.monthly || null, // Показываем только если бэкенд вернул помесячные данные
        categories: categories.length > 0 ? categories : null,
      };
    }
    // Если уже в нужном формате (summary, monthly, categories)
    if (pnlRaw.summary) return pnlRaw as any;
    return null;
  }, [pnlRaw]);

  // Трансформируем данные cashflow из бэкенда
  const cashflowData = useMemo(() => {
    if (!cashflowRaw) return null;
    const raw = cashflowRaw as any;
    // Если бэкенд вернул массив — используем напрямую
    if (Array.isArray(raw) && raw.length > 0) return raw;
    // Если бэкенд вернул объект с monthly
    if (raw.monthly && Array.isArray(raw.monthly) && raw.monthly.length > 0) return raw.monthly;
    return null;
  }, [cashflowRaw]);

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
        <h1 className="text-2xl font-bold">Финансовые отчёты</h1>
        <p className="text-muted-foreground">Прибыли и убытки, движение денег, задолженности</p>
      </div>

      <Tabs defaultValue="pnl">
        <TabsList>
          <TabsTrigger value="pnl">Прибыли и убытки</TabsTrigger>
          <TabsTrigger value="cashflow">Движение денег</TabsTrigger>
          <TabsTrigger value="receivables">Дебиторка</TabsTrigger>
          <TabsTrigger value="payables">Кредиторка</TabsTrigger>
        </TabsList>

        {/* P&L Tab */}
        <TabsContent value="pnl" className="space-y-6">
          <DateRangePicker />

          {!pnlData ? (
            <EmptyState
              title="Нет данных за период"
              description="Данные о прибылях и убытках за выбранный период отсутствуют. Попробуйте выбрать другой диапазон дат."
              icon={<FileBarChart className="h-8 w-8 text-muted-foreground" />}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Доходы</p>
                        <p className="text-xl font-bold text-green-500">{formatCurrency(pnlData.summary.income)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Расходы</p>
                        <p className="text-xl font-bold text-red-500">{formatCurrency(pnlData.summary.expenses)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Чистая прибыль</p>
                        <p className="text-xl font-bold">{formatCurrency(pnlData.summary.profit)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {pnlData.monthly ? (
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
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Доходы и расходы по месяцам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EmptyState
                      title="Нет данных за период"
                      description="Помесячная разбивка доходов и расходов недоступна для выбранного периода"
                    />
                  </CardContent>
                </Card>
              )}

              {pnlData.categories ? (
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
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Разбивка по категориям</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EmptyState
                      title="Нет данных"
                      description="Разбивка по категориям недоступна для выбранного периода"
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Cashflow Tab */}
        <TabsContent value="cashflow" className="space-y-6">
          {!cashflowData ? (
            <Card>
              <CardContent className="p-6">
                <EmptyState
                  title="Нет данных о движении денежных средств"
                  description="Данные о поступлениях и выплатах за выбранный период отсутствуют. Добавьте транзакции, чтобы увидеть отчёт."
                  icon={<DollarSign className="h-8 w-8 text-muted-foreground" />}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <ChartCard title="Движение денежных средств">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={cashflowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => formatCompact(v)} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => {
                      const labels: Record<string, string> = { inflow: 'Поступления', outflow: 'Выплаты', balance: 'Баланс' };
                      return [formatCurrency(v), labels[name] || name];
                    }} />
                    <Legend formatter={(value) => {
                      const labels: Record<string, string> = { inflow: 'Поступления', outflow: 'Выплаты', balance: 'Баланс' };
                      return labels[value] || value;
                    }} />
                    <Bar dataKey="inflow" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outflow" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Баланс по месяцам">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={cashflowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => formatCompact(v)} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'Баланс']} />
                    <Line type="monotone" dataKey="balance" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </>
          )}
        </TabsContent>

        {/* Receivables */}
        <TabsContent value="receivables">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Дебиторская задолженность</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="Данные недоступны"
                description="Раздел дебиторской задолженности находится в разработке. Данные о неоплаченных продажах будут доступны в следующих обновлениях."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payables */}
        <TabsContent value="payables">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-primary" />
              <CardTitle>Кредиторская задолженность</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="Данные недоступны"
                description="Раздел кредиторской задолженности находится в разработке. Данные о неоплаченных закупках будут доступны в следующих обновлениях."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
