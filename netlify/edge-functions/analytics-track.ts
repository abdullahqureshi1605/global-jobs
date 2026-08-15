/*
 * Horizon Jobs - Analytics Collector
 *
 * Netlify Edge Function
 * Endpoint:
 *   /api/analytics/track
 *
 * This file intentionally avoids importing
 * @netlify/edge-functions so the project can
 * type-check without requiring that package.
 */

declare const Netlify: {
  env: {
    get(
      name: string
    ): string | undefined;
  };
};

const ALLOWED_EVENTS =
  new Set<string>([
    "page_view",
    "page_exit",
    "page_performance",
    "cta_click",
    "job_apply_click",
    "report_job_click",
  ]);

function limit(
  value: unknown,
  max: number
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(0, max);
}

function numberOrNull(
  value: unknown
): number | null {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  return null;
}

function getHeader(
  request: Request,
  name: string
): string {
  return (
    request.headers.get(
      name
    ) || ""
  );
}

async function sha256(
  value: string
): Promise<string> {
  const encoded =
    new TextEncoder().encode(
      value
    );

  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      encoded
    );

  return Array.from(
    new Uint8Array(
      digest
    )
  )
    .map(
      (byte) =>
        byte
          .toString(16)
          .padStart(2, "0")
    )
    .join("");
}

function jsonResponse(
  body: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "content-type":
          "application/json; charset=utf-8",
        "cache-control":
          "no-store",
      },
    }
  );
}

