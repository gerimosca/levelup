'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ArrowRightIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { getFunnelMetricsAction } from '../admin.actions';

interface FunnelData {
  funnel: {
    visits: number;
    signups: number;
    trials: number;
    customers: number;
  };
  rates: {
    visitToSignup: string;
    signupToTrial: string;
    trialToCustomer: string;
  };
}

export function FunnelMetrics() {
  const [metrics, setMetrics] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await getFunnelMetricsAction();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load funnel metrics:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-muted h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return <div>Failed to load metrics</div>;
  }

  const cards = [
    {
      title: 'Visits',
      value: metrics.funnel.visits,
      description: 'Unique visitors',
      rate: null,
    },
    {
      title: 'Signups',
      value: metrics.funnel.signups,
      description: `${metrics.rates.visitToSignup}% conversion`,
      rate: parseFloat(metrics.rates.visitToSignup),
    },
    {
      title: 'Trials',
      value: metrics.funnel.trials,
      description: `${metrics.rates.signupToTrial}% conversion`,
      rate: parseFloat(metrics.rates.signupToTrial),
    },
    {
      title: 'Customers',
      value: metrics.funnel.customers,
      description: `${metrics.rates.trialToCustomer}% conversion`,
      rate: parseFloat(metrics.rates.trialToCustomer),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Conversion Funnel (Last 30 Days)</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Track your conversion rates from visitor to paying customer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <Card key={card.title} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                {card.description}
                {card.rate !== null && (
                  card.rate > 10 ? (
                    <TrendingUpIcon className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDownIcon className="h-3 w-3 text-red-500" />
                  )
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.value.toLocaleString()}
              </div>
            </CardContent>
            {index < cards.length - 1 && (
              <ArrowRightIcon className="absolute -right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hidden md:block" />
            )}
          </Card>
        ))}
      </div>

      {/* Funnel visualization */}
      <div className="hidden md:block">
        <div className="relative h-24">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-16 bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-950 dark:to-green-950 rounded-lg"
              style={{
                clipPath: 'polygon(0 0, 95% 0, 100% 50%, 95% 100%, 0 100%, 5% 50%)'
              }}
            >
              <div className="flex justify-around items-center h-full px-8">
                <span className="text-xs font-medium">
                  {metrics.rates.visitToSignup}%
                </span>
                <span className="text-xs font-medium">
                  {metrics.rates.signupToTrial}%
                </span>
                <span className="text-xs font-medium">
                  {metrics.rates.trialToCustomer}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}