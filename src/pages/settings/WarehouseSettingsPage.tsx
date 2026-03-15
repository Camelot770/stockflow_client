import React, { useState } from 'react';
import { Plus, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/shared/EmptyState';
import { useWarehouses, useCreateWarehouse } from '@/hooks/useWarehouse';
import { toast } from 'sonner';

export default function WarehouseSettingsPage() {
  const { data: warehouses = [] } = useWarehouses();
  const createWarehouse = useCreateWarehouse();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', type: 'warehouse' as string });

  const handleCreate = () => {
    createWarehouse.mutate(form as any, {
      onSuccess: () => { toast.success('Склад создан'); setShowCreate(false); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Склады</h1><p className="text-muted-foreground">Управление складами и точками хранения</p></div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Добавить склад</Button>
      </div>

      {warehouses.length === 0 ? (
        <Card><CardContent className="pt-6"><EmptyState title="Нет складов" description="Добавьте первый склад" actionLabel="Добавить" onAction={() => setShowCreate(true)} /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((w) => (
            <Card key={w.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Warehouse className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1"><p className="font-medium">{w.name}</p><p className="text-xs text-muted-foreground">{w.address || 'Адрес не указан'}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{w.type === 'warehouse' ? 'Склад' : w.type === 'store' ? 'Магазин' : 'Транзит'}</Badge>
                  {w.isDefault && <Badge variant="default">По умолчанию</Badge>}
                  <Badge variant={w.isActive ? 'success' : 'destructive'}>{w.isActive ? 'Активен' : 'Неактивен'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новый склад</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Название *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Адрес</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="space-y-2"><Label>Тип</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="warehouse">Склад</SelectItem><SelectItem value="store">Магазин</SelectItem><SelectItem value="transit">Транзит</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button><Button onClick={handleCreate} disabled={!form.name}>Создать</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
