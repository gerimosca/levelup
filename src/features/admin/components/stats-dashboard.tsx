'use client';

import { Users, DollarSign, UserCheck, UserX, TrendingUp } from 'lucide-react';
import type { AdminStats } from '../types';

interface StatsDashboardProps {
  stats: AdminStats;
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: 'All registered users',
    },
    {
      label: 'Active Subscriptions',
      value: stats.activeSubscriptions.toLocaleString(),
      icon: UserCheck,
      description: 'Currently active',
    },
    {
      label: 'Trial Users',
      value: stats.trialUsers.toLocaleString(),
      icon: TrendingUp,
      description: 'On trial period',
    },
    {
      label: 'Canceled',
      value: stats.canceledSubscriptions.toLocaleString(),
      icon: UserX,
      description: 'Subscription canceled',
    },
    {
      label: 'MRR',
      value: `$${(stats.monthlyRecurringRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: 'Monthly Recurring Revenue',
    },
    {
      label: 'New This Month',
      value: stats.newUsersThisMonth.toLocaleString(),
      icon: Users,
      description: 'Users joined this month',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </div>
            <stat.icon className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
        </div>
      ))}
    </div>
  );
}
