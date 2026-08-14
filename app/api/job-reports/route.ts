import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  checkRateLimit,
} from "@/lib/security/requestGuard";

import {
  rateLimitedResponse,
  securityHeaders,
} from "@/lib/security/apiResponse";

const MAX_BODY_SIZE =
  10_000;

export async function POST(
  request: NextRequest
) {
  const rateLimit =
    checkRateLimit({
      request,
      keyPrefix:
        "job-report",
      limit: 5,
      windowMs:
        10 * 60 * 1000,
    });

  if (!rateLimit.allowed) {
    return rateLimitedResponse(
      rateLimit.retryAfterSeconds
    );
  }

  try {
    const contentLength =
      Number(
        request.headers.get(
          "content-length"
        ) || "0"
      );

    if (
      contentLength >
      MAX_BODY_SIZE
    ) {
      return securityHeaders(
        NextResponse.json(
          {
            error:
              "Request is too large.",
          },
          {
            status: 413,
          }
        )
      );
    }

    const body =
      await request.json();

    if (
      !body ||
      typeof body !==
        "object"
    ) {
      return securityHeaders(
        NextResponse.json(
          {
            error:
              "Invalid request.",
          },
          {
            status: 400,
          }
        )
      );
    }

    const jobUrl =
      typeof body.jobUrl ===
      "string"
        ? body.jobUrl.trim()
        : "";

    const reason =
      typeof body.reason ===
      "string"
        ? body.reason.trim()
        : "";

    const details =
      typeof body.details ===
      "string"
        ? body.details
            .trim()
            .slice(0, 5000)
        : "";

    if (
      !jobUrl ||
      !reason
    ) {
      return securityHeaders(
        NextResponse.json(
          {
            error:
              "Job URL and reason are required.",
          },
          {
            status: 400,
          }
        )
      );
    }

    let parsedUrl: URL;

    try {
      parsedUrl =
        new URL(jobUrl);
    } catch {
      return securityHeaders(
        NextResponse.json(
          {
            error:
              "Please provide a valid job URL.",
          },
          {
            status: 400,
          }
        )
      );
    }

    if (
      parsedUrl.protocol !==
        "http:" &&
      parsedUrl.protocol !==
        "https:"
    ) {
      return securityHeaders(
        NextResponse.json(
          {
            error:
              "Invalid URL protocol.",
          },
          {
            status: 400,
          }
        )
      );
    }

    const allowedReasons = new Set([
      "expired",
      "broken_link",
      "incorrect_info",
      "suspicious",
    ]);

    if (
      !allowedReasons.has(
        reason
      )
    ) {
      return securityHeaders(
        NextResponse.json(
          {
            error:
              "Invalid report reason.",
          },
          {
            status: 400,
          }
        )
      );
    }

    const { error } =
      await supabaseAdmin
        .from(
          "job_reports"
        )
        .insert({
          job_url:
            parsedUrl.toString(),
          reason,
          details:
            details || null,
        });

    if (error) {
      console.error(
        "Job report insert failed:",
        error
      );

      return securityHeaders(
        NextResponse.json(
          {
            error:
              "Failed to submit report.",
          },
          {
            status: 500,
          }
        )
      );
    }

    return securityHeaders(
      NextResponse.json({
        success: true,
      })
    );
  } catch (error) {
    console.error(
      "Unexpected job report error:",
      error
    );

    return securityHeaders(
      NextResponse.json(
        {
          error:
            "Unexpected server error.",
        },
        {
          status: 500,
        }
      )
    );
  }
}