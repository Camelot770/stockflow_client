import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface TodayTasksWidgetProps {
  tasks: Task[];
}

const priorityColors: Record<string, string> = {
  low: 'text-gray-400',
  medium: 'text-blue-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

export function TodayTasksWidget({ tasks }: TodayTasksWidgetProps) {
  const navigate = useNavigate();
  const safeTasks = tasks || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Задачи на сегодня
        </CardTitle>
        <Badge variant="secondary">{safeTasks.length}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {safeTasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md p-1.5 -mx-1.5 transition-colors"
              onClick={() => navigate('/crm/tasks')}
            >
              {task.status === 'done' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className={cn('h-4 w-4 shrink-0', priorityColors[task.priority])} />
              )}
              <span className={cn('text-sm flex-1 truncate', task.status === 'done' && 'line-through text-muted-foreground')}>
                {task.title}
              </span>
            </div>
          ))}
          {safeTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет задач на сегодня
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
