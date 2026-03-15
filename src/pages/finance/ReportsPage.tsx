import React from 'react';
import { FileBarChart, TrendingUp, ArrowDownRight, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/EmptyState';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Финансовые отчёты</h1><p className="text-muted-foreground">Прибыли и убытки, движение денег, задолженности</p></div>

      <Tabs defaultValue="pnl">
        <TabsList>
          <TabsTrigger value="pnl">Прибыли и убытки</TabsTrigger>
          <TabsTrigger value="cashflow">Движение денег</TabsTrigger>
          <TabsTrigger value="receivables">Дебиторка</TabsTrigger>
          <TabsTrigger value="payables">Кредиторка</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /><CardTitle>Отчёт о прибылях и убытках</CardTitle></CardHeader>
            <CardContent><EmptyState title="Нет данных" description="Данные для отчёта формируются на основе транзакций" /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2"><FileBarChart className="h-5 w-5 text-primary" /><CardTitle>Движение денежных средств</CardTitle></CardHeader>
            <CardContent><EmptyState title="Нет данных" description="Добавьте транзакции для формирования отчёта" /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2"><Users className="h-5 w-5 text-primary" /><CardTitle>Дебиторская задолженность</CardTitle></CardHeader>
            <CardContent><EmptyState title="Нет данных" description="Дебиторская задолженность формируется из неоплаченных продаж" /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2"><ArrowDownRight className="h-5 w-5 text-primary" /><CardTitle>Кредиторская задолженность</CardTitle></CardHeader>
            <CardContent><EmptyState title="Нет данных" description="Кредиторская задолженность формируется из неоплаченных закупок" /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
