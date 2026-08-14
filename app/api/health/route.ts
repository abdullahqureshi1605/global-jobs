import { NextResponse } from "next/server";

import { JobService } from "@/services/jobService";
import { ResourceService } from "@/services/resourceService";
import { getSiteUrl } from "@/lib/seo/siteUrl";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  const checks: {
    environment: "ok" | "error";
    jobs: "ok" | "error";
    resources: "ok" | "error";
  } = {
    environment: "error",
    jobs: "error",
    resources: "error",
  };

  const requiredEnvironmentVariables = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
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

  let jobsCount = 0;
  let resourcesCount = 0;

  let jobsError: string | null = null;
  let resourcesError: string | null = null;

  try {
    const jobs =
      await JobService.getPublishedJobs();

    jobsCount = jobs.length;
    checks.jobs = "ok";
  } catch (error) {
    jobsError =
      error instanceof Error
        ? error.message
        : "Jobs query failed.";
  }

  try {
    const resources =
      await ResourceService.getPublishedResources();

    resourcesCount =
      resources.length;

    checks.resources = "ok";
  } catch (error) {
    resourcesError =
      error instanceof Error
        ? error.message
        : "Resources query failed.";
  }

  const healthy =
    checks.environment === "ok" &&
    checks.jobs === "ok" &&
    checks.resources === "ok";

  const response = NextResponse.json(
    {
      status: healthy
        ? "ok"
        : "error",

      service: "horizon-jobs",

      siteUrl: getSiteUrl(),

      checks,

      data: {
        publishedJobs:
          jobsCount,

        publishedResources:
          resourcesCount,
      },

      ...(healthy
        ? {}
        : {
            missingEnvironmentVariables:
              missingEnvironmentVariables.length
                ? missingEnvironmentVariables
                : undefined,

            jobsError:
              jobsError || undefined,

            resourcesError:
              resourcesError || undefined,
          }),

      responseTimeMs:
        Date.now() - startedAt,

      timestamp:
        new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
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