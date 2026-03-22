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
const ProductEditPage = lazy(() => import('@/pages/products/ProductEditPage'));
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
const PosPage = lazy(() => import('@/pages/sales/PosPage'));

const ManufacturingPage = lazy(() => import('@/pages/manufacturing/ManufacturingPage'));
const TechMapsPage = lazy(() => import('@/pages/manufacturing/TechMapsPage'));
const TechOperationsPage = lazy(() => import('@/pages/manufacturing/TechOperationsPage'));

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

/** Набор разрешений по умолчанию для системных ролей */
const SYSTEM_ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: ['*'],
  ADMIN: ['*'],
  MANAGER: [
    'products:read', 'products:create', 'products:update', 'products:delete',
    'warehouse:read', 'warehouse:manage',
    'purchases:read', 'purchases:create',
    'sales:read', 'sales:create',
    'crm:read', 'crm:manage',
    'reports:read',
    'finance:read',
    'settings:read',
  ],
  WAREHOUSE_WORKER: [
    'products:read',
    'warehouse:read', 'warehouse:manage',
  ],
  ACCOUNTANT: [
    'finance:read', 'finance:manage',
    'reports:read',
    'purchases:read',
    'sales:read',
  ],
};

function hasPermissionCheck(user: any, permission: string): boolean {
  const role = user?.role?.toUpperCase() || '';
  if (role === 'OWNER' || role === 'ADMIN') return true;

  // If user has a custom role, use its permissions
  const customPerms: string[] = (user as any)?.customRole?.permissions || [];
  if ((user as any)?.customRoleId && customPerms.length > 0) {
    return customPerms.includes(permission);
  }

  // Fall back to system role default permissions
  const systemPerms = SYSTEM_ROLE_PERMISSIONS[role] || [];
  return systemPerms.includes('*') || systemPerms.includes(permission);
}

