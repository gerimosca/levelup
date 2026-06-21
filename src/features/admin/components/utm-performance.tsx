'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getUTMMetricsAction } from '../admin.actions';

interface UTMMetrics {
  signups: number;
  trials: number;
  customers: number;
  revenue: number;
}

export function UTMPerformance() {
  const [metrics, setMetrics] = useState<Record<string, UTMMetrics> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await getUTMMetricsAction();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load UTM metrics:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance by Source</CardTitle>
          <CardDescription>Conversion metrics by UTM source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance by Source</CardTitle>
          <CardDescription>Conversion metrics by UTM source</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No attribution data available yet. UTM parameters will be tracked as users visit your site.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by revenue descending
  const sortedSources = Object.entries(metrics).sort(
    ([, a], [, b]) => b.revenue - a.revenue
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Source</CardTitle>
        <CardDescription>Conversion metrics by UTM source (Last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Signups</TableHead>
              <TableHead className="text-right">Trials</TableHead>
              <TableHead className="text-right">Customers</TableHead>
              <TableHead className="text-right">Trial CR</TableHead>
              <TableHead className="text-right">Customer CR</TableHead>
              <TableHead className="text-right">MRR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSources.map(([source, data]) => {
              const trialCR = data.signups > 0
                ? ((data.trials / data.signups) * 100).toFixed(1)
                : '0';
              const customerCR = data.trials > 0
                ? ((data.customers / data.trials) * 100).toFixed(1)
                : '0';

              return (
                <TableRow key={source}>
                  <TableCell className="font-medium capitalize">
                    {source}
                  </TableCell>
                  <TableCell className="text-right">
                    {data.signups}
                  </TableCell>
                  <TableCell className="text-right">
                    {data.trials}
                  </TableCell>
                  <TableCell className="text-right">
                    {data.customers}
                  </TableCell>
                  <TableCell className="text-right">
                    {trialCR}%
                  </TableCell>
                  <TableCell className="text-right">
                    {customerCR}%
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${data.revenue.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}