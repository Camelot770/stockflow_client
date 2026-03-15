import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { useFinanceAccounts } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/utils';

export default function FinanceDashboardPage() {
  const { data: rawAccounts } = useFinanceAccounts();
  const accounts = Array.isArray(rawAccounts) ? rawAccounts : Array.isArray((rawAccounts as any)?.data) ? (rawAccounts as any).data : [];
  const totalBalance = accounts.reduce((s: number, a: any) => s + (a.balance ?? 0), 0);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Финансы</h1><p className="text-muted-foreground">Обзор финансового состояния</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Общий баланс" value={formatCurrency(totalBalance)} icon={<Wallet className="h-6 w-6" />} />
        <StatCard title="Доходы (мес)" value={formatCurrency(0)} trend={0} icon={<ArrowUpRight className="h-6 w-6" />} />
        <StatCard title="Расходы (мес)" value={formatCurrency(0)} trend={0} icon={<ArrowDownRight className="h-6 w-6" />} />
        <StatCard title="Прибыль (мес)" value={formatCurrency(0)} trend={0} icon={<TrendingUp className="h-6 w-6" />} />
      </div>

      <Card>
        <CardHeader><CardTitle>Счета</CardTitle></CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Нет счетов. Добавьте первый счёт.</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{acc.name}</p>
                      <p className="text-xs text-muted-foreground">{acc.type === 'bank' ? 'Банковский' : acc.type === 'cash' ? 'Наличные' : 'Карта'}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(acc.balance)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
