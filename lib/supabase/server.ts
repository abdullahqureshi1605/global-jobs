import {
  createClient as createSupabaseClient,
} from "@supabase/supabase-js";

function requireEnv(
  name: string
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing ${name} environment variable.`
    );
  }

  return value;
}

const supabaseUrl =
  requireEnv(
    "NEXT_PUBLIC_SUPABASE_URL"
  );

const supabasePublishableKey =
  requireEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  );

export function createClient() {
  return createSupabaseClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export const supabaseServer =
  createClient();