import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { KanbanDealCard } from './KanbanDealCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { Deal, PipelineStage } from '@/types';

interface KanbanBoardProps {
  stages: PipelineStage[];
  deals: Deal[];
  onDealMove: (dealId: string, newStageId: string) => void;
  onDealClick: (deal: Deal) => void;
}

export function KanbanBoard({ stages, deals, onDealMove, onDealClick }: KanbanBoardProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const safeStages = stages || [];
  const safeDeals = deals || [];
  const sortedStages = [...safeStages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleDragStart = (event: DragStartEvent) => {
    const deal = safeDeals.find((d) => d.id === event.active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;
    const deal = safeDeals.find((d) => d.id === dealId);
    if (!deal) return;

    // Dropped on a stage column
    const targetStage = safeStages.find((s) => s.id === overId);
    if (targetStage) {
      if (deal.stageId !== targetStage.id) {
        onDealMove(dealId, targetStage.id);
      }
      return;
    }

    // Dropped on another deal card — move to that deal's stage
    const targetDeal = safeDeals.find((d) => d.id === overId);
    if (targetDeal && deal.stageId !== targetDeal.stageId) {
      onDealMove(dealId, targetDeal.stageId);
    }
  };

  const handleDragCancel = () => {
    setActiveDeal(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {sortedStages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={safeDeals.filter((d) => d.stageId === stage.id)}
              onDealClick={onDealClick}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Overlay при перетаскивании */}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeDeal ? (
          <KanbanDealCard deal={activeDeal} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
