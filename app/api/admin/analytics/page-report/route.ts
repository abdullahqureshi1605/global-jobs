import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_HOSTS = new Set([
  "global-jobz.netlify.app",
]);

function cleanPath(
  value: string
) {
  return value
    .split("?")[0]
    .split("#")[0]
    .trim()
    .replace(/\/+$/, "") || "/";
}

function countBy(
  values: string[]
) {
  const map =
    new Map<string, number>();

  for (const value of values) {
    const key =
      value || "Unknown";

    map.set(
      key,
      (map.get(key) ?? 0) + 1
    );
  }

  return Array.from(
    map.entries()
  )
    .map(
      ([name, count]) => ({
        name,
        count,
      })
    )
    .sort(
      (a, b) =>
        b.count - a.count
    );
}

function avg(
  values: Array<number | null>
) {
  const valid =
    values.filter(
      (
        value
      ): value is number =>
        typeof value === "number" &&
        Number.isFinite(value)
    );

  if (!valid.length) {
    return 0;
  }

  return (
    valid.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / valid.length
  );
}

function parsePageUrl(
  rawUrl: string
) {
  const parsed =
    new URL(rawUrl);

  if (
    parsed.protocol !==
      "https:" &&
    parsed.protocol !==
      "http:"
  ) {
    throw new Error(
      "Only HTTP and HTTPS URLs are allowed."
    );
  }

  const configuredSite =
    process.env.NEXT_PUBLIC_SITE_URL;

  const configuredHost =
    configuredSite
      ? new URL(
          configuredSite
        ).hostname
      : null;

  const allowed =
    new Set(
      [
        ...ALLOWED_HOSTS,
        configuredHost,
      ].filter(
        (
          value
        ): value is string =>
          Boolean(value)
      )
    );

  if (
    !allowed.has(
      parsed.hostname
    )
  ) {
    throw new Error(
      "Only Horizon Jobs pages can be analyzed."
    );
  }

  return parsed;
}

async function analyzeHtml(
  url: string
) {
  const started =
    performance.now();

  const response =
    await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "User-Agent":
          "Horizon-Jobs-Page-Analyzer/1.0",
        Accept:
          "text/html,application/xhtml+xml",
      },
      signal:
        AbortSignal.timeout(15000),
    });

  const responseTimeMs =
    Math.round(
      performance.now() -
        started
    );

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    !contentType.includes(
      "text/html"
    )
  ) {
    throw new Error(
      "The selected URL did not return an HTML page."
    );
  }

  const html =
    await response.text();

  const title =
    html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i
    )?.[1]
      ?.trim() || "";

  const description =
    html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
    )?.[1]
      ?.trim() || "";

  const canonical =
    html.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i
    )?.[1]
      ?.trim() || "";

  const language =
    html.match(
      /<html[^>]+lang=["']([^"']+)["']/i
    )?.[1]
      ?.trim() || "";

  const viewport =
    html.match(
      /<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i
    )?.[1]
      ?.trim() || "";

  const robots =
    html.match(
      /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i
    )?.[1]
      ?.trim() || "";

  const bytes =
    new TextEncoder().encode(
      html
    ).length;

  return {
    status:
      response.status,

    statusText:
      response.statusText,

    responseTimeMs,

    pageSizeBytes:
      bytes,

    contentType,

    title,

    description,

    canonical,

    language,

    viewport,

    robots,

    h1:
      (html.match(
        /<h1\b/gi
      ) || []).length,

    h2:
      (html.match(
        /<h2\b/gi
      ) || []).length,

    h3:
      (html.match(
        /<h3\b/gi
      ) || []).length,

    links:
      (html.match(
        /<a\b/gi
      ) || []).length,

    images:
      (html.match(
        /<img\b/gi
      ) || []).length,

    scripts:
      (html.match(
        /<script\b/gi
      ) || []).length,

    stylesheets:
      (
        html.match(
          /<link[^>]+rel=["']stylesheet["']/gi
        ) || []
      ).length,

    forms:
      (html.match(
        /<form\b/gi
      ) || []).length,
  };
}

