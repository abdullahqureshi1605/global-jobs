import { NextResponse } from "next/server";
import { createHash } from "crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "page_exit",
  "page_performance",
  "cta_click",
  "job_apply_click",
  "report_job_click",
]);

function text(
  value: unknown,
  max = 500
) {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const result = value
    .trim()
    .slice(0, max);

  return result || null;
}

function number(
  value: unknown
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function hash(
  value: string
) {
  const salt =
    process.env.ANALYTICS_HASH_SALT ||
    "horizon-jobs-default-analytics-salt";

  return createHash("sha256")
    .update(
      `${salt}:${value}`
    )
    .digest("hex");
}

function getCountry(
  request: Request
) {
  const code =
    request.headers.get(
      "x-nf-country"
    ) ||
    request.headers.get(
      "x-country"
    ) ||
    request.headers.get(
      "cf-ipcountry"
    ) ||
    "";

  return code
    .trim()
    .toUpperCase()
    .slice(0, 8) || null;
}

function getOriginAllowed(
  request: Request
) {
  const origin =
    request.headers.get(
      "origin"
    );

  // Some sendBeacon requests may omit Origin.
  if (!origin) {
    return true;
  }

  try {
    const originUrl =
      new URL(origin);

    const requestUrl =
      new URL(request.url);

    if (
      originUrl.origin ===
      requestUrl.origin
    ) {
      return true;
    }

    const configuredSite =
      process.env.NEXT_PUBLIC_SITE_URL;

    if (
      configuredSite
    ) {
      return (
        originUrl.origin ===
        new URL(
          configuredSite
        ).origin
      );
    }

    return false;
  } catch {
    return false;
  }
}

export async function POST(
  request: Request
) {
  try {
    if (
      !getOriginAllowed(
        request
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Origin not allowed",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request.json();

    const eventName =
      text(
        body.event_name,
        40
      );

    if (
      !eventName ||
      !ALLOWED_EVENTS.has(
        eventName
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid analytics event",
        },
        {
          status: 400,
        }
      );
    }

    const visitorId =
      text(
        body.visitor_id,
        150
      );

    const sessionId =
      text(
        body.session_id,
        150
      );

    const visitorHash =
      visitorId
        ? hash(visitorId)
        : null;

    const sessionHash =
      sessionId
        ? hash(sessionId)
        : null;

    const countryCode =
      getCountry(request);

    const row = {
      event_name:
        eventName,

      visitor_hash:
        visitorHash,

      session_hash:
        sessionHash,

      page_path:
        text(
          body.page_path,
          500
        ),

      page_title:
        text(
          body.page_title,
          250
        ),

      country_code:
        countryCode,

      country_name:
        countryCode,

      referrer_host:
        text(
          body.referrer_host,
          200
        ),

      utm_source:
        text(
          body.utm_source,
          100
        ),

      utm_medium:
        text(
          body.utm_medium,
          100
        ),

      utm_campaign:
        text(
          body.utm_campaign,
          150
        ),

      has_gclid:
        Boolean(
          body.has_gclid
        ),

      has_fbclid:
        Boolean(
          body.has_fbclid
        ),

      device_type:
        text(
          body.device_type,
          30
        ),

      browser:
        text(
          body.browser,
          50
        ),

      operating_system:
        text(
          body.operating_system,
          50
        ),

      event_label:
        text(
          body.event_label,
          120
        ),

      event_target:
        text(
          body.event_target,
          500
        ),

      is_landing:
        Boolean(
          body.is_landing
        ),

      duration_ms:
        number(
          body.duration_ms
        ),

      scroll_depth:
        number(
          body.scroll_depth
        ),

      load_ms:
        number(
          body.load_ms
        ),

      fcp_ms:
        number(
          body.fcp_ms
        ),

      lcp_ms:
        number(
          body.lcp_ms
        ),

      cls:
        number(
          body.cls
        ),

      screen_width:
        number(
          body.screen_width
        ),

      screen_height:
        number(
          body.screen_height
        ),

      metadata: {},
    };

    const {
      error,
    } =
      await supabaseAdmin
        .from(
          "analytics_events"
        )
        .insert(row);

    if (error) {
      console.error(
        "Analytics insert failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to save analytics event",
        },
        {
          status: 500,
        }
      );
    }

    return new NextResponse(
      null,
      {
        status: 204,
      }
    );
  } catch (error) {
    console.error(
      "Analytics tracking error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Invalid analytics request",
      },
      {
        status: 400,
      }
    );
  }
}