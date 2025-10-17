-- Disable automatic daily SOF12 task generation

-- Unschedule the daily SOF12 task creation cron job
DO $$
BEGIN
  PERFORM cron.unschedule('daily-sof12-tasks');
  RAISE NOTICE 'Successfully unscheduled daily-sof12-tasks cron job';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Cron job daily-sof12-tasks does not exist or was already unscheduled';
END
$$;