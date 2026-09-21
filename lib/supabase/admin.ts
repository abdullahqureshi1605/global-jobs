import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Lazily create the server-side Supabase client.
 * Keeping env validation inside the getter prevents Next.js build-time route
 * collection from crashing when deployment environment variables are absent.
 * The app will still fail clearly at runtime if the variables are missing.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not configured.");
  }

  client = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

// Backward-compatible export for existing server code. The client is created
// only when a property such as `.from()` is actually accessed.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getSupabaseAdmin() as object, prop, receiver);
    return typeof value === "function" ? value.bind(getSupabaseAdmin()) : value;
  },
});
