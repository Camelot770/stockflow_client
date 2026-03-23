import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import type { Deal } from '@/types';

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-0.5 text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{deal.name || deal.title}</p>
          <p className="text-lg font-bold text-primary mt-1">{formatCurrency(deal.amount ?? 0)}</p>
          {deal.customer && (
            <div className="flex items-center gap-1.5 mt-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">
                {deal.customer.name}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            {deal.assignedUser && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {(deal.assignedUser.firstName || '?')[0]}{(deal.assignedUser.lastName || '?')[0]}
                </AvatarFallback>
              </Avatar>
            )}
            {deal.expectedCloseDate && (
              <span className="text-[10px] text-muted-foreground">
                {new Date(deal.expectedCloseDate).toLocaleDateString('ru-RU')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
