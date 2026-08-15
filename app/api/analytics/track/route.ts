import { NextResponse } from "next/server";
import { createHash } from "crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_EVENTS =
  new Set([
    "page_view",
    "page_exit",
    "page_performance",
    "cta_click",
    "job_apply_click",
    "report_job_click",
    "heartbeat",
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

  const result =
    value.trim().slice(
      0,
      max
    );

  return result || null;
}

function number(
  value: unknown
) {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  return null;
}

function hash(
  value: string
) {
  const salt =
    process.env.ANALYTICS_HASH_SALT ||
    "horizon-jobs-default-analytics-salt";

  return createHash(
    "sha256"
  )
    .update(
      `${salt}:${value}`
    )
    .digest("hex");
}

function originAllowed(
  request: Request
) {
  const origin =
    request.headers.get(
      "origin"
    );

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

    const configured =
      process.env
        .NEXT_PUBLIC_SITE_URL;

    if (configured) {
      return (
        originUrl.origin ===
        new URL(
          configured
        ).origin
      );
    }

    return false;
  } catch {
    return false;
  }
}

function detectBot(
  request: Request
) {
  const userAgent =
    request.headers.get(
      "user-agent"
    ) || "";

  return /bot|crawler|spider|slurp|bingpreview|headless|phantom|selenium|puppeteer/i.test(
    userAgent
  );
}

function geoFromHeaders(
  request: Request
) {
  const countryCode =
    text(
      request.headers.get(
        "x-nf-country"
      ) ||
        request.headers.get(
          "x-country"
        ) ||
        request.headers.get(
          "cf-ipcountry"
        ),
      8
    )?.toUpperCase() ||
    null;

  const countryName =
    text(
      request.headers.get(
        "x-nf-country-name"
      ),
      100
    );

  const city =
    text(
      request.headers.get(
        "x-nf-city"
      ),
      100
    );

  const region =
    text(
      request.headers.get(
        "x-nf-region"
      ),
      100
    );

  return {
    countryCode,
    countryName:
      countryName ||
      countryCode,
    city,
    region,
  };
}

export async function POST(
  request: Request
) {
  try {
    if (
      !originAllowed(
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
        ? hash(
            visitorId
          )
        : null;

    const sessionHash =
      sessionId
        ? hash(
            sessionId
          )
        : null;

    const geo =
      geoFromHeaders(
        request
      );

    const isBot =
      detectBot(
        request
      );

    /* ==========================================
       LIVE PRESENCE
       ========================================== */

    if (
      eventName ===
      "heartbeat"
    ) {
      if (
        !sessionHash
      ) {
        return new NextResponse(
          null,
          {
            status: 204,
          }
        );
      }

      const now =
        new Date().toISOString();

      const {
        error,
      } =
        await supabaseAdmin
          .from(
            "analytics_presence"
          )
          .upsert(
            {
              session_hash:
                sessionHash,

              visitor_hash:
                visitorHash,

              last_seen:
                now,

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
                geo.countryCode,

              country_name:
                geo.countryName,

              city:
                geo.city,

              region:
                geo.region,

              timezone:
                text(
                  body.timezone,
                  100
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

              is_bot:
                isBot,
            },
            {
              onConflict:
                "session_hash",
            }
          );

      if (error) {
        console.error(
          "Presence update failed:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Failed to update live visitor.",
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
    }

    /* ==========================================
       NORMAL ANALYTICS EVENT
       ========================================== */

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
        geo.countryCode,

      country_name:
        geo.countryName,

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

    /*
     * page_view also establishes the live presence
     * immediately, so the visitor appears without
     * waiting for the first heartbeat.
     */
    if (
      eventName ===
      "page_view"
    ) {
      if (
        sessionHash
      ) {
        await supabaseAdmin
          .from(
            "analytics_presence"
          )
          .upsert(
            {
              session_hash:
                sessionHash,

              visitor_hash:
                visitorHash,

              started_at:
                new Date().toISOString(),

              last_seen:
                new Date().toISOString(),

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
                geo.countryCode,

              country_name:
                geo.countryName,

              city:
                geo.city,

              region:
                geo.region,

              timezone:
                text(
                  body.timezone,
                  100
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

              is_bot:
                isBot,
            },
            {
              onConflict:
                "session_hash",
            }
          );
      }
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