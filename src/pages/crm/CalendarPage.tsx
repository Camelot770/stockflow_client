import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
} from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { calendarApi } from '@/api/calendar';
import { crmApi } from '@/api/crm';
import { CalendarGrid } from '@/components/crm/CalendarGrid';
import { CalendarEventDialog } from '@/components/crm/CalendarEventDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CalendarEvent } from '@/types';

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  /** Диапазон дат для запроса */
  const dateRange = useMemo(() => {
    let start: Date;
    let end: Date;

    switch (view) {
      case 'week':
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
        break;
      case 'day':
        start = currentDate;
        end = currentDate;
        break;
      default:
        start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    }

    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    };
  }, [currentDate, view]);

  /** Загрузка событий календаря */
  const { data: calendarEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['calendar-events', dateRange.start, dateRange.end],
    queryFn: () => calendarApi.getEvents(dateRange.start, dateRange.end),
    select: (data: CalendarEvent[] | { data: CalendarEvent[] }) =>
      Array.isArray(data) ? data : (data as { data: CalendarEvent[] }).data ?? [],
  });

  /** Загрузка задач с dueDate */
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', { start: dateRange.start, end: dateRange.end }],
    queryFn: () =>
      crmApi.getTasks({
        dueDateFrom: dateRange.start,
        dueDateTo: dateRange.end,
        limit: 200,
      }),
  });

  /** Загрузка активностей с scheduledAt */
  const { data: activitiesData } = useQuery({
    queryKey: ['activities', { start: dateRange.start, end: dateRange.end }],
    queryFn: () =>
      crmApi.getActivities({
        scheduledFrom: dateRange.start,
        scheduledTo: dateRange.end,
        limit: 200,
      }),
  });

  /** Объединяем все события */
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [...calendarEvents];

    // Задачи -> события
    const tasks = tasksData
      ? Array.isArray(tasksData) ? tasksData : (tasksData as { data: unknown[] }).data ?? []
      : [];

    for (const task of tasks as Array<{
      id: string;
      title: string;
      dueDate?: string;
      description?: string;
      assignedUserId: string;
    }>) {
      if (task.dueDate) {
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          description: task.description,
          startDate: task.dueDate,
          allDay: true,
          color: 'purple',
          taskId: task.id,
          userId: task.assignedUserId,
          createdAt: task.dueDate,
        });
      }
    }

    // Активности -> события
    const activities = activitiesData
      ? Array.isArray(activitiesData)
        ? activitiesData
        : (activitiesData as { data: unknown[] }).data ?? []
      : [];

    for (const activity of activities as Array<{
      id: string;
      title: string;
      scheduledAt?: string;
      description?: string;
      userId: string;
    }>) {
      if (activity.scheduledAt) {
        events.push({
          id: `activity-${activity.id}`,
          title: activity.title,
          description: activity.description,
          startDate: activity.scheduledAt,
          allDay: false,
          color: 'green',
          activityId: activity.id,
          userId: activity.userId,
          createdAt: activity.scheduledAt,
        });
      }
    }

    return events;
  }, [calendarEvents, tasksData, activitiesData]);

  /** Мутации */
  const createMutation = useMutation({
    mutationFn: (data: Partial<CalendarEvent>) => calendarApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<CalendarEvent> & { id: string }) =>
      calendarApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calendarApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setDialogOpen(false);
    },
  });

  /** Навигация */
  const goToday = () => setCurrentDate(new Date());

  const goPrev = () => {
    switch (view) {
      case 'month':
        setCurrentDate((d) => subMonths(d, 1));
        break;
      case 'week':
        setCurrentDate((d) => subWeeks(d, 1));
        break;
      case 'day':
        setCurrentDate((d) => subDays(d, 1));
        break;
    }
  };

  const goNext = () => {
    switch (view) {
      case 'month':
        setCurrentDate((d) => addMonths(d, 1));
        break;
      case 'week':
        setCurrentDate((d) => addWeeks(d, 1));
        break;
      case 'day':
        setCurrentDate((d) => addDays(d, 1));
        break;
    }
  };

  const handleDayClick = useCallback((date: Date) => {
    setSelectedEvent(null);
    setSelectedDate(date);
    setDialogOpen(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    // Не открываем диалог для задач/активностей (они только для просмотра)
    if (event.taskId || event.activityId) return;
    setSelectedEvent(event);
    setSelectedDate(null);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    (data: Partial<CalendarEvent>) => {
      if (data.id) {
        updateMutation.mutate(data as Partial<CalendarEvent> & { id: string });
      } else {
        createMutation.mutate(data);
      }
    },
    [createMutation, updateMutation],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  /** Заголовок текущего периода */
  const periodTitle = useMemo(() => {
    switch (view) {
      case 'month':
        return format(currentDate, 'LLLL yyyy', { locale: ru });
      case 'week': {
        const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
        const we = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(ws, 'd MMM', { locale: ru })} — ${format(we, 'd MMM yyyy', { locale: ru })}`;
      }
      case 'day':
        return format(currentDate, 'd MMMM yyyy, EEEE', { locale: ru });
    }
  }, [currentDate, view]);

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Календарь</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Легенда */}
          <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground mr-4">
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span>События</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span>Задачи</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Активности</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedEvent(null);
              setSelectedDate(new Date());
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Событие
          </Button>
        </div>
      </div>

      {/* Панель навигации */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            Сегодня
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-medium text-foreground capitalize ml-2">
            {periodTitle}
          </h2>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="month">Месяц</TabsTrigger>
            <TabsTrigger value="week">Неделя</TabsTrigger>
            <TabsTrigger value="day">День</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Сетка календаря */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {eventsLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CalendarGrid
            currentDate={currentDate}
            events={allEvents}
            view={view}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {/* Диалог создания/редактирования */}
      <CalendarEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        defaultDate={selectedDate}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