function isAllowedOrigin(
  request: Request
): boolean {
  const origin =
    getHeader(
      request,
      "origin"
    );

  /*
   * sendBeacon may omit Origin in some browser cases.
   * When there is no Origin header, we allow the request
   * and still validate the event payload below.
   */
  if (!origin) {
    return true;
  }

  try {
    const originUrl =
      new URL(origin);

    const requestUrl =
      new URL(
        request.url
      );

    if (
      originUrl.origin ===
      requestUrl.origin
    ) {
      return true;
    }

    const configuredSite =
      Netlify.env.get(
        "NEXT_PUBLIC_SITE_URL"
      );

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

function getCountryFromNetlify(
  request: Request
): {
  code: string | null;
  name: string | null;
} {
  /*
   * Netlify can provide geo information through
   * request headers on deployed infrastructure.
   *
   * These headers are intentionally used only to
   * derive the country. The visitor IP is never
   * written to the analytics database.
   */

  const code =
    limit(
      getHeader(
        request,
        "x-country"
      ) ||
        getHeader(
          request,
          "x-nf-country"
        ),
      8
    ).toUpperCase();

  const name =
    limit(
      getHeader(
        request,
        "x-country-name"
      ) ||
        getHeader(
          request,
          "x-nf-country-name"
        ),
      80
    );

  return {
    code:
      code || null,
    name:
      name || null,
  };
}

function getReferrerHost(
  value: unknown
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  try {
    const referrer =
      new URL(value);

    return (
      referrer.hostname
        .trim()
        .slice(0, 200) ||
      null
    );
  } catch {
    return null;
  }
}

export default async function (
  request: Request
) {
  /*
   * Only POST is allowed.
   */
  if (
    request.method !==
    "POST"
  ) {
    return jsonResponse(
      {
        error:
          "Method not allowed",
      },
      405
    );
  }

  /*
   * Only Horizon Jobs requests are allowed.
   */
  if (
    !isAllowedOrigin(
      request
    )
  ) {
    return jsonResponse(
      {
        error:
          "Origin not allowed",
      },
      403
    );
  }

  try {
    const body =
      await request.json();

    /*
     * Required server environment variables.
     */
    const supabaseUrl =
      Netlify.env.get(
        "NEXT_PUBLIC_SUPABASE_URL"
      );

    const supabaseSecretKey =
      Netlify.env.get(
        "SUPABASE_SECRET_KEY"
      );

    const analyticsSalt =
      Netlify.env.get(
        "ANALYTICS_HASH_SALT"
      );

    if (
      !supabaseUrl ||
      !supabaseSecretKey ||
      !analyticsSalt
    ) {
      console.error(
        "Analytics environment variables are missing."
      );

      return jsonResponse(
        {
          error:
            "Analytics is not configured.",
        },
        500
      );
    }

    /*
     * Event validation.
     */
    const eventName =
      limit(
        body.event_name,
        40
      );

    if (
      !eventName ||
      !ALLOWED_EVENTS.has(
        eventName
      )
    ) {
      return jsonResponse(
        {
          error:
            "Invalid analytics event.",
        },
        400
      );
    }

    /*
     * Raw browser identifiers never go
     * into Supabase.
     */
    const visitorId =
      limit(
        body.visitor_id,
        120
      );

    const sessionId =
      limit(
        body.session_id,
        120
      );

    const visitorHash =
      visitorId
        ? await sha256(
            `${analyticsSalt}:visitor:${visitorId}`
          )
        : null;

    const sessionHash =
      sessionId
        ? await sha256(
            `${analyticsSalt}:session:${sessionId}`
          )
        : null;

    /*
     * Geography.
     */
    const geo =
      getCountryFromNetlify(
        request
      );

    /*
     * Marketing attribution.
     */
    const utmSource =
      limit(
        body.utm_source,
        100
      );

    const utmMedium =
      limit(
        body.utm_medium,
        100
      );

    const utmCampaign =
      limit(
        body.utm_campaign,
        150
      );

    /*
     * Page information.
     */
    const pagePath =
      limit(
        body.page_path,
        500
      );

    const pageTitle =
      limit(
        body.page_title,
        250
      );

    /*
     * Device information.
     */
    const deviceType =
      limit(
        body.device_type,
        30
      );

    const browser =
      limit(
        body.browser,
        50
      );

    const operatingSystem =
      limit(
        body.operating_system,
        50
      );

    /*
     * Build the exact database row.
     */
    const row = {
      event_name:
        eventName,

      visitor_hash:
        visitorHash,

      session_hash:
        sessionHash,

      page_path:
        pagePath || null,

      page_title:
        pageTitle || null,

      country_code:
        geo.code,

      country_name:
        geo.name,

      referrer_host:
        getReferrerHost(
          body.referrer_host
        ),

      utm_source:
        utmSource || null,

      utm_medium:
        utmMedium || null,

      utm_campaign:
        utmCampaign || null,

      has_gclid:
        Boolean(
          body.has_gclid
        ),

      has_fbclid:
        Boolean(
          body.has_fbclid
        ),

      device_type:
        deviceType || null,

      browser:
        browser || null,

      operating_system:
        operatingSystem ||
        null,

      event_label:
        limit(
          body.event_label,
          120
        ) || null,

      event_target:
        limit(
          body.event_target,
          500
        ) || null,

      is_landing:
        Boolean(
          body.is_landing
        ),

      duration_ms:
        numberOrNull(
          body.duration_ms
        ),

      scroll_depth:
        numberOrNull(
          body.scroll_depth
        ),

      load_ms:
        numberOrNull(
          body.load_ms
        ),

      fcp_ms:
        numberOrNull(
          body.fcp_ms
        ),

      lcp_ms:
        numberOrNull(
          body.lcp_ms
        ),

      cls:
        numberOrNull(
          body.cls
        ),

      screen_width:
        numberOrNull(
          body.screen_width
        ),

      screen_height:
        numberOrNull(
          body.screen_height
        ),

      metadata: {},
    };

    /*
     * Insert directly into Supabase REST API.
     *
     * The secret key exists only inside
     * the server-side Edge Function.
     */
    const response =
      await fetch(
        `${supabaseUrl}/rest/v1/analytics_events`,
        {
          method:
            "POST",

          headers: {
            apikey:
              supabaseSecretKey,

            Authorization:
              `Bearer ${supabaseSecretKey}`,

            "Content-Type":
              "application/json",

            Prefer:
              "return=minimal",
          },

          body:
            JSON.stringify(
              row
            ),
        }
      );

    if (
      !response.ok
    ) {
      const responseText =
        await response.text();

      console.error(
        "Supabase analytics insert failed:",
        response.status,
        responseText
      );

      return jsonResponse(
        {
          error:
            "Analytics storage failed.",
        },
        500
      );
    }

    /*
     * sendBeacon does not need a response body.
     */
    return new Response(
      null,
      {
        status: 204,
        headers: {
          "cache-control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Analytics tracker error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Invalid analytics request.",
      },
      400
    );
  }
}

export const config = {
  path: "/api/analytics/track",
};