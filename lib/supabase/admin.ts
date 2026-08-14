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

const supabaseSecretKey =
  requireEnv(
    "SUPABASE_SECRET_KEY"
  );

export const supabaseAdmin =
  createSupabaseClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );