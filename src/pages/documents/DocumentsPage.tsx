import React from 'react';
import { FileText, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Документы</h1><p className="text-muted-foreground">Счета, акты, накладные и отчёты</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Сформировать документ</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<FileText className="h-8 w-8 text-muted-foreground" />}
            title="Нет документов"
            description="Документы формируются автоматически на основе заказов или вручную"
            actionLabel="Создать документ"
            onAction={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
}
