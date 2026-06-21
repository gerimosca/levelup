# Analytics Setup Guide

## Overview

This guide explains how to set up and configure the basic analytics system that has been implemented.

## Components

### 1. Database Tables

- **`page_views`**: Tracks all page visits with privacy-preserving visitor hashing
- **`subscriptions.price_amount`**: Added field for accurate MRR calculations

### 2. Tracking System

The tracking system automatically captures page views for both authenticated and anonymous users.

- **Client-side**: `usePageTracking` hook in layouts
- **Server-side**: `/api/track` endpoint
- **Attribution**: Automatically captures UTM parameters from existing attribution system

### 3. Admin Dashboard

New analytics components in the admin dashboard:

- **Funnel Metrics**: Shows conversion rates (Visits → Signups → Trials → Customers)
- **UTM Performance**: Breakdown of performance by traffic source
- **Churn Rate**: Calculated monthly churn percentage

## Setup Instructions

### 1. Apply Database Migrations

```bash
# Apply all migrations
npx supabase db push

# Or apply individually:
npx supabase db push --file supabase/migrations/20241120_add_price_amount_to_subscriptions.sql
npx supabase db push --file supabase/migrations/20241120_create_page_views_table.sql
npx supabase db push --file supabase/migrations/20241120_setup_analytics_cleanup.sql
```

### 2. Enable pg_cron for Automatic Cleanup (Production Only)

1. Go to your Supabase Dashboard
2. Navigate to Database → Extensions
3. Enable `pg_cron` extension
4. Run the following SQL to schedule the cleanup job:

```sql
SELECT cron.schedule(
  'cleanup-old-page-views',
  '0 4 * * 0',  -- Runs every Sunday at 4 AM UTC
  $$SELECT cleanup_old_page_views();$$
);
```

### 3. Verify Tracking is Working

1. Visit any page in your application
2. Check the `page_views` table in Supabase:

```sql
SELECT * FROM page_views ORDER BY created_at DESC LIMIT 10;
```

### 4. Manual Cleanup (Optional)

If you don't want to use pg_cron, you can manually run the cleanup:

```sql
-- Delete page views older than 90 days
DELETE FROM page_views WHERE created_at < NOW() - INTERVAL '90 days';
```

Or create a scheduled function in your application to call this periodically.

## Privacy & Compliance

### Data Collection

- **No PII stored**: Visitor hash is SHA256 of user_agent + date
- **UTM tracking**: Only marketing parameters, no personal data
- **User consent**: Respects existing consent settings

### Data Retention

- **Automatic cleanup**: Page views deleted after 90 days
- **GDPR compliant**: Users can request data deletion
- **Minimal data**: Only essential metrics tracked

## Usage

### Viewing Analytics

1. Navigate to `/admin` in your application
2. Analytics are displayed automatically:
   - Basic stats (users, subscriptions, MRR)
   - Conversion funnel with rates
   - Performance by UTM source

### Querying Analytics Data

```typescript
import { getFunnelMetrics, getMetricsByUTM, getChurnRate } from '@/features/admin/admin.query';

// Get funnel metrics for last 30 days
const funnel = await getFunnelMetrics();

// Get metrics by UTM source
const utmMetrics = await getMetricsByUTM();

// Get current month churn rate
const churnRate = await getChurnRate();
```

### Custom Date Ranges

```typescript
// Get funnel metrics for specific date range
const funnel = await getFunnelMetrics({
  start: new Date('2024-01-01'),
  end: new Date('2024-01-31')
});
```

## Troubleshooting

### Tracking Not Working

1. Check browser console for errors
2. Verify `/api/track` endpoint is accessible
3. Check Supabase service role key is configured

### No Data in Dashboard

1. Ensure migrations have been applied
2. Wait for some traffic to generate data
3. Check RLS policies allow admin access

### Cleanup Job Not Running

1. Verify pg_cron is enabled in Supabase
2. Check job is scheduled: `SELECT * FROM cron.job;`
3. View job run history: `SELECT * FROM cron.job_run_details;`

## Future Enhancements

Consider these improvements:

1. **Real-time dashboard**: Use Supabase realtime subscriptions
2. **More metrics**: Bounce rate, session duration, page performance
3. **Export functionality**: CSV export of analytics data
4. **A/B testing**: Track variant performance
5. **Custom events**: Track specific user actions beyond page views

## Migration to External Analytics

If you outgrow this basic system, consider migrating to:

- **PostHog**: Open-source product analytics
- **Plausible**: Privacy-focused analytics
- **Mixpanel**: Advanced user analytics
- **Amplitude**: Product analytics platform

The current implementation makes it easy to run these in parallel during migration.