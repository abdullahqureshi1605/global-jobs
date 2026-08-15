import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

function parseDate(
  value: string | null,
  fallback: Date
) {
  if (!value) {
    return fallback;
  }

  const parsed =
    new Date(
      `${value}T00:00:00.000Z`
    );

  return Number.isNaN(
    parsed.getTime()
  )
    ? fallback
    : parsed;
}

function dateString(
  date: Date
) {
  return date
    .toISOString()
    .slice(0, 10);
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

    const url =
      new URL(
        request.url
      );

    const today =
      new Date();

    const endDefault =
      new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate()
        )
      );

    const startDefault =
      new Date(
        endDefault.getTime() -
          29 *
            24 *
            60 *
            60 *
            1000
      );

    const start =
      parseDate(
        url.searchParams.get(
          "start"
        ),
        startDefault
      );

    const end =
      parseDate(
        url.searchParams.get(
          "end"
        ),
        endDefault
      );

    const startIso =
      start.toISOString();

    const endExclusive =
      new Date(
        end.getTime() +
          24 *
            60 *
            60 *
            1000
      ).toISOString();

    const [
      eventsResult,
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
          referrer_host,
          utm_source,
          utm_medium,
          utm_campaign,
          has_gclid,
          has_fbclid,
          device_type,
          browser,
          operating_system,
          event_label,
          event_target,
          is_landing,
          duration_ms,
          scroll_depth,
          load_ms,
          fcp_ms,
          lcp_ms,
          cls
          `
        )
        .gte(
          "occurred_at",
          startIso
        )
        .lt(
          "occurred_at",
          endExclusive
        )
        .order(
          "occurred_at",
          {
            ascending:
              true,
          }
        )
        .limit(50000),
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

    const sessionViews =
      new Map<
        string,
        number
      >();

    for (const event of
      pageViews) {
      if (
        !event.session_hash
      ) {
        continue;
      }

      sessionViews.set(
        event.session_hash,
        (
          sessionViews.get(
            event.session_hash
          ) ?? 0
        ) + 1
      );
    }

    const bouncedSessions =
      Array.from(
        sessionViews.values()
      ).filter(
        (views) =>
          views === 1
      ).length;

    const bounceRate =
      sessions
        ? (bouncedSessions /
            sessions) *
          100
        : 0;

    const ctaClicks =
      events.filter(
        (event) =>
          event.event_name ===
          "cta_click"
      ).length;

    const applyClicks =
      events.filter(
        (event) =>
          event.event_name ===
          "job_apply_click"
      ).length;

    const reportClicks =
      events.filter(
        (event) =>
          event.event_name ===
          "report_job_click"
      ).length;

    const jobViews =
      pageViews.filter(
        (event) =>
          event.page_path?.startsWith(
            "/jobs/"
          )
      ).length;

    const resourceViews =
      pageViews.filter(
        (event) =>
          event.page_path?.startsWith(
            "/career-resources/"
          )
      ).length;

    const paidSessions =
      new Set(
        events
          .filter(
            (event) =>
              Boolean(
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
          )
          .map(
            (event) =>
              event.session_hash
          )
          .filter(Boolean)
      ).size;

    function grouped(
      keyFn: (
        event: (typeof events)[number]
      ) => string
    ) {
      const map =
        new Map<
          string,
          {
            count: number;
            visitors: Set<string>;
          }
        >();

      for (const event of
        events) {
        const key =
          keyFn(event) ||
          "Unknown";

        const current =
          map.get(key) ?? {
            count: 0,
            visitors:
              new Set<string>(),
          };

        current.count++;

        if (
          event.visitor_hash
        ) {
          current.visitors.add(
            event.visitor_hash
          );
        }

        map.set(
          key,
          current
        );
      }

      return map;
    }

    const countryGroups =
      new Map<
        string,
        {
          code: string;
          views: number;
          visitors: Set<string>;
        }
      >();

    for (const event of
      pageViews) {
      const name =
        event.country_name ||
        event.country_code ||
        "Unknown";

      const current =
        countryGroups.get(
          name
        ) ?? {
          code:
            event.country_code ||
            "",
          views: 0,
          visitors:
            new Set<string>(),
        };

      current.views++;

      if (
        event.visitor_hash
      ) {
        current.visitors.add(
          event.visitor_hash
        );
      }

      countryGroups.set(
        name,
        current
      );
    }

    const pagesGroup =
      grouped(
        (event) =>
          event.page_path ||
          "/"
      );

    const sources =
      new Map<
        string,
        {
          medium: string;
          campaign: string;
          sessions: Set<string>;
          views: number;
        }
      >();

    for (const event of
      pageViews) {
      const source =
        event.utm_source ||
        event.referrer_host ||
        "Direct";

      const medium =
        event.utm_medium ||
        "referral";

      const campaign =
        event.utm_campaign ||
        "";

      const key =
        `${source}|${medium}|${campaign}`;

      const current =
        sources.get(
          key
        ) ?? {
          medium,
          campaign,
          sessions:
            new Set<string>(),
          views: 0,
        };

      current.views++;

      if (
        event.session_hash
      ) {
        current.sessions.add(
          event.session_hash
        );
      }

      sources.set(
        key,
        current
      );
    }

    const dailyMap =
      new Map<
        string,
        {
          views: number;
          visitors: Set<string>;
          sessions: Set<string>;
        }
      >();

    for (const event of
      pageViews) {
      const day =
        event.occurred_at.slice(
          0,
          10
        );

      const current =
        dailyMap.get(
          day
        ) ?? {
          views: 0,
          visitors:
            new Set<string>(),
          sessions:
            new Set<string>(),
        };

      current.views++;

      if (
        event.visitor_hash
      ) {
        current.visitors.add(
          event.visitor_hash
        );
      }

      if (
        event.session_hash
      ) {
        current.sessions.add(
          event.session_hash
        );
      }

      dailyMap.set(
        day,
        current
      );
    }

    const ctaGroups =
      new Map<
        string,
        {
          target: string;
          count: number;
        }
      >();

    for (const event of
      events.filter(
        (item) =>
          item.event_name ===
          "cta_click"
      )) {
      const label =
        event.event_label ||
        "Unnamed CTA";

      const target =
        event.event_target ||
        "";

      const key =
        `${label}|${target}`;

      const current =
        ctaGroups.get(
          key
        ) ?? {
          target,
          count: 0,
        };

      current.count++;

      ctaGroups.set(
        key,
        current
      );
    }

    const deviceGroups =
      grouped(
        (event) =>
          event.device_type ||
          "Unknown"
      );

    const browserGroups =
      grouped(
        (event) =>
          event.browser ||
          "Unknown"
      );

    const osGroups =
      grouped(
        (event) =>
          event.operating_system ||
          "Unknown"
      );

    const performanceEvents =
      events.filter(
        (event) =>
          event.event_name ===
          "page_performance"
      );

    const avg = (
      values: Array<
        number | null
      >
    ) => {
      const valid =
        values.filter(
          (
            value
          ): value is number =>
            typeof value ===
              "number" &&
            Number.isFinite(
              value
            )
        );

      if (
        valid.length ===
        0
      ) {
        return 0;
      }

      return (
        valid.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        ) /
        valid.length
      );
    };

    const daily =
      Array.from(
        dailyMap.entries()
      )
        .map(
          ([
            date,
            value,
          ]) => ({
            date,
            pageviews:
              value.views,
            uniqueVisitors:
              value.visitors
                .size,
            sessions:
              value.sessions
                .size,
          })
        )
        .sort(
          (a, b) =>
            a.date.localeCompare(
              b.date
            )
        );

    const countries =
      Array.from(
        countryGroups.entries()
      )
        .map(
          ([
            country,
            value,
          ]) => ({
            country,
            code:
              value.code,
            pageviews:
              value.views,
            uniqueVisitors:
              value.visitors
                .size,
          })
        )
        .sort(
          (a, b) =>
            b.pageviews -
            a.pageviews
        )
        .slice(0, 25);

    const sourceData =
      Array.from(
        sources.entries()
      )
        .map(
          ([
            key,
            value,
          ]) => {
            const [
              source,
            ] =
              key.split(
                "|"
              );

            return {
              source,
              medium:
                value.medium,
              campaign:
                value.campaign,
              pageviews:
                value.views,
              sessions:
                value.sessions
                  .size,
            };
          }
        )
        .sort(
          (a, b) =>
            b.sessions -
            a.sessions
        )
        .slice(0, 25);

    const pages =
      Array.from(
        pagesGroup.entries()
      )
        .map(
          ([
            path,
            value,
          ]) => ({
            path,
            views:
              value.count,
            uniqueVisitors:
              value.visitors
                .size,
          })
        )
        .sort(
          (a, b) =>
            b.views -
            a.views
        )
        .slice(0, 25);

    const landingCounts =
      new Map<
        string,
        number
      >();

    for (const event of
      pageViews.filter(
        (item) =>
          item.is_landing
      )) {
      const path =
        event.page_path ||
        "/";

      landingCounts.set(
        path,
        (
          landingCounts.get(
            path
          ) ?? 0
        ) + 1
      );
    }

    const landingPages =
      Array.from(
        landingCounts.entries()
      )
        .map(
          ([
            path,
            visits,
          ]) => ({
            path,
            visits,
          })
        )
        .sort(
          (a, b) =>
            b.visits -
            a.visits
        )
        .slice(0, 25);

    const eventsData =
      Array.from(
        grouped(
          (event) =>
            event.event_name
        ).entries()
      )
        .map(
          ([
            event,
            value,
          ]) => ({
            event,
            count:
              value.count,
          })
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        );

    const ctaData =
      Array.from(
        ctaGroups.entries()
      )
        .map(
          ([
            key,
            value,
          ]) => {
            const index =
              key.indexOf(
                "|"
              );

            const label =
              index >= 0
                ? key.slice(
                    0,
                    index
                  )
                : key;

            return {
              label,
              target:
                value.target,
              count:
                value.count,
            };
          }
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        )
        .slice(0, 25);

    const devices =
      Array.from(
        deviceGroups.entries()
      )
        .map(
          ([
            device,
            value,
          ]) => ({
            device,
            count:
              value.visitors
                .size,
          })
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        );

    const browsers =
      Array.from(
        browserGroups.entries()
      )
        .map(
          ([
            browser,
            value,
          ]) => ({
            browser,
            count:
              value.visitors
                .size,
          })
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        );

    const operatingSystems =
      Array.from(
        osGroups.entries()
      )
        .map(
          ([
            os,
            value,
          ]) => ({
            os,
            count:
              value.visitors
                .size,
          })
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        );

    return NextResponse.json({
      start:
        dateString(start),

      end:
        dateString(end),

      data: {
        summary: {
          pageviews:
            pageViews.length,

          uniqueVisitors,

          sessions,

          pagesPerSession:
            sessions
              ? pageViews.length /
                sessions
              : 0,

          bounceRate,

          ctaClicks,

          applyClicks,

          reportClicks,

          jobViews,

          resourceViews,

          paidSessions,

          avgLoadMs:
            avg(
              performanceEvents.map(
                (
                  event
                ) =>
                  event.load_ms
              )
            ),

          avgFcpMs:
            avg(
              performanceEvents.map(
                (
                  event
                ) =>
                  event.fcp_ms
              )
            ),

          avgLcpMs:
            avg(
              performanceEvents.map(
                (
                  event
                ) =>
                  event.lcp_ms
              )
            ),

          avgCls:
            avg(
              performanceEvents.map(
                (
                  event
                ) =>
                  event.cls
              )
            ),

          avgTimeOnPage:
            avg(
              events
                .filter(
                  (
                    event
                  ) =>
                    event.event_name ===
                    "page_exit"
                )
                .map(
                  (
                    event
                  ) =>
                    event.duration_ms
                )
            ),

          avgScrollDepth:
            avg(
              events
                .filter(
                  (
                    event
                  ) =>
                    event.event_name ===
                    "page_exit"
                )
                .map(
                  (
                    event
                  ) =>
                    event.scroll_depth
                )
            ),
        },

        daily,

        countries,

        sources:
          sourceData,

        pages,

        landingPages,

        events:
          eventsData,

        cta:
          ctaData,

        devices,

        browsers,

        operatingSystems,
      },
    });
  } catch (error) {
    console.error(
      "Analytics dashboard failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load analytics.",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}