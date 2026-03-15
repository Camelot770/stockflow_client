import React, { useState } from 'react';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePipelines } from '@/hooks/useDeals';
import type { Pipeline } from '@/types';

export default function PipelinesPage() {
  const { data: pipelines = [], isLoading } = usePipelines();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Воронки продаж</h1>
          <p className="text-muted-foreground">Настройка стадий и воронок</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Новая воронка</Button>
      </div>

      {pipelines.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              title="Нет воронок"
              description="Создайте воронку продаж для управления сделками"
              actionLabel="Создать воронку"
              onAction={() => setShowCreate(true)}
            />
          </CardContent>
        </Card>
      ) : (
        pipelines.map((p: Pipeline) => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {p.name}
                {p.isDefault && <Badge variant="secondary">По умолчанию</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {p.stages?.sort((a, b) => a.order - b.order).map((stage) => (
                  <div key={stage.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="flex-1 text-sm">{stage.name}</span>
                    <span className="text-xs text-muted-foreground">{stage.probability}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новая воронка</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Название</Label><Input placeholder="Название воронки" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button><Button onClick={() => setShowCreate(false)}>Создать</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
