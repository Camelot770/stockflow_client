import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useProduct, useUpdateProduct, useCategories, useUnits } from '@/hooks/useProducts';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  sku: z.string().min(1, 'Обязательное поле'),
  barcode: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  unitId: z.string().optional(),
  purchasePrice: z.coerce.number().min(0, 'Не может быть отрицательным'),
  sellingPrice: z.coerce.number().min(0, 'Не может быть отрицательным'),
  minStock: z.coerce.number().min(0, 'Не может быть отрицательным'),
  maxStock: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
});

type ProductForm = z.infer<typeof productSchema>;

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const updateProduct = useUpdateProduct();
  const { data: rawCategories } = useCategories();
  const { data: rawUnits } = useUnits();
  const categories = Array.isArray(rawCategories) ? rawCategories : Array.isArray((rawCategories as any)?.data) ? (rawCategories as any).data : [];
  const units = Array.isArray(rawUnits) ? rawUnits : Array.isArray((rawUnits as any)?.data) ? (rawUnits as any).data : [];

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true, purchasePrice: 0, sellingPrice: 0, minStock: 0 },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        unitId: product.unitId || '',
        purchasePrice: (product as any).costPrice ?? product.purchasePrice ?? 0,
        sellingPrice: (product as any).retailPrice ?? product.sellingPrice ?? 0,
        minStock: product.minStock ?? 0,
        maxStock: product.maxStock ?? undefined,
        weight: product.weight ?? undefined,
        isActive: product.isActive ?? true,
      });
    }
  }, [product, reset]);

  if (isLoading) return <LoadingSkeleton type="form" rows={8} />;
  if (!product) return <p className="text-center text-muted-foreground py-16">Товар не найден</p>;

  const onSubmit = (data: ProductForm) => {
    const payload = {
      ...data,
      costPrice: data.purchasePrice || 0,
      retailPrice: data.sellingPrice || 0,
      categoryId: data.categoryId || undefined,
      unitId: data.unitId || undefined,
      barcode: data.barcode || undefined,
      description: data.description || undefined,
      weight: data.weight || undefined,
    };
    updateProduct.mutate(
      { id: product.id, data: payload as any },
      {
        onSuccess: () => {
          toast.success('Товар обновлён');
          navigate(`/products/${product.id}`);
        },
        onError: () => toast.error('Ошибка при обновлении товара'),
      },
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/products/${product.id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Редактирование товара</h1>
          <p className="text-muted-foreground">{product.name} — {product.sku}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Наименование *</Label>
                <Input placeholder="Название товара" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Артикул (SKU) *</Label>
                <Input placeholder="ART-001" {...register('sku')} />
                {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Штрихкод</Label>
                <Input placeholder="4607000000001" {...register('barcode')} />
              </div>
              <div className="space-y-2">
                <Label>Категория</Label>
                <Select value={watch('categoryId') || ''} onValueChange={(val) => setValue('categoryId', val === '_none' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Без категории</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea placeholder="Описание товара" {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label>Единица измерения</Label>
              <Select value={watch('unitId') || ''} onValueChange={(val) => setValue('unitId', val === '_none' ? '' : val)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Выберите единицу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Не выбрано</SelectItem>
                  {units.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.shortName})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Цены и остатки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Закупочная цена</Label>
                <Input type="number" step="0.01" {...register('purchasePrice')} />
                {errors.purchasePrice && <p className="text-xs text-red-500">{errors.purchasePrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Продажная цена</Label>
                <Input type="number" step="0.01" {...register('sellingPrice')} />
                {errors.sellingPrice && <p className="text-xs text-red-500">{errors.sellingPrice.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Мин. остаток</Label>
                <Input type="number" {...register('minStock')} />
              </div>
              <div className="space-y-2">
                <Label>Макс. остаток</Label>
                <Input type="number" {...register('maxStock')} />
              </div>
              <div className="space-y-2">
                <Label>Вес (кг)</Label>
                <Input type="number" step="0.01" {...register('weight')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Активен</Label>
                <p className="text-sm text-muted-foreground">Товар доступен для продажи</p>
              </div>
              <Switch
                checked={watch('isActive')}
                onCheckedChange={(val) => setValue('isActive', val)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate(`/products/${product.id}`)}>
            Отмена
          </Button>
          <Button type="submit" disabled={updateProduct.isPending}>
            {updateProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить изменения
          </Button>
        </div>
      </form>
    </div>
  );
}
