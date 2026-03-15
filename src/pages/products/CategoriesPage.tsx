import React, { useState } from 'react';
import { Plus, FolderTree, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useProducts';
import { toast } from 'sonner';
import type { Category } from '@/types';

function CategoryTree({ categories, level = 0, onDelete }: { categories: Category[]; level?: number; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-1">
      {categories.map((cat) => (
        <div key={cat.id}>
          <div
            className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
            style={{ paddingLeft: `${level * 24 + 12}px` }}
          >
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm">{cat.name}</span>
            {cat.productCount !== undefined && (
              <span className="text-xs text-muted-foreground">{cat.productCount} товаров</span>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(cat.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          {cat.children && cat.children.length > 0 && (
            <CategoryTree categories={cat.children} level={level + 1} onDelete={onDelete} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');

  const handleCreate = () => {
    createCategory.mutate(
      { name, parentId: parentId || undefined },
      {
        onSuccess: () => {
          toast.success('Категория создана');
          setShowCreate(false);
          setName('');
          setParentId('');
        },
      },
    );
  };

  const handleDelete = () => {
    if (!showDelete) return;
    deleteCategory.mutate(showDelete, {
      onSuccess: () => {
        toast.success('Категория удалена');
        setShowDelete(null);
      },
    });
  };

  const flatCategories = (cats: Category[]): Category[] =>
    cats.flatMap((c) => [c, ...(c.children ? flatCategories(c.children) : [])]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Категории</h1>
          <p className="text-muted-foreground">Дерево категорий товаров</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить категорию
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              title="Нет категорий"
              description="Создайте первую категорию для организации товаров"
              actionLabel="Добавить категорию"
              onAction={() => setShowCreate(true)}
            />
          ) : (
            <CategoryTree categories={categories} onDelete={(id) => setShowDelete(id)} />
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая категория</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название категории" />
            </div>
            <div className="space-y-2">
              <Label>Родительская категория</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Нет (корневая)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Нет (корневая)</SelectItem>
                  {flatCategories(categories).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={!name || createCategory.isPending}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!showDelete}
        onOpenChange={(open) => !open && setShowDelete(null)}
        title="Удалить категорию?"
        description="Все товары из этой категории станут без категории."
        confirmText="Удалить"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
