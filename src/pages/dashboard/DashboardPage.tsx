import React from 'react';
import { DollarSign, Users } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useAnalytics';
import { StatCard } from '@/components/shared/StatCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { RevenueWidget } from '@/components/dashboard/widgets/RevenueWidget';
import { OrdersWidget } from '@/components/dashboard/widgets/OrdersWidget';
import { AverageCheckWidget } from '@/components/dashboard/widgets/AverageCheckWidget';
import { CrmFunnelWidget } from '@/components/dashboard/widgets/CrmFunnelWidget';
import { LowStockWidget } from '@/components/dashboard/widgets/LowStockWidget';
import { TodayTasksWidget } from '@/components/dashboard/widgets/TodayTasksWidget';
import { TopProductsWidget } from '@/components/dashboard/widgets/TopProductsWidget';
import { TopCustomersWidget } from '@/components/dashboard/widgets/TopCustomersWidget';
import { formatCurrency, formatNumber } from '@/lib/utils';

/** Моковые данные для демонстрации при отсутствии API */
const mockStats = {
  revenue: 2450000,
  revenueTrend: 12.5,
  orders: 156,
  ordersTrend: 8.3,
  averageCheck: 15705,
  averageCheckTrend: 3.8,
  newCustomers: 23,
  newCustomersTrend: -2.1,
  lowStockProducts: [],
  todayTasks: [],
  topProducts: [],
  topCustomers: [],
  dealsByStage: [
    { stage: 'Новые', count: 12, amount: 340000 },
    { stage: 'В работе', count: 8, amount: 520000 },
    { stage: 'Предложение', count: 5, amount: 280000 },
    { stage: 'Согласование', count: 3, amount: 190000 },
    { stage: 'Закрыто', count: 15, amount: 870000 },
  ],
  revenueChart: [
    { date: 'Янв', revenue: 1800000, expenses: 1200000 },
    { date: 'Фев', revenue: 2100000, expenses: 1350000 },
    { date: 'Мар', revenue: 1950000, expenses: 1280000 },
    { date: 'Апр', revenue: 2300000, expenses: 1450000 },
    { date: 'Май', revenue: 2150000, expenses: 1380000 },
    { date: 'Июн', revenue: 2450000, expenses: 1520000 },
  ],
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const s = stats || mockStats;

  if (isLoading) return <LoadingSkeleton type="page" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Главная</h1>
        <p className="text-muted-foreground">Обзор ключевых показателей</p>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Выручка"
          value={formatCurrency(s.revenue)}
          trend={s.revenueTrend}
          trendLabel="к прошлому месяцу"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <OrdersWidget orders={s.orders} trend={s.ordersTrend} />
        <AverageCheckWidget averageCheck={s.averageCheck} trend={s.averageCheckTrend} />
        <StatCard
          title="Новые клиенты"
          value={formatNumber(s.newCustomers)}
          trend={s.newCustomersTrend}
          trendLabel="к прошлому месяцу"
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueWidget data={s.revenueChart} />
        <CrmFunnelWidget data={s.dealsByStage} />
      </div>

      {/* Нижние виджеты */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LowStockWidget products={s.lowStockProducts} />
        <TodayTasksWidget tasks={s.todayTasks} />
        <TopProductsWidget data={s.topProducts} />
        <TopCustomersWidget data={s.topCustomers} />
      </div>
    </div>
  );
}
