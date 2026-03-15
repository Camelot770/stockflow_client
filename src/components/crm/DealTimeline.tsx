import React from 'react';
import { Phone, Mail, Calendar, FileText, CheckCircle2, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatRelativeDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Activity, Comment } from '@/types';

type TimelineItem = {
  id: string;
  type: 'activity' | 'comment';
  date: string;
  data: Activity | Comment;
};

interface DealTimelineProps {
  activities: Activity[];
  comments: Comment[];
}

const activityIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  meeting: <Calendar className="h-3.5 w-3.5" />,
  note: <FileText className="h-3.5 w-3.5" />,
  task: <CheckCircle2 className="h-3.5 w-3.5" />,
};

export function DealTimeline({ activities, comments }: DealTimelineProps) {
  const items: TimelineItem[] = [
    ...activities.map((a) => ({
      id: a.id,
      type: 'activity' as const,
      date: a.createdAt,
      data: a,
    })),
    ...comments.map((c) => ({
      id: c.id,
      type: 'comment' as const,
      date: c.createdAt,
      data: c,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Нет активностей</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                item.type === 'comment' ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground',
              )}
            >
              {item.type === 'comment' ? (
                <MessageSquare className="h-3.5 w-3.5" />
              ) : (
                activityIcons[(item.data as Activity).type] || <FileText className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="w-px flex-1 bg-border mt-1" />
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              {item.type === 'activity' ? (
                <>
                  <span className="text-sm font-medium">{(item.data as Activity).title}</span>
                  {(item.data as Activity).user && (
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[8px]">
                        {(item.data as Activity).user!.firstName[0]}
                        {(item.data as Activity).user!.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">
                    {(item.data as Comment).user?.firstName} {(item.data as Comment).user?.lastName}
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {formatRelativeDate(item.date)}
              </span>
            </div>
            {item.type === 'comment' ? (
              <p className="text-sm text-muted-foreground">{(item.data as Comment).text}</p>
            ) : (item.data as Activity).description ? (
              <p className="text-sm text-muted-foreground">{(item.data as Activity).description}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
