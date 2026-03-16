import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CalendarEvent } from '@/types';

const eventSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Дата начала обязательна'),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean(),
  color: z.string(),
});

type EventFormValues = z.infer<typeof eventSchema>;

const COLORS = [
  { value: 'blue', label: 'Синий', class: 'bg-blue-500' },
  { value: 'red', label: 'Красный', class: 'bg-red-500' },
  { value: 'green', label: 'Зелёный', class: 'bg-emerald-500' },
  { value: 'purple', label: 'Фиолетовый', class: 'bg-purple-500' },
  { value: 'orange', label: 'Оранжевый', class: 'bg-orange-500' },
  { value: 'yellow', label: 'Жёлтый', class: 'bg-yellow-500' },
  { value: 'pink', label: 'Розовый', class: 'bg-pink-500' },
  { value: 'cyan', label: 'Бирюзовый', class: 'bg-cyan-500' },
];

interface CalendarEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  defaultDate?: Date | null;
  onSave: (data: Partial<CalendarEvent>) => void;
  onDelete?: (id: string) => void;
}

export function CalendarEventDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  onSave,
  onDelete,
}: CalendarEventDialogProps) {
  const isEditing = !!event;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '10:00',
      allDay: false,
      color: 'blue',
    },
  });

  const allDay = watch('allDay');

  useEffect(() => {
    if (open) {
      if (event) {
        const start = new Date(event.startDate);
        const end = event.endDate ? new Date(event.endDate) : null;
        reset({
          title: event.title || '',
          description: event.description || '',
          startDate: format(start, 'yyyy-MM-dd'),
          startTime: event.allDay ? '09:00' : format(start, 'HH:mm'),
          endDate: end ? format(end, 'yyyy-MM-dd') : format(start, 'yyyy-MM-dd'),
          endTime: end && !event.allDay ? format(end, 'HH:mm') : '10:00',
          allDay: event.allDay ?? false,
          color: event.color || 'blue',
        });
      } else if (defaultDate) {
        reset({
          title: '',
          description: '',
          startDate: format(defaultDate, 'yyyy-MM-dd'),
          startTime: format(defaultDate, 'HH:mm') === '00:00' ? '09:00' : format(defaultDate, 'HH:mm'),
          endDate: format(defaultDate, 'yyyy-MM-dd'),
          endTime: '10:00',
          allDay: false,
          color: 'blue',
        });
      } else {
        reset({
          title: '',
          description: '',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          startTime: '09:00',
          endDate: format(new Date(), 'yyyy-MM-dd'),
          endTime: '10:00',
          allDay: false,
          color: 'blue',
        });
      }
    }
  }, [open, event, defaultDate, reset]);

  const onSubmit = (values: EventFormValues) => {
    const startDate = values.allDay
      ? `${values.startDate}T00:00:00`
      : `${values.startDate}T${values.startTime || '09:00'}:00`;

    const endDateStr = values.endDate || values.startDate;
    const endDate = values.allDay
      ? `${endDateStr}T23:59:59`
      : `${endDateStr}T${values.endTime || '10:00'}:00`;

    onSave({
      ...(event ? { id: event.id } : {}),
      title: values.title,
      description: values.description || undefined,
      startDate,
      endDate,
      allDay: values.allDay,
      color: values.color,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редактировать событие' : 'Новое событие'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Название */}
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              placeholder="Введите название"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Описание события"
              rows={3}
              {...register('description')}
            />
          </div>

          {/* Весь день */}
          <div className="flex items-center justify-between">
            <Label htmlFor="allDay">Весь день</Label>
            <Controller
              name="allDay"
              control={control}
              render={({ field }) => (
                <Switch
                  id="allDay"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Дата начала / время */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate.message}</p>
              )}
            </div>
            {!allDay && (
              <div className="space-y-2">
                <Label htmlFor="startTime">Время начала</Label>
                <Input id="startTime" type="time" {...register('startTime')} />
              </div>
            )}
          </div>

          {/* Дата окончания / время */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
            </div>
            {!allDay && (
              <div className="space-y-2">
                <Label htmlFor="endTime">Время окончания</Label>
                <Input id="endTime" type="time" {...register('endTime')} />
              </div>
            )}
          </div>

          {/* Цвет */}
          <div className="space-y-2">
            <Label>Цвет</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${COLORS.find((c) => c.value === field.value)?.class || 'bg-blue-500'}`}
                        />
                        {COLORS.find((c) => c.value === field.value)?.label || 'Синий'}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${color.class}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter className="flex items-center justify-between gap-2">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(event!.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Удалить
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isEditing ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
