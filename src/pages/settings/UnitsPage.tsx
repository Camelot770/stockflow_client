import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUnits, useCreateCategory } from '@/hooks/useProducts';
import { productsApi } from '@/api/products';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export default function UnitsPage() {
  const { data: rawUnits } = useUnits();
  const units = Array.isArray(rawUnits) ? rawUnits : Array.isArray((rawUnits as any)?.data) ? (rawUnits as any).data : [];
  const qc = useQueryClient();
  const createUnit = useMutation({
    mutationFn: (data: { name: string; shortName: string }) => productsApi.createUnit(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['units'] }),
  });
  const deleteUnit = useMutation({
    mutationFn: (id: string) => productsApi.deleteUnit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['units'] }),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', shortName: '' });

  const handleCreate = () => {
    createUnit.mutate(form, {
      onSuccess: () => { toast.success('Единица создана'); setShowCreate(false); setForm({ name: '', shortName: '' }); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Единицы измерения</h1><p className="text-muted-foreground">Управление единицами измерения товаров</p></div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Добавить</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Название</TableHead><TableHead>Сокращение</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
            <TableBody>
              {units.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.shortName}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => deleteUnit.mutate(u.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
              {units.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Нет единиц измерения</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новая единица измерения</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Название</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Штука" /></div>
            <div className="space-y-2"><Label>Сокращение</Label><Input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} placeholder="шт" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button><Button onClick={handleCreate} disabled={!form.name || !form.shortName}>Создать</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
