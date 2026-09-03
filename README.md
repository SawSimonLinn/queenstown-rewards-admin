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

Locations, Burger of the Month campaigns, specials (with image upload to
Supabase Storage), QR code generation, redemption search/filtering,
customer eligibility management, staff accounts, push notifications
(send-now via Expo's push API), and an admin-only audit log.

Sensitive operations (creating staff accounts, broadcasting push
notifications) run server-side using the service-role key — never in the
browser. Everything else uses the public anon key through Supabase's Row
Level Security, same as the mobile app.

**Known gap:** "Correct a confirmed redemption" isn't built yet — only
cancelling a customer's own still-pending request (from the mobile app)
exists so far. Scheduled notifications are saved but don't auto-send later
without a cron/Edge Function, which isn't wired up.
# queenstown-rewards-admin
