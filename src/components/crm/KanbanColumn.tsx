import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { KanbanDealCard } from './KanbanDealCard';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import type { Deal, PipelineStage } from '@/types';

interface KanbanColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onAddDeal?: () => void;
}

export function KanbanColumn({ stage, deals, onDealClick, onAddDeal }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const totalAmount = (deals || []).reduce((sum, d) => sum + (parseFloat(String(d.amount)) || 0), 0);

  return (
    <div
      className={cn(
        'flex flex-col w-80 min-w-[320px] rounded-lg bg-muted/30 border border-border',
        isOver && 'border-primary/50 bg-primary/5',
      )}
    >
      {/* Цветная полоска сверху */}
      <div className="h-1 rounded-t-lg" style={{ backgroundColor: stage.color || '#6366f1' }} />

      {/* Заголовок колонки */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: stage.color || '#6366f1' }}
          />
          <h3 className="text-sm font-medium flex-1 text-foreground truncate">{stage.name}</h3>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {deals.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(totalAmount)}</p>
      </div>

      {/* Список сделок */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]"
      >
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <KanbanDealCard
              key={deal.id}
              deal={deal}
              onClick={() => onDealClick(deal)}
            />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">Нет сделок</p>
        )}
      </div>

      {/* Кнопка добавления */}
      {onAddDeal && (
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={onAddDeal}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить сделку
          </Button>
        </div>
      )}
    </div>
  );
}
