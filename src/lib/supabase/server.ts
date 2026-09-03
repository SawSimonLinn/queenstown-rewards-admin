import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server Supabase client for Server Components, Server Actions, and Route
 * Handlers — uses only the public anon key, subject to RLS, scoped to the
 * signed-in staff member via their session cookie.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no request context to write
            // to — safe to ignore since the proxy below refreshes sessions.
          }
        },
      },
    }
  );
}
