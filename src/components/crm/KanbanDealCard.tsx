import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, User, CalendarDays } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Deal } from '@/types';

interface KanbanDealCardProps {
  deal: Deal;
  onClick?: () => void;
  isOverlay?: boolean;
}

export function KanbanDealCard({ deal, onClick, isOverlay }: KanbanDealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id, disabled: isOverlay });

  const style = isOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      };

  const initials = deal.assignedUser
    ? `${(deal.assignedUser.firstName || '?')[0]}${(deal.assignedUser.lastName || '?')[0]}`
    : null;

  return (
    <Card
      ref={!isOverlay ? setNodeRef : undefined}
      style={style}
      className={cn(
        'p-3 cursor-pointer bg-card border-border hover:border-primary/50 hover:shadow-md transition-all',
        isDragging && 'shadow-lg border-primary/30',
        isOverlay && 'shadow-xl border-primary/40',
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-muted-foreground hover:text-foreground shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground">{deal.title}</p>
          <p className="text-lg font-bold text-primary mt-1">
            {formatCurrency(deal.amount ?? 0)}
          </p>

          {deal.customer && (
            <div className="flex items-center gap-1.5 mt-2">
              <User className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {deal.customer.name}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            {initials ? (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div />
            )}

            {deal.expectedCloseDate && (
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  {new Date(deal.expectedCloseDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
