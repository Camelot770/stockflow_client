import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Info, AlertTriangle, XCircle, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotificationStore } from '@/stores/notificationStore';
import { notificationsApi } from '@/api/notifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import type { Notification } from '@/types';

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  error: <XCircle className="h-4 w-4 text-red-400" />,
  success: <CheckCircle className="h-4 w-4 text-emerald-400" />,
};

export function NotificationPanel() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    setNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  // Fetch notifications when panel opens
  useEffect(() => {
    if (open) {
      notificationsApi.getAll({ limit: 20 }).then((data) => {
        const list = Array.isArray(data) ? data : (data as any)?.data || [];
        setNotifications(list);
      }).catch(() => {
        // silently fail
      });
    }
  }, [open, setNotifications]);

  // Also fetch on mount for unread count
  useEffect(() => {
    notificationsApi.getAll({ limit: 20 }).then((data) => {
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      setNotifications(list);
    }).catch(() => {
      // silently fail
    });
  }, [setNotifications]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      markAsRead(id);
    } catch {
      // silently fail
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      markAllAsRead();
    } catch {
      // silently fail
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      notificationsApi.markAsRead(notification.id).catch(() => {});
      markAsRead(notification.id);
    }
    if (notification.link) {
      setOpen(false);
      navigate(notification.link);
    }
  };

  const displayedNotifications = notifications.slice(0, 20);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Уведомления</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Отметить все как прочитанные
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-[400px]">
          {displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              Нет уведомлений
            </div>
          ) : (
            <div className="py-1">
              {displayedNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                    !notification.isRead && 'border-l-2 border-l-blue-500 bg-blue-500/5'
                  )}
                >
                  <span className="shrink-0 mt-0.5">
                    {typeIcons[notification.type] || typeIcons.info}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm truncate',
                        !notification.isRead ? 'font-semibold' : 'font-medium'
                      )}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                          title="Отметить как прочитанное"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 20 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={() => {
                  setOpen(false);
                  navigate('/notifications');
                }}
              >
                Показать все
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
