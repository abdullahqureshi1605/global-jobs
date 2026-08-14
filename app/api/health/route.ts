import { NextResponse } from "next/server";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  getSiteUrl,
} from "@/lib/seo/siteUrl";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt =
    Date.now();

  const checks: {
    database: "ok" | "error";
    environment: "ok" | "error";
  } = {
    database: "error",
    environment: "error",
  };

  const requiredEnvironmentVariables = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SECRET_KEY",
  ];

  const missingEnvironmentVariables =
    requiredEnvironmentVariables.filter(
      (name) =>
        !process.env[name]?.trim()
    );

  if (
    missingEnvironmentVariables.length ===
    0
  ) {
    checks.environment = "ok";
  }

  let databaseError: string | null =
    null;

  try {
    const {
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("id", {
        head: true,
        count: "exact",
      });

    if (!error) {
      checks.database = "ok";
    } else {
      databaseError =
        error.message;
    }
  } catch (error) {
    databaseError =
      error instanceof Error
        ? error.message
        : "Database check failed.";
  }

  const healthy =
    checks.environment === "ok" &&
    checks.database === "ok";

  const response =
    NextResponse.json(
      {
        status: healthy
          ? "ok"
          : "error",

        service:
          "horizon-jobs",

        siteUrl:
          getSiteUrl(),

        checks: {
          environment:
            checks.environment,

          database:
            checks.database,
        },

        ...(healthy
          ? {}
          : {
              databaseError:
                databaseError ||
                undefined,

              missingEnvironmentVariables:
                missingEnvironmentVariables.length >
                0
                  ? missingEnvironmentVariables
                  : undefined,
            }),

        responseTimeMs:
          Date.now() -
          startedAt,

        timestamp:
          new Date().toISOString(),
      },
      {
        status: healthy
          ? 200
          : 503,
      }
    );

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate"
  );

  response.headers.set(
    "X-Robots-Tag",
    "noindex, nofollow, noarchive"
  );

  return response;
}