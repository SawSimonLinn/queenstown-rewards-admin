# Product Requirements Document: Queenstown Rewards Admin

**Status:** Draft (reverse-engineered from current implementation)
**Owner:** Simon Linn
**Last updated:** 2026-09-04

## 1. Summary

Queenstown Rewards Admin is the staff-facing management dashboard for the Queenstown Rewards loyalty program, a "Burger of the Month" style rewards scheme run across a chain of restaurant locations in Queenstown. It is the operational counterpart to a separate customer-facing Expo mobile app; both share the same Supabase backend.

Staff and admins use this dashboard to manage locations, run recurring reward campaigns, publish specials, generate and control redemption QR codes, process and audit redemptions, manage customer eligibility, send push notifications to customers, and (for admins) manage staff accounts and review a system-wide audit log.

## 2. Goals

- Give restaurant staff a fast, low-friction way to confirm and process customer reward redemptions in-store.
- Give program managers a single place to configure locations, campaigns, and specials without engineering involvement.
- Provide admins visibility and control over who has staff access, and an audit trail of privileged actions.
- Keep the surface area server-first and simple: no bespoke backend service, minimal client-side state, direct-to-Supabase data access with enforced authorization.

## 3. Non-goals

- Customer-facing experience (handled entirely by the separate Expo mobile app).
- Payments or billing — the program has no monetary transaction component.
- Marketing analytics/BI (no analytics SDK or reporting beyond what's in-dashboard).
- Automated scheduling infrastructure for notifications (scheduled sends are currently stored but not auto-dispatched — see Open Issues).

## 4. Users and roles

Authorization is enforced server-side (not just hidden in the UI) via `profiles.role`, checked in every Server Action and in `proxy.ts` for route access.

| Role | Description | Access |
|---|---|---|
| `customer` | Mobile app end users | Explicitly blocked from logging into the admin dashboard |
| `staff` | Restaurant/location staff | Dashboard overview, locations, campaigns, specials, QR codes, redemptions, customers, notifications |
| `admin` | Program managers | Everything staff can do, plus staff account management and the audit log |

First admin is bootstrapped manually via SQL; all subsequent staff/admin accounts are created through the dashboard's Staff section.

## 5. Core features

### 5.1 Authentication
- Email/password sign-in via Supabase Auth.
- Customer-role accounts are rejected and signed back out at login with an error message.
- Session refresh and route protection handled in `proxy.ts` (Next.js 16 middleware): unauthenticated users are redirected off `/dashboard`, authenticated users are redirected off `/login`.

### 5.2 Dashboard overview
- At-a-glance metrics: number of active locations, pending redemptions, redemptions this month, active specials.
- Shows the currently active Burger of the Month campaign.

### 5.3 Locations
- CRUD for restaurant locations: name, address, suburb, phone, structured weekly opening hours, participation flag.
- A location can be marked as not currently participating in the program without deleting it.

### 5.4 Campaigns ("Burger of the Month")
- CRUD for recurring reward campaigns: name, description, terms and restrictions, start/end dates, status (draft / scheduled / active / expired), image.
- Each campaign is associated with a subset of participating locations.

### 5.5 Specials
- CRUD for time-boxed promotional specials: title, description, start/end dates, image, associated locations.

### 5.6 QR codes
- Generate redemption QR codes bound to a specific location + campaign, with an expiry, backed by an opaque UUID token.
- QR image rendered client-side; codes can be deactivated to invalidate them immediately.

### 5.7 Redemptions
- Searchable, filterable table of redemption events (by customer, location, status, date range).
- Redemption statuses: pending staff confirmation, confirmed, cancelled, corrected.

### 5.8 Customers
- List of customer accounts.
- Per-customer detail view: monthly entitlement history per campaign period (eligible / ineligible / redeemed) with staff controls to correct/toggle status, plus full redemption history.

### 5.9 Notifications
- Create push notification campaigns (title, body, deep link) sent to customer devices via the Expo Push API.
- Can send immediately or set a scheduled send time (see Open Issues — scheduling is not currently automated).

### 5.10 Staff management (admin only)
- Create new staff/admin accounts, assign a staff member to a location, rename staff nicknames, deactivate accounts.

### 5.11 Audit log (admin only)
- Paginated, filterable log of privileged/administrative actions: action type, actor, target, metadata, timestamp.

## 6. Data model (Supabase Postgres)

Schema is owned by the sibling mobile app's migrations, shared via the same Supabase project. Key tables:

- `profiles` — id, full_name, email, role, created_at
- `staff_members` — profile_id, location_id, is_active
- `locations` — name, address, suburb, phone, opening_hours (JSON), is_participating
- `burger_campaigns` — name, description, terms_and_restrictions, start_date, end_date, status, image_url
- `campaign_locations` — join table
- `specials` — title, description, start_date, end_date, image_url
- `special_locations` — join table
- `redemption_qr_codes` — location_id, campaign_id, token, expires_at, is_active
- `redemptions` — profile_id, location_id, status, redeemed_at
- `monthly_entitlements` — profile_id, period_month, burger_campaign, status, redeemed_at
- `notification_campaigns` — title, body, deep_link, scheduled_for, status
- `push_tokens` — device push tokens (service-role access only, never exposed to staff-level RLS)
- `audit_logs` — action, actor_profile_id, target_id, metadata, created_at

## 7. Architecture

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions), React 19.
- **No REST API layer:** all mutations go through per-feature Server Actions (e.g. `src/app/dashboard/locations/actions.ts`), not `src/app/api` route handlers.
- **Backend:** Supabase (Postgres + Auth + Storage + Row Level Security) — no Prisma or separate ORM; queries go through Supabase's client directly from Server Components/Actions.
- **Two Supabase clients:**
  - Anon-key client, subject to RLS, used for normal reads/writes.
  - Service-role client (`server-only`), used sparingly for privileged operations (creating staff auth users, reading all push tokens) — bypasses RLS and never reaches the browser.
- **Validation:** Zod schemas shared/mirrored between client forms (`react-hook-form`) and server-side re-validation in actions.
- **Storage:** Supabase Storage `public-images` bucket for campaign/special images.
- **Push notifications:** direct integration with the Expo Push API, batched at 100 tokens per request.
- **UI:** Tailwind CSS v4, small in-house component set (`src/components/ui/`) with a shared mobile-card/desktop-table pattern for all list views, QR rendering via the `qrcode` package.
- **State management:** none beyond Server Components + Server Actions + `revalidatePath` — deliberately minimal client-side JS.

## 8. Non-functional requirements

- **Authorization must be enforced server-side on every Server Action**, not assumed from UI visibility, since Server Actions are POST-reachable directly.
- Dashboard should remain usable on mobile devices for in-store staff use (reflected in the dual mobile-card/table UI pattern).
- All list/detail routes should have loading states for perceived performance (already implemented via `loading.tsx` per route).

## 9. Open issues / known gaps

- **Scheduled notifications are not actually dispatched.** `notification_campaigns` supports a `scheduled_for` status, but there is no cron/worker to send them at that time — only immediate sends currently work. Needs either a scheduled job (e.g. Supabase Edge Function cron, or an external scheduler) or this feature should be removed/marked not-yet-supported in the UI.
- **First admin bootstrap is manual (SQL).** Acceptable for a single-tenant internal tool, but worth documenting as a runbook step rather than tribal knowledge.
- No environment/observability requirements (error tracking, logging) are currently defined — worth deciding if this is in scope.

## 10. Success metrics

To be defined with the business owner — candidates:
- Time from redemption request to staff confirmation.
- Staff account provisioning time (time from hire to dashboard access).
- Notification delivery rate via Expo push.
