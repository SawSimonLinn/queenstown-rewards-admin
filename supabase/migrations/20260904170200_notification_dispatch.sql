-- Lets notification_campaigns.status carry 'sending'/'failed' (previously
-- only draft/scheduled/sent existed), then wires up a pg_cron job that hits
-- the dispatch-notifications Edge Function every minute so scheduled
-- campaigns actually get sent.
do $$
declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'notification_campaigns'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%status%';

  if constraint_name is not null then
    execute format('alter table public.notification_campaigns drop constraint %I', constraint_name);
  end if;

  alter table public.notification_campaigns
    add constraint notification_campaigns_status_check
    check (status in ('draft', 'scheduled', 'sending', 'sent', 'failed'));
end $$;

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- IMPORTANT — finish this manually in the Supabase SQL editor after deploying
-- the Edge Function (see README's Runbook section):
--   1. Replace <project-ref> below with your Supabase project ref.
--   2. Replace <service-role-key> with the service_role key
--      (Project Settings → API). Do not commit the real key anywhere.
select cron.schedule(
  'dispatch-scheduled-notifications',
  '* * * * *',
  $cron$
  select net.http_post(
    url := 'https://<project-ref>.functions.supabase.co/dispatch-notifications',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <service-role-key>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $cron$
);
