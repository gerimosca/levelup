import { getDashboardStats } from './dashboard.query';
import type { DashboardStats } from './types';

/**
 * Handle fetching dashboard data
 */
export async function handleGetDashboardData(): Promise<{
  stats: DashboardStats;
  error: string | null;
}> {
  try {
    const stats = await getDashboardStats();
    return { stats, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      stats: { totalUsers: 0, activeSubscriptions: 0, revenue: 0 },
      error: message,
    };
  }
}
