import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';

export default function PriceListsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Прайс-листы</h1><p className="text-muted-foreground">Управление ценовыми листами</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Создать прайс-лист</Button>
      </div>
      <Card><CardContent className="pt-6"><EmptyState title="Нет прайс-листов" description="Создайте прайс-лист для разных групп клиентов" actionLabel="Создать" onAction={() => {}} /></CardContent></Card>
    </div>
  );
}
