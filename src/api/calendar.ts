import apiClient from './client';
import type { CalendarEvent } from '@/types';

export const calendarApi = {
  getEvents: (start: string, end: string) =>
    apiClient
      .get<CalendarEvent[]>('/calendar/events', { params: { start, end } })
      .then((r) => r.data),

  createEvent: (data: Partial<CalendarEvent>) =>
    apiClient.post<CalendarEvent>('/calendar/events', data).then((r) => r.data),

  updateEvent: (id: string, data: Partial<CalendarEvent>) =>
    apiClient.put<CalendarEvent>(`/calendar/events/${id}`, data).then((r) => r.data),

  deleteEvent: (id: string) =>
    apiClient.delete(`/calendar/events/${id}`).then((r) => r.data),

  syncCalendar: () =>
    apiClient.post('/calendar/sync').then((r) => r.data),
};
