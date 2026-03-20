import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useCreateProduct, useCategories, useUnits } from '@/hooks/useProducts';
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
  weight: z.coerce.number().min(0, 'Вес не может быть отрицательным').optional(),
  isActive: z.boolean().default(true),
});

type ProductForm = z.infer<typeof productSchema>;

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const { data: rawCategories } = useCategories();
  const { data: rawUnits } = useUnits();
  const categories = Array.isArray(rawCategories) ? rawCategories : Array.isArray((rawCategories as any)?.data) ? (rawCategories as any).data : [];
  const units = Array.isArray(rawUnits) ? rawUnits : Array.isArray((rawUnits as any)?.data) ? (rawUnits as any).data : [];

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true, purchasePrice: 0, sellingPrice: 0, minStock: 0 },
  });

  const onSubmit = (data: ProductForm) => {
    const payload = {
      name: data.name,
      sku: data.sku,
      barcode: data.barcode || undefined,
      description: data.description || undefined,
      categoryId: data.categoryId || undefined,
      unitId: data.unitId || undefined,
      costPrice: data.purchasePrice || 0,
      retailPrice: data.sellingPrice || 0,
      minStock: data.minStock || 0,
      weight: data.weight || undefined,
      isActive: data.isActive,
    };
    createProduct.mutate(payload as any, {
      onSuccess: () => {
        toast.success('Товар создан');
        navigate('/products');
      },
      onError: (err: any) => {
        const error = err?.response?.data?.error;
        const details = error?.details;
        if (details?.length) {
          toast.error(details.map((d: any) => `${d.field}: ${d.message}`).join(', '));
        } else {
          toast.error(error?.message || 'Ошибка создания товара');
        }
      },
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Новый товар</h1>
          <p className="text-muted-foreground">Заполните данные товара</p>
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
                <Select onValueChange={(val) => setValue('categoryId', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
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
              <Select onValueChange={(val) => setValue('unitId', val)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Выберите единицу" />
                </SelectTrigger>
                <SelectContent>
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
                <Input type="number" step="0.01" min="0" {...register('weight')} />
                {errors.weight && <p className="text-xs text-red-500">{errors.weight.message}</p>}
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
          <Button variant="outline" type="button" onClick={() => navigate('/products')}>
            Отмена
          </Button>
          <Button type="submit" disabled={createProduct.isPending}>
            {createProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Создать товар
          </Button>
        </div>
      </form>
    </div>
  );
}
