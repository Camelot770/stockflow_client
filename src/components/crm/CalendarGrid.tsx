import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  addHours,
  getHours,
  parseISO,
} from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/types';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  view: 'month' | 'week' | 'day';
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

/** Цвет по типу события */
function getEventColor(event: CalendarEvent): string {
  if (event.taskId) return 'bg-purple-500/80 hover:bg-purple-500';
  if (event.activityId) return 'bg-emerald-500/80 hover:bg-emerald-500';
  if (event.color) {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500/80 hover:bg-blue-500',
      red: 'bg-red-500/80 hover:bg-red-500',
      green: 'bg-emerald-500/80 hover:bg-emerald-500',
      purple: 'bg-purple-500/80 hover:bg-purple-500',
      orange: 'bg-orange-500/80 hover:bg-orange-500',
      yellow: 'bg-yellow-500/80 hover:bg-yellow-500',
      pink: 'bg-pink-500/80 hover:bg-pink-500',
      cyan: 'bg-cyan-500/80 hover:bg-cyan-500',
    };
    return colorMap[event.color] || 'bg-blue-500/80 hover:bg-blue-500';
  }
  return 'bg-blue-500/80 hover:bg-blue-500';
}

/** Дни недели */
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Часы */
const HOURS = Array.from({ length: 24 }, (_, i) => i);

/** MONTH VIEW */
function MonthView({
  currentDate,
  events,
  onDayClick,
  onEventClick,
}: Omit<CalendarGridProps, 'view'>) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-xs font-medium text-muted-foreground text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Сетка дней */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr min-h-0">
        {days.map((day) => {
          const dayEvents = events.filter((e) => {
            const eventDate = parseISO(e.startDate);
            return isSameDay(eventDate, day);
          });
          const isCurrentMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'border-b border-r border-border p-1 min-h-[100px] cursor-pointer hover:bg-muted/50 transition-colors',
                !isCurrentMonth && 'bg-muted/20',
              )}
              onClick={() => onDayClick(day)}
            >
              <div className="flex items-center justify-center mb-1">
                <span
                  className={cn(
                    'text-xs w-6 h-6 flex items-center justify-center rounded-full',
                    today && 'bg-primary text-primary-foreground font-bold',
                    !isCurrentMonth && 'text-muted-foreground/50',
                    isCurrentMonth && !today && 'text-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    className={cn(
                      'block w-full text-left text-[10px] text-white px-1.5 py-0.5 rounded truncate transition-colors',
                      getEventColor(event),
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    +{dayEvents.length - 3} ещё
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** WEEK VIEW */
function WeekView({
  currentDate,
  events,
  onDayClick,
  onEventClick,
}: Omit<CalendarGridProps, 'view'>) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      {/* Заголовки дней */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border sticky top-0 bg-background z-10">
        <div className="border-r border-border" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="px-2 py-2 text-center border-r border-border"
          >
            <p className="text-xs text-muted-foreground">
              {format(day, 'EEE', { locale: ru })}
            </p>
            <p
              className={cn(
                'text-sm font-medium mt-0.5',
                isToday(day) && 'text-primary',
              )}
            >
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      {/* Почасовая сетка */}
      <div className="flex-1">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border min-h-[48px]"
          >
            <div className="border-r border-border px-2 py-1 text-[10px] text-muted-foreground text-right">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {days.map((day) => {
              const hourStart = addHours(startOfDay(day), hour);
              const hourEvents = events.filter((e) => {
                const eventDate = parseISO(e.startDate);
                return isSameDay(eventDate, day) && getHours(eventDate) === hour;
              });

              return (
                <div
                  key={day.toISOString() + hour}
                  className="border-r border-border px-1 py-0.5 cursor-pointer hover:bg-muted/50 transition-colors relative"
                  onClick={() => onDayClick(hourStart)}
                >
                  {hourEvents.map((event) => (
                    <button
                      key={event.id}
                      className={cn(
                        'block w-full text-left text-[10px] text-white px-1.5 py-0.5 rounded truncate mb-0.5 transition-colors',
                        getEventColor(event),
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** DAY VIEW */
function DayView({
  currentDate,
  events,
  onDayClick,
  onEventClick,
}: Omit<CalendarGridProps, 'view'>) {
  const dayEvents = events.filter((e) => isSameDay(parseISO(e.startDate), currentDate));

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      {/* Заголовок дня */}
      <div className="border-b border-border px-4 py-2 sticky top-0 bg-background z-10">
        <p className="text-sm font-medium text-foreground">
          {format(currentDate, 'EEEE, d MMMM yyyy', { locale: ru })}
        </p>
      </div>

      {/* Почасовая сетка */}
      <div className="flex-1">
        {HOURS.map((hour) => {
          const hourStart = addHours(startOfDay(currentDate), hour);
          const hourEvents = dayEvents.filter((e) => getHours(parseISO(e.startDate)) === hour);

          return (
            <div
              key={hour}
              className="grid grid-cols-[60px_1fr] border-b border-border min-h-[56px]"
            >
              <div className="border-r border-border px-2 py-1 text-xs text-muted-foreground text-right">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div
                className="px-2 py-1 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onDayClick(hourStart)}
              >
                {hourEvents.map((event) => (
                  <button
                    key={event.id}
                    className={cn(
                      'block w-full text-left text-xs text-white px-2 py-1 rounded truncate mb-1 transition-colors',
                      getEventColor(event),
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    <span className="font-medium">{event.title}</span>
                    {event.description && (
                      <span className="ml-2 opacity-80">{event.description}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Главный компонент */
export function CalendarGrid({
  currentDate,
  events,
  view,
  onDayClick,
  onEventClick,
}: CalendarGridProps) {
  switch (view) {
    case 'week':
      return (
        <WeekView
          currentDate={currentDate}
          events={events}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
        />
      );
    case 'day':
      return (
        <DayView
          currentDate={currentDate}
          events={events}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
        />
      );
    default:
      return (
        <MonthView
          currentDate={currentDate}
          events={events}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
        />
      );
  }
}
