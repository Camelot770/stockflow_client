import React from 'react';
import { DndContext, DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { Deal, PipelineStage } from '@/types';

interface KanbanBoardProps {
  stages: PipelineStage[];
  deals: Deal[];
  onDealMove: (dealId: string, newStageId: string) => void;
  onDealClick: (deal: Deal) => void;
}

export function KanbanBoard({ stages, deals, onDealMove, onDealClick }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;

    // Если перетащили на колонку (стадию)
    const targetStage = stages.find((s) => s.id === overId);
    if (targetStage) {
      const deal = deals.find((d) => d.id === dealId);
      if (deal && deal.stageId !== targetStage.id) {
        onDealMove(dealId, targetStage.id);
      }
      return;
    }

    // Если перетащили на другую сделку — определяем колонку
    const targetDeal = deals.find((d) => d.id === overId);
    if (targetDeal) {
      const deal = deals.find((d) => d.id === dealId);
      if (deal && deal.stageId !== targetDeal.stageId) {
        onDealMove(dealId, targetDeal.stageId);
      }
    }
  };

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {sortedStages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={deals.filter((d) => d.stageId === stage.id)}
              onDealClick={onDealClick}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </DndContext>
  );
}
