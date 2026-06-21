'use client';

import { useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { FadeIn } from '@/shared/components/motion/fade-in';

interface SimpleCalculatorProps {
  commissionRate: number; // e.g., 30 for 30%
  averageSalePrice: number; // e.g., 297
  defaultReferrals?: number;
  inputLabel: string;
  outputLabel: string;
  helpText: string;
  locale: string;
}

export function SimpleCalculator({
  commissionRate,
  averageSalePrice,
  defaultReferrals = 5,
  inputLabel,
  outputLabel,
  helpText,
  locale
}: SimpleCalculatorProps) {
  const [referrals, setReferrals] = useState(defaultReferrals);

  // Simple calculation: referrals × price × commission%
  const monthlyEarnings = referrals * averageSalePrice * (commissionRate / 100);

  // Format currency based on locale
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setReferrals(Math.max(0, Math.min(100, value))); // Limit 0-100
  };

  return (
    <FadeIn delay={0.2}>
      <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl" />

        <CardContent className="p-8 relative">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Calculator</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referrals" className="text-base font-medium">
                  {inputLabel}
                </Label>
                <div className="relative">
                  <Input
                    id="referrals"
                    type="number"
                    min="0"
                    max="100"
                    value={referrals}
                    onChange={handleInputChange}
                    className="text-2xl font-bold h-14 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    / month
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {helpText
                  .replace('{price}', formatCurrency(averageSalePrice))
                  .replace('{rate}', `${commissionRate}%`)}
              </p>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg">{outputLabel}</h3>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
                <div className="text-4xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(monthlyEarnings)}
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  per month
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-semibold">
                    {formatCurrency(monthlyEarnings * 12)}
                  </div>
                  <p className="text-xs text-muted-foreground">Annual Total</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-semibold">
                    {formatCurrency(averageSalePrice * (commissionRate / 100))}
                  </div>
                  <p className="text-xs text-muted-foreground">Per Sale</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}