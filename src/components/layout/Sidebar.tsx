import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart, TrendingUp,
  Users, Handshake, ListTodo, Activity, GitBranch, Wallet, ArrowLeftRight,
  FileBarChart, FileText, BarChart3, Settings, ChevronLeft, ChevronRight,
  FolderTree, Undo2, Truck, ClipboardList, Building2, Columns, Calendar,
  Shield, Send, Monitor, Cog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  permission?: string;
}

const navGroups: NavGroup[] = [
  {
    title: 'Основное',
    items: [
      { label: 'Главная', href: '/', icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Товары',
    permission: 'products:read',
    items: [
      { label: 'Товары', href: '/products', icon: <Package className="h-4 w-4" /> },
      { label: 'Категории', href: '/categories', icon: <FolderTree className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Склад',
    permission: 'warehouse:read',
    items: [
      { label: 'Остатки', href: '/warehouse', icon: <Warehouse className="h-4 w-4" /> },
      { label: 'Операции', href: '/warehouse/operations', icon: <ArrowLeftRight className="h-4 w-4" /> },
      { label: 'Инвентаризация', href: '/warehouse/inventory', icon: <ClipboardList className="h-4 w-4" /> },
      { label: 'Склады', href: '/settings/warehouses', icon: <Building2 className="h-4 w-4" />, permission: 'warehouse:manage' },
    ],
  },
  {
    title: 'Закупки',
    permission: 'purchases:read',
    items: [
      { label: 'Закупки', href: '/purchases', icon: <ShoppingCart className="h-4 w-4" /> },
      { label: 'Поставщики', href: '/suppliers', icon: <Truck className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Продажи',
    permission: 'sales:read',
    items: [
      { label: 'Продажи', href: '/sales', icon: <TrendingUp className="h-4 w-4" /> },
      { label: 'Касса', href: '/pos', icon: <Monitor className="h-4 w-4" /> },
      { label: 'Возвраты', href: '/returns', icon: <Undo2 className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Производство',
    permission: 'warehouse:manage',
    items: [
      { label: 'Сборка', href: '/manufacturing', icon: <Cog className="h-4 w-4" /> },
    ],
  },
  {
    title: 'CRM',
    permission: 'crm:read',
    items: [
      { label: 'Обзор CRM', href: '/crm', icon: <Building2 className="h-4 w-4" /> },
      { label: 'Контакты', href: '/crm/contacts', icon: <Users className="h-4 w-4" /> },
      { label: 'Сделки', href: '/crm/deals', icon: <Handshake className="h-4 w-4" /> },
      { label: 'Канбан', href: '/crm/deals/kanban', icon: <Columns className="h-4 w-4" /> },
      { label: 'Календарь', href: '/crm/calendar', icon: <Calendar className="h-4 w-4" /> },
      { label: 'Задачи', href: '/crm/tasks', icon: <ListTodo className="h-4 w-4" /> },
      { label: 'Активности', href: '/crm/activities', icon: <Activity className="h-4 w-4" /> },
      { label: 'Воронки', href: '/crm/pipelines', icon: <GitBranch className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Финансы',
    permission: 'finance:read',
    items: [
      { label: 'Обзор', href: '/finance', icon: <Wallet className="h-4 w-4" /> },
      { label: 'Счета', href: '/finance/accounts', icon: <Wallet className="h-4 w-4" /> },
      { label: 'Транзакции', href: '/finance/transactions', icon: <ArrowLeftRight className="h-4 w-4" /> },
      { label: 'Отчёты', href: '/finance/reports', icon: <FileBarChart className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Прочее',
    items: [
      { label: 'Документы', href: '/documents', icon: <FileText className="h-4 w-4" /> },
      { label: 'Аналитика', href: '/analytics', icon: <BarChart3 className="h-4 w-4" />, permission: 'reports:read' },
      { label: 'Настройки', href: '/settings', icon: <Settings className="h-4 w-4" />, permission: 'settings:read' },
      { label: 'Пользователи', href: '/settings/users', icon: <Users className="h-4 w-4" />, permission: 'users:manage' },
      { label: 'Роли', href: '/settings/roles', icon: <Shield className="h-4 w-4" />, permission: 'users:manage' },
      { label: 'Telegram', href: '/settings/telegram', icon: <Send className="h-4 w-4" />, permission: 'settings:manage' },
    ],
  },
];

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

function hasPermission(userRole: string, permissions: string[], hasCustomRole: boolean, requiredPermission?: string): boolean {
  if (!requiredPermission) return true;
  if (userRole === 'OWNER' || userRole === 'ADMIN') return true;

  // If user has a custom role with permissions, use those
  if (hasCustomRole && permissions.length > 0) {
    return permissions.includes(requiredPermission);
  }

  // Fall back to system role default permissions
  const systemPerms = SYSTEM_ROLE_PERMISSIONS[userRole] || [];
  return systemPerms.includes('*') || systemPerms.includes(requiredPermission);
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const userRole = user?.role?.toUpperCase() || '';
  const userPermissions: string[] = (user as any)?.customRole?.permissions || [];
  const hasCustomRole = !!(user as any)?.customRoleId || !!(user as any)?.customRole;

  const filteredGroups = navGroups
    .filter((group) => hasPermission(userRole, userPermissions, hasCustomRole, group.permission))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(userRole, userPermissions, hasCustomRole, item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 hidden lg:flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Лого */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border">
        {!sidebarCollapsed && (
          <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            StockFlow
          </span>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Навигация */}
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {filteredGroups.map((group) => (
            <div key={group.title}>
              {!sidebarCollapsed && (
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </p>
              )}
              {sidebarCollapsed && <Separator className="my-2" />}
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      sidebarCollapsed && 'justify-center px-2',
                    )
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
