import {
  loadEnvConfig,
} from "@next/env";

import {
  createClient,
} from "@supabase/supabase-js";

loadEnvConfig(
  process.cwd()
);

const url =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL;

const secret =
  process.env
    .SUPABASE_SECRET_KEY;

if (!url) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL"
  );
}

if (!secret) {
  throw new Error(
    "Missing SUPABASE_SECRET_KEY"
  );
}

const supabase =
  createClient(
    url,
    secret,
    {
      auth: {
        autoRefreshToken:
          false,

        persistSession:
          false,
      },
    }
  );

async function main() {
  console.log(
    "\nTesting Supabase database...\n"
  );

  const {
    data,
    error,
  } =
    await supabase
      .from("jobs")
      .select("id")
      .limit(1);

  if (error) {
    console.error(
      "❌ Database connection failed:"
    );

    console.error(
      error.message
    );

    process.exit(1);
  }

  console.log(
    "✅ Supabase connection successful."
  );

  console.log(
    `✅ Jobs table is accessible. Rows returned: ${
      data?.length || 0
    }`
  );

  process.exit(0);
}

main().catch(
  (error) => {
    console.error(
      "❌ Unexpected database test error:"
    );

    console.error(
      error
    );

    process.exit(1);
  }
);