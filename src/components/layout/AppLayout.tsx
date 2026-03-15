import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandMenu } from './CommandMenu';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Toaster } from 'sonner';

/** Мобильная навигация через Sheet */
function MobileSidebar() {
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();

  return (
    <Sheet open={sidebarMobileOpen} onOpenChange={setSidebarMobileOpen}>
      <SheetContent side="left" className="p-0 w-64">
        <div className="flex h-14 items-center px-4 border-b border-border">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            StockFlow
          </span>
        </div>
        <nav className="p-2">
          {/* Дублирование навигации для мобильного. При клике закрываем */}
          <div onClick={() => setSidebarMobileOpen(false)}>
            <MobileNav />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileNav() {
  const links = [
    { label: 'Главная', href: '/' },
    { label: 'Товары', href: '/products' },
    { label: 'Склад', href: '/warehouse' },
    { label: 'Закупки', href: '/purchases' },
    { label: 'Продажи', href: '/sales' },
    { label: 'CRM', href: '/crm' },
    { label: 'Финансы', href: '/finance' },
    { label: 'Документы', href: '/documents' },
    { label: 'Аналитика', href: '/analytics' },
    { label: 'Настройки', href: '/settings' },
  ];

  return (
    <div className="space-y-1">
      {links.map((link) => (
        <NavLink
          key={link.href}
          to={link.href}
          className={({ isActive }: { isActive: boolean }) =>
            cn(
              'block px-3 py-2 rounded-lg text-sm transition-colors',
              isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
}

export function AppLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileSidebar />
      <CommandMenu />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-card border-border text-foreground',
        }}
      />

      <div
        className={cn(
          'transition-all duration-300',
          'lg:ml-64',
          sidebarCollapsed && 'lg:ml-16',
        )}
      >
        <Header />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
