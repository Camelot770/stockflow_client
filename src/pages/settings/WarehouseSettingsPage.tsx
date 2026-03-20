import React, { useState } from 'react';
import { Plus, Warehouse, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { useWarehouses, useCreateWarehouse, useDeleteWarehouse } from '@/hooks/useWarehouse';
import { toast } from 'sonner';

export default function WarehouseSettingsPage() {
  const { data: rawWarehouses } = useWarehouses();
  const warehouses = Array.isArray(rawWarehouses) ? rawWarehouses : Array.isArray((rawWarehouses as any)?.data) ? (rawWarehouses as any).data : [];
  const createWarehouse = useCreateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Удалить склад "${name}"?`)) return;
    deleteWarehouse.mutate(id, {
      onSuccess: () => toast.success('Склад удалён'),
      onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Ошибка удаления склада'),
    });
  };

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
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Склад</Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id, w.name)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
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
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button><Button onClick={handleCreate} disabled={!form.name}>Создать</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
