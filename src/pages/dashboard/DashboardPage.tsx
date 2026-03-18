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

/** Пустые данные при отсутствии данных с API */
const emptyStats = {
  revenue: 0,
  revenueTrend: 0,
  orders: 0,
  ordersTrend: 0,
  averageCheck: 0,
  averageCheckTrend: 0,
  newCustomers: 0,
  newCustomersTrend: 0,
  lowStockProducts: [],
  todayTasks: [],
  topProducts: [],
  topCustomers: [],
  dealsByStage: [],
  revenueChart: [],
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const s = stats && typeof stats === 'object' && 'revenue' in stats ? stats : emptyStats;

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LowStockWidget products={s.lowStockProducts} />
        <TodayTasksWidget tasks={s.todayTasks} />
        <TopProductsWidget data={s.topProducts} />
        <TopCustomersWidget data={s.topCustomers} />
      </div>
    </div>
  );
}