export async function GET(
  request: Request
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const requestUrl =
      new URL(request.url);

    const rawPage =
      requestUrl.searchParams.get(
        "url"
      );

    if (!rawPage) {
      return NextResponse.json(
        {
          error:
            "Page URL is required.",
        },
        {
          status: 400,
        }
      );
    }

    const pageUrl =
      parsePageUrl(
        rawPage.trim()
      );

    const path =
      cleanPath(
        pageUrl.pathname
      );

    const [
      eventsResult,
      pageAnalysis,
    ] = await Promise.all([
      supabaseAdmin
        .from(
          "analytics_events"
        )
        .select(
          `
          occurred_at,
          event_name,
          visitor_hash,
          session_hash,
          page_path,
          country_code,
          country_name,
          device_type,
          browser,
          operating_system,
          referrer_host,
          utm_source,
          utm_medium,
          utm_campaign,
          has_gclid,
          has_fbclid,
          event_label,
          event_target,
          duration_ms,
          scroll_depth,
          load_ms,
          fcp_ms,
          lcp_ms,
          cls
          `
        )
        .eq(
          "page_path",
          path
        )
        .order(
          "occurred_at",
          {
            ascending:
              false,
          }
        )
        .limit(50000),

      analyzeHtml(
        pageUrl.toString()
      ),
    ]);

    if (
      eventsResult.error
    ) {
      throw new Error(
        eventsResult.error.message
      );
    }

    const events =
      eventsResult.data ??
      [];

    const pageViews =
      events.filter(
        (event) =>
          event.event_name ===
          "page_view"
      );

    const exits =
      events.filter(
        (event) =>
          event.event_name ===
          "page_exit"
      );

    const performanceEvents =
      events.filter(
        (event) =>
          event.event_name ===
          "page_performance"
      );

    const uniqueVisitors =
      new Set(
        pageViews
          .map(
            (event) =>
              event.visitor_hash
          )
          .filter(Boolean)
      ).size;

    const sessions =
      new Set(
        pageViews
          .map(
            (event) =>
              event.session_hash
          )
          .filter(Boolean)
      ).size;

    const ctaClicks =
      events.filter(
        (event) =>
          event.event_name ===
          "cta_click"
      );

    const applyClicks =
      events.filter(
        (event) =>
          event.event_name ===
          "job_apply_click"
      );

    const reportClicks =
      events.filter(
        (event) =>
          event.event_name ===
          "report_job_click"
      );

    const paidSessions =
      new Set(
        pageViews
          .filter(
            (event) =>
              event.has_gclid ||
              event.has_fbclid ||
              [
                "cpc",
                "ppc",
                "paid",
                "paid-search",
                "paid-social",
                "paid_social",
              ].includes(
                (
                  event.utm_medium ||
                  ""
                ).toLowerCase()
              )
          )
          .map(
            (event) =>
              event.session_hash
          )
          .filter(Boolean)
      ).size;

    const countries =
      countBy(
        pageViews.map(
          (event) =>
            event.country_name ||
            event.country_code ||
            "Unknown"
        )
      );

    const sources =
      countBy(
        pageViews.map(
          (event) =>
            event.utm_source ||
            event.referrer_host ||
            "Direct"
        )
      );

    const devices =
      countBy(
        pageViews.map(
          (event) =>
            event.device_type ||
            "Unknown"
        )
      );

    const browsers =
      countBy(
        pageViews.map(
          (event) =>
            event.browser ||
            "Unknown"
        )
      );

    const operatingSystems =
      countBy(
        pageViews.map(
          (event) =>
            event.operating_system ||
            "Unknown"
        )
      );

    const ctaData =
      countBy(
        ctaClicks.map(
          (event) =>
            event.event_label ||
            "Unnamed CTA"
        )
      );

    const avgTimeOnPage =
      avg(
        exits.map(
          (event) =>
            event.duration_ms
        )
      );

    const avgScrollDepth =
      avg(
        exits.map(
          (event) =>
            event.scroll_depth
        )
      );

    const avgLoad =
      avg(
        performanceEvents.map(
          (event) =>
            event.load_ms
        )
      );

    const avgFcp =
      avg(
        performanceEvents.map(
          (event) =>
            event.fcp_ms
        )
      );

    const avgLcp =
      avg(
        performanceEvents.map(
          (event) =>
            event.lcp_ms
        )
      );

    const avgCls =
      avg(
        performanceEvents.map(
          (event) =>
            event.cls
        )
      );

    return NextResponse.json({
      page: {
        url:
          pageUrl.toString(),

        path,

        analysis:
          pageAnalysis,
      },

      traffic: {
        pageviews:
          pageViews.length,

        uniqueVisitors,

        sessions,

        pagesPerSession:
          sessions
            ? pageViews.length /
              sessions
            : 0,

        paidSessions,

        ctaClicks:
          ctaClicks.length,

        applyClicks:
          applyClicks.length,

        reportClicks:
          reportClicks.length,

        avgTimeOnPage,

        avgScrollDepth,

        avgLoad,

        avgFcp,

        avgLcp,

        avgCls,
      },

      countries,

      sources,

      devices,

      browsers,

      operatingSystems,

      cta: ctaData,
    });
  } catch (error) {
    console.error(
      "Page analytics report failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze page.",
      },
      {
        status: 500,
      }
    );
  }
}