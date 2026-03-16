import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAuthCheck } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

/** Ленивая загрузка страниц */
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));

const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'));
const ProductCreatePage = lazy(() => import('@/pages/products/ProductCreatePage'));
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'));
const CategoriesPage = lazy(() => import('@/pages/products/CategoriesPage'));

const WarehousePage = lazy(() => import('@/pages/warehouse/WarehousePage'));
const OperationsPage = lazy(() => import('@/pages/warehouse/OperationsPage'));
const OperationCreatePage = lazy(() => import('@/pages/warehouse/OperationCreatePage'));
const InventoryPage = lazy(() => import('@/pages/warehouse/InventoryPage'));

const PurchasesPage = lazy(() => import('@/pages/purchases/PurchasesPage'));
const PurchaseCreatePage = lazy(() => import('@/pages/purchases/PurchaseCreatePage'));
const PurchaseDetailPage = lazy(() => import('@/pages/purchases/PurchaseDetailPage'));
const SuppliersPage = lazy(() => import('@/pages/purchases/SuppliersPage'));

const SalesPage = lazy(() => import('@/pages/sales/SalesPage'));
const SaleCreatePage = lazy(() => import('@/pages/sales/SaleCreatePage'));
const SaleDetailPage = lazy(() => import('@/pages/sales/SaleDetailPage'));
const ReturnsPage = lazy(() => import('@/pages/sales/ReturnsPage'));

const CrmDashboardPage = lazy(() => import('@/pages/crm/CrmDashboardPage'));
const ContactsPage = lazy(() => import('@/pages/crm/ContactsPage'));
const ContactDetailPage = lazy(() => import('@/pages/crm/ContactDetailPage'));
const DealsPage = lazy(() => import('@/pages/crm/DealsPage'));
const DealDetailPage = lazy(() => import('@/pages/crm/DealDetailPage'));
const TasksPage = lazy(() => import('@/pages/crm/TasksPage'));
const ActivitiesPage = lazy(() => import('@/pages/crm/ActivitiesPage'));
const PipelinesPage = lazy(() => import('@/pages/crm/PipelinesPage'));
const DealsKanbanPage = lazy(() => import('@/pages/crm/DealsKanbanPage'));
const CalendarPage = lazy(() => import('@/pages/crm/CalendarPage'));

const FinanceDashboardPage = lazy(() => import('@/pages/finance/FinanceDashboardPage'));
const AccountsPage = lazy(() => import('@/pages/finance/AccountsPage'));
const TransactionsPage = lazy(() => import('@/pages/finance/TransactionsPage'));
const ReportsPage = lazy(() => import('@/pages/finance/ReportsPage'));

const DocumentsPage = lazy(() => import('@/pages/documents/DocumentsPage'));
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'));

const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const UsersPage = lazy(() => import('@/pages/settings/UsersPage'));
const WarehouseSettingsPage = lazy(() => import('@/pages/settings/WarehouseSettingsPage'));
const UnitsPage = lazy(() => import('@/pages/settings/UnitsPage'));
const PriceListsPage = lazy(() => import('@/pages/settings/PriceListsPage'));
const AuditPage = lazy(() => import('@/pages/settings/AuditPage'));
const RolesPage = lazy(() => import('@/pages/settings/RolesPage'));
const TelegramPage = lazy(() => import('@/pages/settings/TelegramPage'));

/** Защищённый маршрут */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-2">
            StockFlow
          </h1>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/** Публичный маршрут (редирект если авторизован) */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
}

const PageLoader = () => <LoadingSkeleton type="page" />;

export default function App() {
  useAuthCheck();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

        {/* Защищённые маршруты */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          {/* Товары */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductCreatePage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />

          {/* Склад */}
          <Route path="warehouse" element={<WarehousePage />} />
          <Route path="warehouse/operations" element={<OperationsPage />} />
          <Route path="warehouse/operations/new" element={<OperationCreatePage />} />
          <Route path="warehouse/inventory" element={<InventoryPage />} />

          {/* Закупки */}
          <Route path="purchases" element={<PurchasesPage />} />
          <Route path="purchases/new" element={<PurchaseCreatePage />} />
          <Route path="purchases/:id" element={<PurchaseDetailPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />

          {/* Продажи */}
          <Route path="sales" element={<SalesPage />} />
          <Route path="sales/new" element={<SaleCreatePage />} />
          <Route path="sales/:id" element={<SaleDetailPage />} />
          <Route path="returns" element={<ReturnsPage />} />

          {/* CRM */}
          <Route path="crm" element={<CrmDashboardPage />} />
          <Route path="crm/contacts" element={<ContactsPage />} />
          <Route path="crm/contacts/:id" element={<ContactDetailPage />} />
          <Route path="crm/deals" element={<DealsPage />} />
          <Route path="crm/deals/:id" element={<DealDetailPage />} />
          <Route path="crm/tasks" element={<TasksPage />} />
          <Route path="crm/activities" element={<ActivitiesPage />} />
          <Route path="crm/deals/kanban" element={<DealsKanbanPage />} />
          <Route path="crm/calendar" element={<CalendarPage />} />
          <Route path="crm/pipelines" element={<PipelinesPage />} />

          {/* Финансы */}
          <Route path="finance" element={<FinanceDashboardPage />} />
          <Route path="finance/accounts" element={<AccountsPage />} />
          <Route path="finance/transactions" element={<TransactionsPage />} />
          <Route path="finance/reports" element={<ReportsPage />} />

          {/* Документы */}
          <Route path="documents" element={<DocumentsPage />} />

          {/* Аналитика */}
          <Route path="analytics" element={<AnalyticsPage />} />

          {/* Настройки */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/users" element={<UsersPage />} />
          <Route path="settings/warehouses" element={<WarehouseSettingsPage />} />
          <Route path="settings/units" element={<UnitsPage />} />
          <Route path="settings/price-lists" element={<PriceListsPage />} />
          <Route path="settings/audit" element={<AuditPage />} />
          <Route path="settings/roles" element={<RolesPage />} />
          <Route path="settings/telegram" element={<TelegramPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
