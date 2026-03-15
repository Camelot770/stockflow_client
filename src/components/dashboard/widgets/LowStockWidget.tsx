import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Product } from '@/types';

interface LowStockWidgetProps {
  products: Product[];
}

export function LowStockWidget({ products }: LowStockWidgetProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Низкий остаток
        </CardTitle>
        <Badge variant="warning">{products.length}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.slice(0, 5).map((product) => {
            const percent = product.minStock > 0 ? Math.min((product.totalStock / product.minStock) * 100, 100) : 0;
            return (
              <div
                key={product.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-md p-1.5 -mx-1.5 transition-colors"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={percent} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {product.totalStock} / {product.minStock}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {products.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Все товары в наличии
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
