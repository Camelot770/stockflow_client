import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Loader2, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouse';
import { useCreateSalesOrder } from '@/hooks/useSales';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function PosPage() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [discount, setDiscount] = useState(0);
  const [warehouseId, setWarehouseId] = useState('');

  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 200 });
  const { data: rawWarehouses } = useWarehouses();
  const createOrder = useCreateSalesOrder();

  const warehouses = Array.isArray(rawWarehouses)
    ? rawWarehouses
    : Array.isArray((rawWarehouses as any)?.data)
      ? (rawWarehouses as any).data
      : [];

  const products = productsData?.data || [];

  // Auto-select first warehouse
  React.useEffect(() => {
    if (!warehouseId && warehouses.length > 0) {
      setWarehouseId(warehouses[0].id);
    }
  }, [warehouses, warehouseId]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products.filter((p: Product) => p.isActive);
    const q = search.toLowerCase();
    return products.filter(
      (p: Product) =>
        p.isActive &&
        (p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q)),
    );
  }, [products, search]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0),
    [cart],
  );
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const handlePayment = () => {
    if (cart.length === 0) {
      toast.error('Корзина пуста');
      return;
    }
    if (!warehouseId) {
      toast.error('Выберите склад');
      return;
    }

    const orderData = {
      warehouseId,
      discountAmount,
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.sellingPrice,
        discount: discount,
      })),
    };

    createOrder.mutate(orderData as any, {
      onSuccess: () => {
        toast.success('Продажа оформлена!');
        setCart([]);
        setDiscount(0);
      },
      onError: () => {
        toast.error('Ошибка при оформлении продажи');
      },
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4 overflow-hidden">
      {/* Left: Product grid */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search and warehouse */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск товара по названию, SKU или штрих-коду..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearch('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Select value={warehouseId} onValueChange={setWarehouseId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Склад" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((w: any) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products grid */}
        <ScrollArea className="flex-1">
          {productsLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mb-2" />
              <p>Товары не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
              {filteredProducts.map((product: Product) => {
                const inCart = cart.find((c) => c.product.id === product.id);
                return (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors relative group"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                        )}
                      </div>
                      <p className="text-sm font-medium truncate" title={product.name}>
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-primary">
                          {formatCurrency(product.sellingPrice)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {product.totalStock} шт
                        </span>
                      </div>
                      {inCart && (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                          {inCart.quantity}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right: Cart / Receipt */}
      <div className="w-96 flex flex-col bg-card border rounded-lg">
        {/* Cart header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Текущий чек</h2>
          <p className="text-sm text-muted-foreground">
            {cart.length === 0
              ? 'Добавьте товары'
              : `${cart.reduce((s, i) => s + i.quantity, 0)} позиций`}
          </p>
        </div>

        {/* Cart items */}
        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ShoppingBag className="h-8 w-8 mb-2" />
              <p className="text-sm">Корзина пуста</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-start gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.product.sellingPrice)} / шт
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      {formatCurrency(item.product.sellingPrice * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Cart footer */}
        <div className="border-t p-4 space-y-3">
          {/* Discount */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Скидка %</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-20 h-8 text-center"
            />
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Подытог</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Скидка ({discount}%)</span>
                <span className="text-red-500">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Итого</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <Separator />

          {/* Payment method */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => setPaymentMethod('cash')}
            >
              <Banknote className="h-4 w-4 mr-2" />
              Наличные
            </Button>
            <Button
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => setPaymentMethod('card')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Карта
            </Button>
          </div>

          {/* Pay button */}
          <Button
            className="w-full h-12 text-lg font-bold"
            onClick={handlePayment}
            disabled={cart.length === 0 || createOrder.isPending || !warehouseId}
          >
            {createOrder.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            Оплата {cart.length > 0 ? formatCurrency(total) : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
