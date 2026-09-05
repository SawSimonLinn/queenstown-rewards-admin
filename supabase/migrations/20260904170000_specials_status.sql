-- Adds a draft/publish flag to promotions ("specials"), mirroring how
-- burger_campaigns.status already works. Scheduled/active/expired are still
-- derived from start_date/end_date in the app; this column only controls
-- whether a promotion is eligible to be shown at all.
alter table public.specials
  add column if not exists status text not null default 'active';

alter table public.specials
  add constraint specials_status_check check (status in ('draft', 'active'));
