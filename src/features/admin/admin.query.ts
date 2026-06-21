import { createClientServer } from '@/shared/database/supabase';
import type {
  AppSetting,
  AdminStats,
  AdminUser,
  InfoBarSettings,
  EmailJourneysSettings,
  FeatureFlags,
  CrossSellProductsSettings,
  MaintenanceSettings,
  AffiliateProgramSettings,
} from './types';

/**
 * ==============================================
 * APP SETTINGS QUERIES
 * ==============================================
 */

/**
 * Get all app settings
 */
export async function getAllSettings(): Promise<AppSetting[]> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching all settings:', error);
    return [];
  }

  return data as AppSetting[];
}

/**
 * Get a specific setting by key
 */
export async function getSetting<T = Record<string, unknown>>(
  key: string
): Promise<T | null> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error || !data) {
    console.error(`Error fetching setting ${key}:`, error);
    return null;
  }

  return data.value as T;
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(
  category: string
): Promise<AppSetting[]> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('category', category);

  if (error) {
    console.error(`Error fetching settings for category ${category}:`, error);
    return [];
  }

  return data as AppSetting[];
}

/**
 * Get Info Bar settings
 */
export async function getInfoBarSettings(): Promise<InfoBarSettings | null> {
  return getSetting<InfoBarSettings>('info_bar');
}

/**
 * Get Email Journeys settings
 */
export async function getEmailJourneysSettings(): Promise<EmailJourneysSettings | null> {
  return getSetting<EmailJourneysSettings>('email_journeys');
}

/**
 * Get Feature Flags settings
 */
export async function getFeatureFlags(): Promise<FeatureFlags | null> {
  return getSetting<FeatureFlags>('feature_flags');
}

/**
 * Get Cross-Sell Products settings
 */
export async function getCrossSellProducts(): Promise<CrossSellProductsSettings | null> {
  return getSetting<CrossSellProductsSettings>('cross_sell_products');
}

/**
 * Get Maintenance Mode settings
 */
export async function getMaintenanceSettings(): Promise<MaintenanceSettings | null> {
  return getSetting<MaintenanceSettings>('maintenance');
}

/**
 * Get Affiliate Program settings
 */
export async function getAffiliateProgramSettings(): Promise<AffiliateProgramSettings | null> {
  return getSetting<AffiliateProgramSettings>('affiliate_program');
}

/**
 * ==============================================
 * ADMIN STATS QUERIES
 * ==============================================
 */

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClientServer();

  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Active subscriptions
  const { count: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Trial users
  const { count: trialUsers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'trialing');

  // Canceled subscriptions
  const { count: canceledSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'canceled');

  // Calculate MRR (Monthly Recurring Revenue)
  // This is a simplified calculation - in production you'd want more sophisticated logic
  const { data: activeSubsData } = await supabase
    .from('subscriptions')
    .select('price_amount')
    .eq('status', 'active');

  const monthlyRecurringRevenue =
    activeSubsData?.reduce((sum, sub) => sum + (sub.price_amount || 0), 0) || 0;

  // New users this month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const { count: newUsersThisMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfMonth.toISOString());

  return {
    totalUsers: totalUsers || 0,
    activeSubscriptions: activeSubscriptions || 0,
    trialUsers: trialUsers || 0,
    canceledSubscriptions: canceledSubscriptions || 0,
    monthlyRecurringRevenue,
    newUsersThisMonth: newUsersThisMonth || 0,
  };
}

/**
 * ==============================================
 * ANALYTICS FUNNEL QUERIES
 * ==============================================
 */

/**
 * Get funnel metrics with conversion rates
 */
