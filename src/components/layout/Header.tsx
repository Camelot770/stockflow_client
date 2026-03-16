import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useLogout } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationPanel } from './NotificationPanel';

export function Header() {
  const { user } = useAuthStore();
  const { setCommandMenuOpen, setSidebarMobileOpen } = useUIStore();
  const logout = useLogout();
  const navigate = useNavigate();

  // Initialize WebSocket connection
  useSocket();

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-4 lg:px-6">
      {/* Кнопка мобильного меню */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Breadcrumbs />

      <div className="flex-1" />

      {/* Поиск (Cmd+K) */}
      <Button
        variant="outline"
        className="hidden sm:flex items-center gap-2 text-muted-foreground w-64"
        onClick={() => setCommandMenuOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Поиск...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">Cmd</span>K
        </kbd>
      </Button>

      {/* Уведомления */}
      <NotificationPanel />

      {/* Аватар пользователя */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <UserIcon className="mr-2 h-4 w-4" />
            Профиль
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Настройки
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
