import React from 'react';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Инвентаризация</h1>
        <p className="text-muted-foreground">Проведение инвентаризации на складе</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />}
            title="Нет активных инвентаризаций"
            description="Создайте новую инвентаризацию для проверки остатков на складе"
            actionLabel="Начать инвентаризацию"
            onAction={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
}