/** Маршрут с проверкой прав доступа */
function PermissionGate({ permission, children }: { permission: string; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);

  if (hasPermissionCheck(user, permission)) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h2 className="text-xl font-semibold mb-2">Доступ запрещён</h2>
      <p className="text-muted-foreground">У вас нет прав для просмотра этого раздела.</p>
    </div>
  );
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
          <Route path="products" element={<PermissionGate permission="products:read"><ProductsPage /></PermissionGate>} />
          <Route path="products/new" element={<PermissionGate permission="products:create"><ProductCreatePage /></PermissionGate>} />
          <Route path="products/:id" element={<PermissionGate permission="products:read"><ProductDetailPage /></PermissionGate>} />
          <Route path="products/:id/edit" element={<PermissionGate permission="products:update"><ProductEditPage /></PermissionGate>} />
          <Route path="categories" element={<PermissionGate permission="products:read"><CategoriesPage /></PermissionGate>} />

          {/* Склад */}
          <Route path="warehouse" element={<PermissionGate permission="warehouse:read"><WarehousePage /></PermissionGate>} />
          <Route path="warehouse/operations" element={<PermissionGate permission="warehouse:read"><OperationsPage /></PermissionGate>} />
          <Route path="warehouse/operations/new" element={<PermissionGate permission="warehouse:manage"><OperationCreatePage /></PermissionGate>} />
          <Route path="warehouse/inventory" element={<PermissionGate permission="warehouse:read"><InventoryPage /></PermissionGate>} />

          {/* Закупки */}
          <Route path="purchases" element={<PermissionGate permission="purchases:read"><PurchasesPage /></PermissionGate>} />
          <Route path="purchases/new" element={<PermissionGate permission="purchases:create"><PurchaseCreatePage /></PermissionGate>} />
          <Route path="purchases/:id" element={<PermissionGate permission="purchases:read"><PurchaseDetailPage /></PermissionGate>} />
          <Route path="suppliers" element={<PermissionGate permission="purchases:read"><SuppliersPage /></PermissionGate>} />

          {/* Продажи */}
          <Route path="sales" element={<PermissionGate permission="sales:read"><SalesPage /></PermissionGate>} />
          <Route path="sales/new" element={<PermissionGate permission="sales:create"><SaleCreatePage /></PermissionGate>} />
          <Route path="sales/:id" element={<PermissionGate permission="sales:read"><SaleDetailPage /></PermissionGate>} />
          <Route path="returns" element={<PermissionGate permission="sales:read"><ReturnsPage /></PermissionGate>} />
          <Route path="pos" element={<PermissionGate permission="sales:read"><PosPage /></PermissionGate>} />

          {/* Производство */}
          <Route path="manufacturing" element={<PermissionGate permission="warehouse:manage"><ManufacturingPage /></PermissionGate>} />
          <Route path="manufacturing/tech-maps" element={<PermissionGate permission="warehouse:manage"><TechMapsPage /></PermissionGate>} />
          <Route path="manufacturing/tech-operations" element={<PermissionGate permission="warehouse:manage"><TechOperationsPage /></PermissionGate>} />

          {/* CRM */}
          <Route path="crm" element={<PermissionGate permission="crm:read"><CrmDashboardPage /></PermissionGate>} />
          <Route path="crm/contacts" element={<PermissionGate permission="crm:read"><ContactsPage /></PermissionGate>} />
          <Route path="crm/contacts/:id" element={<PermissionGate permission="crm:read"><ContactDetailPage /></PermissionGate>} />
          <Route path="crm/deals" element={<PermissionGate permission="crm:read"><DealsPage /></PermissionGate>} />
          <Route path="crm/deals/:id" element={<PermissionGate permission="crm:read"><DealDetailPage /></PermissionGate>} />
          <Route path="crm/tasks" element={<PermissionGate permission="crm:read"><TasksPage /></PermissionGate>} />
          <Route path="crm/activities" element={<PermissionGate permission="crm:read"><ActivitiesPage /></PermissionGate>} />
          <Route path="crm/deals/kanban" element={<PermissionGate permission="crm:read"><DealsKanbanPage /></PermissionGate>} />
          <Route path="crm/calendar" element={<PermissionGate permission="crm:read"><CalendarPage /></PermissionGate>} />
          <Route path="crm/pipelines" element={<PermissionGate permission="crm:manage"><PipelinesPage /></PermissionGate>} />

          {/* Финансы */}
          <Route path="finance" element={<PermissionGate permission="finance:read"><FinanceDashboardPage /></PermissionGate>} />
          <Route path="finance/accounts" element={<PermissionGate permission="finance:read"><AccountsPage /></PermissionGate>} />
          <Route path="finance/transactions" element={<PermissionGate permission="finance:read"><TransactionsPage /></PermissionGate>} />
          <Route path="finance/reports" element={<PermissionGate permission="finance:read"><ReportsPage /></PermissionGate>} />

          {/* Документы */}
          <Route path="documents" element={<DocumentsPage />} />

          {/* Аналитика */}
          <Route path="analytics" element={<PermissionGate permission="reports:read"><AnalyticsPage /></PermissionGate>} />

          {/* Настройки */}
          <Route path="settings" element={<PermissionGate permission="settings:read"><SettingsPage /></PermissionGate>} />
          <Route path="settings/users" element={<PermissionGate permission="users:manage"><UsersPage /></PermissionGate>} />
          <Route path="settings/warehouses" element={<PermissionGate permission="settings:manage"><WarehouseSettingsPage /></PermissionGate>} />
          <Route path="settings/units" element={<PermissionGate permission="settings:manage"><UnitsPage /></PermissionGate>} />
          <Route path="settings/price-lists" element={<PermissionGate permission="settings:manage"><PriceListsPage /></PermissionGate>} />
          <Route path="settings/audit" element={<PermissionGate permission="settings:manage"><AuditPage /></PermissionGate>} />
          <Route path="settings/roles" element={<PermissionGate permission="users:manage"><RolesPage /></PermissionGate>} />
          <Route path="settings/telegram" element={<PermissionGate permission="settings:manage"><TelegramPage /></PermissionGate>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
