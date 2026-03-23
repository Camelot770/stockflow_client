import React, { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/EmptyState';
import { useFinanceAccounts, useCreateFinanceAccount } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function AccountsPage() {
  const { data: rawAccounts, isLoading } = useFinanceAccounts();
  const accounts = Array.isArray(rawAccounts) ? rawAccounts : Array.isArray((rawAccounts as any)?.data) ? (rawAccounts as any).data : [];
  const createAccount = useCreateFinanceAccount();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'bank' as string, currency: 'RUB' });

  const handleCreate = () => {
    createAccount.mutate({ ...form, type: form.type.toUpperCase() } as any, {
      onSuccess: () => { toast.success('Счёт создан'); setShowCreate(false); setForm({ name: '', type: 'bank', currency: 'RUB' }); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Счета</h1><p className="text-muted-foreground">Банковские счета и кассы</p></div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Добавить счёт</Button>
      </div>

      {accounts.length === 0 && !isLoading ? (
        <Card><CardContent className="pt-6"><EmptyState title="Нет счетов" description="Добавьте банковский счёт или кассу" actionLabel="Добавить счёт" onAction={() => setShowCreate(true)} /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <Card key={acc.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10"><Wallet className="h-5 w-5 text-primary" /></div>
                  <div><p className="font-medium">{acc.name}</p><p className="text-xs text-muted-foreground">{acc.type === 'bank' ? 'Банковский' : acc.type === 'cash' ? 'Наличные' : 'Карта'}</p></div>
                  <Badge variant={acc.isActive ? 'success' : 'secondary'} className="ml-auto">{acc.isActive ? 'Активен' : 'Неактивен'}</Badge>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(acc.balance ?? 0)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новый счёт</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Название *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Основной счёт" /></div>
            <div className="space-y-2"><Label>Тип</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="bank">Банковский</SelectItem><SelectItem value="cash">Наличные</SelectItem><SelectItem value="card">Карта</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button><Button onClick={handleCreate} disabled={!form.name}>Создать</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
