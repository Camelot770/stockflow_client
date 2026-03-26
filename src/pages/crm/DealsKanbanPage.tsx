import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Columns, Plus, Loader2 } from 'lucide-react';
import { crmApi } from '@/api/crm';
import { KanbanColumn } from '@/components/crm/KanbanColumn';
import { KanbanDealCard } from '@/components/crm/KanbanDealCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { Deal, Pipeline } from '@/types';

export default function DealsKanbanPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  /** Загрузка воронок */
  const { data: pipelines = [], isLoading: pipelinesLoading } = useQuery({
    queryKey: ['pipelines'],
    queryFn: () => crmApi.getPipelines(),
    select: (data: Pipeline[] | { data: Pipeline[] }) =>
      Array.isArray(data) ? data : (data as { data: Pipeline[] }).data ?? [],
  });

  /** Автовыбор первой воронки */
  React.useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      const defaultPipeline = pipelines.find((p) => p.isDefault) || pipelines[0];
      setSelectedPipelineId(defaultPipeline.id);
    }
  }, [pipelines, selectedPipelineId]);

  /** Загрузка сделок */
  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', { pipelineId: selectedPipelineId, limit: 500 }],
    queryFn: () =>
      crmApi.getDeals({ pipelineId: selectedPipelineId, limit: 500 }),
    enabled: !!selectedPipelineId,
  });

  const deals = useMemo(() => {
    if (!dealsData) return [];
    if (Array.isArray(dealsData)) return dealsData;
    if ((dealsData as { data: Deal[] }).data) return (dealsData as { data: Deal[] }).data;
    return [];
  }, [dealsData]);

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);
  const stages = useMemo(
    () =>
      selectedPipeline?.stages
        ? [...selectedPipeline.stages].sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
        : [],
    [selectedPipeline],
  );

  /** Мутация перемещения сделки */
  const moveDealMutation = useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) =>
      crmApi.moveDeal(id, stageId),
    onMutate: async ({ id, stageId }) => {
      await queryClient.cancelQueries({ queryKey: ['deals'] });
      const prevDeals = queryClient.getQueryData(['deals', { pipelineId: selectedPipelineId, limit: 500 }]);

      queryClient.setQueryData(
        ['deals', { pipelineId: selectedPipelineId, limit: 500 }],
        (old: unknown) => {
          if (!old) return old;
          const updateDeals = (items: Deal[]) =>
            items.map((d) => (d.id === id ? { ...d, stageId } : d));

          if (Array.isArray(old)) return updateDeals(old);
          if ((old as { data: Deal[] }).data) {
            return { ...(old as { data: Deal[] }), data: updateDeals((old as { data: Deal[] }).data) };
          }
          return old;
        },
      );

      return { prevDeals };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevDeals) {
        queryClient.setQueryData(
          ['deals', { pipelineId: selectedPipelineId, limit: 500 }],
          context.prevDeals,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const deal = deals.find((d) => d.id === event.active.id);
      setActiveDeal(deal || null);
    },
    [deals],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDeal(null);
      const { active, over } = event;
      if (!over) return;

      const dealId = active.id as string;
      const overId = over.id as string;

      // Перетащили на колонку (стадию)
      const targetStage = stages.find((s) => s.id === overId);
      if (targetStage) {
        const deal = deals.find((d) => d.id === dealId);
        if (deal && deal.stageId !== targetStage.id) {
          moveDealMutation.mutate({ id: dealId, stageId: targetStage.id });
        }
        return;
      }

      // Перетащили на другую сделку
      const targetDeal = deals.find((d) => d.id === overId);
      if (targetDeal) {
        const deal = deals.find((d) => d.id === dealId);
        if (deal && deal.stageId !== targetDeal.stageId) {
          moveDealMutation.mutate({ id: dealId, stageId: targetDeal.stageId });
        }
      }
    },
    [deals, stages, moveDealMutation],
  );

  const handleDealClick = useCallback(
    (deal: Deal) => {
      navigate(`/crm/deals/${deal.id}`);
    },
    [navigate],
  );

  const isLoading = pipelinesLoading || dealsLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Columns className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Канбан сделок</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Выбор воронки */}
          <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Выберите воронку" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((pipeline) => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => navigate('/crm/deals')} variant="outline" size="sm">
            Список
          </Button>
        </div>
      </div>

      {/* Канбан-доска */}
      <div className="flex-1 overflow-hidden p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : stages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Columns className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg">Нет стадий в выбранной воронке</p>
            <p className="text-sm mt-1">Создайте стадии в настройках воронок</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <ScrollArea className="h-full w-full">
              <div className="flex gap-4 pb-4 min-w-max h-full">
                {stages.map((stage) => {
                  const stageDeals = deals.filter((d) => d.stageId === stage.id);
                  return (
                    <KanbanColumn
                      key={stage.id}
                      stage={stage}
                      deals={stageDeals}
                      onDealClick={handleDealClick}
                      onAddDeal={() =>
                        navigate(`/crm/deals?newDeal=true&stageId=${stage.id}&pipelineId=${selectedPipelineId}`)
                      }
                    />
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Overlay при перетаскивании */}
            <DragOverlay>
              {activeDeal ? (
                <div className="rotate-2 opacity-90">
                  <KanbanDealCard deal={activeDeal} isOverlay />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
