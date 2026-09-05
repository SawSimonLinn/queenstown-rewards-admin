# Queenstown Rewards Admin

Staff/admin dashboard for Queenstown Rewards. A separate Next.js app from
the Expo mobile app, sharing the same Supabase project.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same values as the mobile app's `.env`
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase Dashboard → Project Settings → API → `service_role` key. Server-only, never committed, never sent to the browser.
3. Run the Phase 11 migrations (in the mobile app's `supabase/migrations/`, files `20260902160000` through `20260902163000`) in the Supabase SQL Editor, in order, if you haven't already.
4. Bootstrap your first admin account — sign up as a normal customer in the **mobile app**, then in Supabase SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'your-admin-email@example.com';
   ```
   (Only the *first* admin needs this manual step — from then on, use Staff → Add staff account in this dashboard.)
5. `npm run dev`, open http://localhost:3000, sign in.

## What's here

Locations (with an overview/hours/campaigns/promotions/QR codes/staff detail
view), Burger of the Month campaigns, promotions ("specials", with image
upload to Supabase Storage and a draft/active publish flag), QR code
generation, a full redemption confirm/cancel/correct workflow, customer
eligibility management, staff accounts, push notifications (send-now via
Expo's push API, plus scheduled dispatch — see Runbook below), and an
admin-only audit log.

Sensitive operations (creating staff accounts, broadcasting push
notifications) run server-side using the service-role key — never in the
browser. Everything else uses the public anon key through Supabase's Row
Level Security, same as the mobile app.

## Runbook: this repo's own migrations

Schema for the shared tables is owned by the mobile app's migrations (see
Setup above), but three small additive migrations live in **this** repo's
`supabase/migrations/` because they only matter to the admin dashboard:

1. `20260904170000_specials_status.sql` — adds `specials.status`
   (`draft`/`active`) so promotions can be saved as drafts before publishing.
2. `20260904170100_redemptions_confirmation.sql` — adds
   `redemptions.confirmed_by_staff_id` and `redemptions.correction_note`,
   needed for the confirm/cancel/correct workflow.
3. `20260904170200_notification_dispatch.sql` — widens
   `notification_campaigns.status` to include `sending`/`failed`, enables
   `pg_cron`/`pg_net`, and schedules a job that calls the
   `dispatch-notifications` Edge Function every minute.

Run all three, in order, in the Supabase SQL Editor. Before running #3, edit
its `cron.schedule(...)` call to use your real project ref and service role
key (the file has inline placeholders and comments).

### Deploying the scheduled-notification dispatcher

Scheduled notifications are saved with `status: "scheduled"` but nothing
sends them until this Edge Function is deployed and the cron job above is
active:

```sh
supabase functions deploy dispatch-notifications
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your service role key>
```

`SUPABASE_URL` is provided automatically by Supabase. Once deployed, the
cron job hits the function every minute; it finds due `scheduled` campaigns,
sends them via Expo's push API, and marks them `sent` or `failed`. Until you
do this deploy step, scheduled notifications will sit in `scheduled` status
indefinitely — the dashboard's "Needs attention" panel will surface that.

## Known gaps / assumptions

- Only redemption confirm/cancel/correct and notification dispatch write to
  `audit_logs` from this app. Other mutations (locations, campaigns,
  promotions, staff, QR codes) don't yet — that predates this redesign.
- "Burger Club member" (customer list/detail) is derived as "has at least
  one `monthly_entitlements` row" — there's no dedicated membership flag in
  the schema.
- "Preferred location" (customer list/detail) is derived from the
  customer's most recent redemption — there's no stored preference field.
- Promotions don't have a location-scoped audience or a linked
  campaign/promotion field on notifications — the schema doesn't have those
  columns and adding them was out of scope for this pass.
- Brand colors in `src/app/globals.css` are an interpretation of "Queenstown
  orange-red"; retune the CSS variables there if they don't match the
  mobile app's actual palette.
