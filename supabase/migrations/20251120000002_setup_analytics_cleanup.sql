-- Enable pg_cron extension if not already enabled
-- Note: This requires enabling pg_cron in Supabase dashboard first
-- Go to: Database > Extensions and enable pg_cron

-- Create a function to cleanup old page views
CREATE OR REPLACE FUNCTION cleanup_old_page_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete page views older than 90 days
  DELETE FROM page_views
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- Log the cleanup (optional - you can remove this if not needed)
  RAISE NOTICE 'Cleaned up page views older than 90 days at %', NOW();
END;
$$;

-- Schedule the cleanup job to run weekly on Sundays at 4 AM UTC
-- Note: You need to run this after enabling pg_cron extension in Supabase dashboard
-- Uncomment the lines below after enabling pg_cron:

-- SELECT cron.schedule(
--   'cleanup-old-page-views',    -- job name
--   '0 4 * * 0',                  -- cron expression (Sundays at 4 AM)
--   $$SELECT cleanup_old_page_views();$$  -- SQL command to run
-- );

-- To verify the job is scheduled (after enabling pg_cron):
-- SELECT * FROM cron.job;

-- To unschedule the job if needed:
-- SELECT cron.unschedule('cleanup-old-page-views');

-- Alternative: Manual cleanup command for testing
-- You can run this manually to test the cleanup:
-- SELECT cleanup_old_page_views();

COMMENT ON FUNCTION cleanup_old_page_views IS 'Removes page view records older than 90 days to maintain database performance and comply with data retention policies';