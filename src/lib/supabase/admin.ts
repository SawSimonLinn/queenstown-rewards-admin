import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. Bypasses RLS entirely — use ONLY for the
 * specific admin operations that genuinely need it (e.g. creating a staff
 * auth user), never for general data access. The `server-only` import
 * above makes it a build error to import this from any Client Component.
 *
 * SUPABASE_SERVICE_ROLE_KEY must never be prefixed NEXT_PUBLIC_ and must
 * never be sent to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill in your Supabase project values.'
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
