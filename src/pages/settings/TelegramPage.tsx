import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Trash2, MessageCircle, Bell, Bot, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { telegramApi, type TelegramSettings, type TelegramChat } from '@/api/telegram';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function TelegramPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useQuery<TelegramSettings>({
    queryKey: ['telegram-settings'],
    queryFn: telegramApi.getSettings,
  });

  const { data: chats = [], isLoading: chatsLoading } = useQuery<TelegramChat[]>({
    queryKey: ['telegram-chats'],
    queryFn: telegramApi.getChats,
  });

  const [form, setForm] = useState<Partial<TelegramSettings>>({});

  useEffect(() => {
    if (settings) {
      setForm({
        isEnabled: settings.isEnabled,
        notifyNewDeal: settings.notifyNewDeal,
        notifyNewOrder: settings.notifyNewOrder,
        notifyLowStock: settings.notifyLowStock,
        notifyTask: settings.notifyTask,
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TelegramSettings>) => telegramApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-settings'] });
      toast.success('Настройки сохранены');
    },
    onError: () => toast.error('Ошибка сохранения настроек'),
  });

  const removeChatMutation = useMutation({
    mutationFn: (id: string) => telegramApi.removeChat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-chats'] });
      toast.success('Чат удалён');
    },
    onError: () => toast.error('Ошибка при удалении чата'),
  });

  const testMutation = useMutation({
    mutationFn: () => telegramApi.sendTest(),
    onSuccess: () => toast.success('Тестовое сообщение отправлено'),
    onError: () => toast.error('Ошибка отправки тестового сообщения'),
  });

  function handleSave() {
    updateMutation.mutate(form);
  }

  function maskToken(token?: string): string {
    if (!token) return '—';
    if (token.length <= 8) return '****';
    return token.slice(0, 4) + '****' + token.slice(-4);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Telegram</h1>
        <p className="text-muted-foreground">Настройка уведомлений через Telegram-бота</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle>Настройки Telegram бота</CardTitle>
            </div>
            <CardDescription>Управление уведомлениями и параметрами бота</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {settingsLoading ? (
              <p className="text-sm text-muted-foreground">Загрузка...</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Включить уведомления</Label>
                    <p className="text-xs text-muted-foreground">
                      Отправлять уведомления в Telegram
                    </p>
                  </div>
                  <Switch
                    checked={form.isEnabled ?? false}
                    onCheckedChange={v => setForm({ ...form, isEnabled: v })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Токен бота</Label>
                  <Input
                    value={maskToken(settings?.botToken)}
                    readOnly
                    className="bg-muted font-mono text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Типы уведомлений</Label>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Новые сделки</span>
                    </div>
                    <Switch
                      checked={form.notifyNewDeal ?? false}
                      onCheckedChange={v => setForm({ ...form, notifyNewDeal: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Новые заказы</span>
                    </div>
                    <Switch
                      checked={form.notifyNewOrder ?? false}
                      onCheckedChange={v => setForm({ ...form, notifyNewOrder: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Низкий остаток на складе</span>
                    </div>
                    <Switch
                      checked={form.notifyLowStock ?? false}
                      onCheckedChange={v => setForm({ ...form, notifyLowStock: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Назначение задач</span>
                    </div>
                    <Switch
                      checked={form.notifyTask ?? false}
                      onCheckedChange={v => setForm({ ...form, notifyTask: v })}
                    />
                  </div>
                </div>

                <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full">
                  {updateMutation.isPending ? 'Сохранение...' : 'Сохранить настройки'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* How to connect */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>Как подключить</CardTitle>
            </div>
            <CardDescription>Инструкция по подключению Telegram-уведомлений</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  1
                </span>
                <div>
                  <p className="font-medium">Найдите бота в Telegram</p>
                  <p className="text-muted-foreground">
                    Откройте Telegram и найдите бота{' '}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">@StockFlowBot</code>
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  2
                </span>
                <div>
                  <p className="font-medium">Отправьте команду /start</p>
                  <p className="text-muted-foreground">
                    Нажмите кнопку «Start» или отправьте команду{' '}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">/start</code>
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  3
                </span>
                <div>
                  <p className="font-medium">Бот автоматически зарегистрирует ваш чат</p>
                  <p className="text-muted-foreground">
                    После отправки команды ваш чат появится в таблице ниже
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  4
                </span>
                <div>
                  <p className="font-medium">Вы будете получать уведомления</p>
                  <p className="text-muted-foreground">
                    Уведомления будут приходить по выбранным событиям в настройках
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Connected chats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Подключённые чаты</CardTitle>
                <CardDescription>
                  Чтобы подключить Telegram, отправьте /start боту @StockFlowBot
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {testMutation.isPending ? 'Отправка...' : 'Отправить тестовое сообщение'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Chat ID</TableHead>
                <TableHead>Привязан к</TableHead>
                <TableHead>Подключён</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chatsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : chats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Нет подключённых чатов
                  </TableCell>
                </TableRow>
              ) : (
                chats.map(chat => (
                  <TableRow key={chat.id}>
                    <TableCell className="font-medium">
                      {chat.username ? `@${chat.username}` : chat.firstName || '—'}
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                        {chat.chatId}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {chat.user
                        ? `${chat.user.firstName} ${chat.user.lastName}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(chat.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={chat.isActive ? 'success' : 'destructive'}>
                        {chat.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeChatMutation.mutate(chat.id)}
                        disabled={removeChatMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