export async function getFunnelMetrics(dateRange?: {
  start: Date;
  end: Date;
}): Promise<{
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
}> {
  const supabase = await createClientServer();

  // Default to last 30 days if no date range provided
  const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = dateRange?.end || new Date();

  // 1. Unique visits (from page_views table)
  const { count: visits } = await supabase
    .from('page_views')
    .select('visitor_hash', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // 2. Signups (from profiles table)
  const { count: signups } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // 3. Trials started (subscriptions with any status, not just trialing)
  const { count: trials } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // 4. Active customers (status = active)
  const { count: customers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  return {
    funnel: {
      visits: visits || 0,
      signups: signups || 0,
      trials: trials || 0,
      customers: customers || 0,
    },
    rates: {
      visitToSignup: visits ? ((signups || 0) / visits * 100).toFixed(1) : '0',
      signupToTrial: signups ? ((trials || 0) / signups * 100).toFixed(1) : '0',
      trialToCustomer: trials ? ((customers || 0) / trials * 100).toFixed(1) : '0',
    },
  };
}

/**
 * Get metrics grouped by UTM source
 */
export async function getMetricsByUTM(dateRange?: {
  start: Date;
  end: Date;
}): Promise<Record<string, {
  signups: number;
  trials: number;
  customers: number;
  revenue: number;
}>> {
  const supabase = await createClientServer();

  const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = dateRange?.end || new Date();

  // Get signups with attribution data
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, attribution_data, created_at')
    .not('attribution_data', 'is', null)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // Get subscriptions with attribution data
  const { data: subscriptionsData } = await supabase
    .from('subscriptions')
    .select('id, user_id, status, attribution_data, price_amount, created_at')
    .not('attribution_data', 'is', null)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // Process data by UTM source
  const metricsBySource: Record<string, any> = {};

  // Count signups by source
  profilesData?.forEach((profile) => {
    const source = profile.attribution_data?.utm_source || 'direct';
    if (!metricsBySource[source]) {
      metricsBySource[source] = {
        signups: 0,
        trials: 0,
        customers: 0,
        revenue: 0,
      };
    }
    metricsBySource[source].signups++;
  });

  // Count trials, customers, and revenue by source
  subscriptionsData?.forEach((subscription) => {
    const source = subscription.attribution_data?.utm_source || 'direct';
    if (!metricsBySource[source]) {
      metricsBySource[source] = {
        signups: 0,
        trials: 0,
        customers: 0,
        revenue: 0,
      };
    }

    // Count as trial (any subscription)
    metricsBySource[source].trials++;

    // Count as customer if active
    if (subscription.status === 'active') {
      metricsBySource[source].customers++;
      metricsBySource[source].revenue += (subscription.price_amount || 0) / 100; // Convert from cents
    }
  });

  return metricsBySource;
}

/**
 * Get churn rate for a given period
 */
export async function getChurnRate(month?: Date): Promise<number> {
  const supabase = await createClientServer();

  // Default to current month
  const targetMonth = month || new Date();
  const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
  const startOfPreviousMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 1);

  // Active subscriptions at the end of previous month
  const { count: activeEndPrevMonth } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .lte('created_at', startOfMonth.toISOString());

  // Canceled subscriptions this month
  const { count: canceledThisMonth } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'canceled')
    .gte('canceled_at', startOfMonth.toISOString())
    .lte('canceled_at', endOfMonth.toISOString());

  // Subscriptions scheduled to cancel at period end
  const { count: willCancelThisMonth } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('cancel_at_period_end', true)
    .gte('current_period_end', startOfMonth.toISOString())
    .lte('current_period_end', endOfMonth.toISOString());

  const totalChurn = (canceledThisMonth || 0) + (willCancelThisMonth || 0);
  const churnRate = activeEndPrevMonth ? (totalChurn / activeEndPrevMonth * 100) : 0;

  return Number(churnRate.toFixed(2));
}

/**
 * ==============================================
 * USER MANAGEMENT QUERIES
 * ==============================================
 */

/**
 * Get all users with admin metadata
 */
export async function getAllUsers(): Promise<AdminUser[]> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      avatar_url,
      created_at,
      user_flags,
      current_organization_id,
      subscriptions (
        status
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return (
    data?.map((user) => {
      const { subscriptions, ...userWithoutSubscriptions } = user as typeof user & { subscriptions: unknown };
      return {
        ...userWithoutSubscriptions,
        subscription_status:
          (subscriptions as { status: string }[])?.[0]?.status || null,
      };
    }) || []
  );
}

/**
 * Get a specific user by ID with full details
 */
export async function getUserById(userId: string): Promise<AdminUser | null> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      avatar_url,
      created_at,
      user_flags,
      current_organization_id,
      subscriptions (
        status
      )
    `
    )
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }

  const { subscriptions, ...userWithoutSubscriptions } = data as typeof data & { subscriptions: unknown };
  return {
    ...userWithoutSubscriptions,
    subscription_status:
      (subscriptions as { status: string }[])?.[0]?.status || null,
  };
}

/**
 * Search users by name or email
 */
export async function searchUsers(query: string): Promise<AdminUser[]> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      avatar_url,
      created_at,
      user_flags,
      current_organization_id,
      subscriptions (
        status
      )
    `
    )
    .or(`full_name.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return (
    data?.map((user) => {
      const { subscriptions, ...userWithoutSubscriptions } = user as typeof user & { subscriptions: unknown };
      return {
        ...userWithoutSubscriptions,
        subscription_status:
          (subscriptions as { status: string }[])?.[0]?.status || null,
      };
    }) || []
  );
}

/**
 * Get users with filters (search and role filter)
 * @param searchQuery - Optional search query for full_name
 * @param roleFilter - Optional role filter: 'all' | 'admins' | 'users'
 * @returns Filtered list of users
 */
export async function getUsersWithFilters(
  searchQuery?: string,
  roleFilter: 'all' | 'admins' | 'users' = 'all'
): Promise<AdminUser[]> {
  const supabase = await createClientServer();

  let query = supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      avatar_url,
      created_at,
      user_flags,
      current_organization_id,
      subscriptions (
        status
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(100);

  // Apply search filter if provided
  if (searchQuery && searchQuery.trim().length > 0) {
    query = query.or(`full_name.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching users with filters:', error);
    return [];
  }

  // Map and apply role filter
  const users = (data?.map((user) => {
    const { subscriptions, ...userWithoutSubscriptions } = user as typeof user & { subscriptions: unknown };
    return {
      ...userWithoutSubscriptions,
      subscription_status:
        (subscriptions as { status: string }[])?.[0]?.status || null,
    };
  }) || []);

  // Filter by role if needed
  if (roleFilter === 'admins') {
    return users.filter((user) =>
      user.user_flags && (
        user.user_flags.includes('admin') ||
        user.user_flags.includes('super_admin')
      )
    );
  } else if (roleFilter === 'users') {
    return users.filter((user) =>
      !user.user_flags || (
        !user.user_flags.includes('admin') &&
        !user.user_flags.includes('super_admin')
      )
    );
  }

  // Return all users
  return users;
}
