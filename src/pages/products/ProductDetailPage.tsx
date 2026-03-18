import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useProduct, useDeleteProduct, useProductMovements } from '@/hooks/useProducts';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const { data: movements } = useProductMovements(id!);
  const deleteProduct = useDeleteProduct();
  const [showDelete, setShowDelete] = React.useState(false);

  if (isLoading) return <LoadingSkeleton type="form" rows={8} />;
  if (!product) return <p className="text-center text-muted-foreground py-16">Товар не найден</p>;

  const handleDelete = () => {
    deleteProduct.mutate(product.id, {
      onSuccess: () => {
        toast.success('Товар удалён');
        navigate('/products');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">Артикул: {product.sku}</p>
          </div>
          <Badge variant={product.isActive ? 'success' : 'secondary'}>
            {product.isActive ? 'Активен' : 'Неактивен'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/products/${product.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Редактировать
          </Button>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="prices">Цены</TabsTrigger>
          <TabsTrigger value="stock">Остатки</TabsTrigger>
          <TabsTrigger value="suppliers">Поставщики</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Наименование</p>
                    <p className="font-medium">{product.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Артикул</p>
                    <p className="font-medium">{product.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Штрихкод</p>
                    <p className="font-medium">{product.barcode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Категория</p>
                    <p className="font-medium">{product.category?.name || '-'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Описание</p>
                    <p className="font-medium">{product.description || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Единица измерения</p>
                    <p className="font-medium">{product.unit?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Вес</p>
                    <p className="font-medium">{product.weight ? `${product.weight} кг` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Дата создания</p>
                    <p className="font-medium">{formatDate(product.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prices">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Закупочная цена</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(product.purchasePrice ?? 0)}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Продажная цена</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(product.sellingPrice ?? 0)}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Маржа</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-500">
                    {formatCurrency((product.sellingPrice ?? 0) - (product.purchasePrice ?? 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Остатки по складам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Общий остаток</p>
                  <p className="text-2xl font-bold">{formatNumber(product.totalStock ?? 0)}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Мин. остаток</p>
                  <p className="text-2xl font-bold">{formatNumber(product.minStock ?? 0)}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Стоимость остатков</p>
                  <p className="text-2xl font-bold">{formatCurrency((product.totalStock ?? 0) * (product.purchasePrice ?? 0))}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Показатель</TableHead>
                    <TableHead className="text-right">Значение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Текущий остаток</TableCell>
                    <TableCell className="text-right font-medium">{formatNumber(product.totalStock ?? 0)} {product.unit?.shortName || 'шт.'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Минимальный остаток</TableCell>
                    <TableCell className="text-right font-medium">{formatNumber(product.minStock ?? 0)} {product.unit?.shortName || 'шт.'}</TableCell>
                  </TableRow>
                  {product.maxStock != null && (
                    <TableRow>
                      <TableCell>Максимальный остаток</TableCell>
                      <TableCell className="text-right font-medium">{formatNumber(product.maxStock)} {product.unit?.shortName || 'шт.'}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell>Статус остатка</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={(product.totalStock ?? 0) <= (product.minStock ?? 0) ? 'destructive' : 'success'}>
                        {(product.totalStock ?? 0) <= 0
                          ? 'Нет в наличии'
                          : (product.totalStock ?? 0) <= (product.minStock ?? 0)
                            ? 'Ниже минимума'
                            : 'В наличии'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">Нет связанных поставщиков</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              {(() => {
                const movementsList = Array.isArray(movements) ? movements : Array.isArray(movements?.data) ? movements.data : [];
                return movementsList.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Количество</TableHead>
                      <TableHead>Склад</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementsList.map((m: { id: string; createdAt: string; type: string; quantity: number; warehouse?: { name: string } }) => (
                      <TableRow key={m.id}>
                        <TableCell>{formatDate(m.createdAt)}</TableCell>
                        <TableCell>{m.type}</TableCell>
                        <TableCell>{m.quantity}</TableCell>
                        <TableCell>{m.warehouse?.name || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Нет данных о движении товара
                </p>
              );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Удалить товар?"
        description="Это действие нельзя отменить. Товар будет удалён из системы."
        confirmText="Удалить"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
}
