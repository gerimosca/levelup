'use client';

import { ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { CrossSellProduct } from '../types';

interface CrossSellPanelProps {
  products: CrossSellProduct[];
}

export function CrossSellPanel({ products }: CrossSellPanelProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Recommended Products</h2>
        <p className="text-muted-foreground">
          Cross-sell opportunities for your users
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            {product.badge && (
              <span className="inline-block rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground mb-3">
                {product.badge}
              </span>
            )}
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">{product.price}</span>
              <Button asChild size="sm">
                <a href={product.url} target="_blank" rel="noopener noreferrer">
                  {product.cta}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
