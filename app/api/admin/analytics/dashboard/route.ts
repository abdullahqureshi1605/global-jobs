import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

    const liveOnly =
      url.searchParams.get(
        "live"
      ) === "true";

    if (liveOnly) {
      const cutoff =
        new Date(
          Date.now() -
            60 * 1000
        ).toISOString();

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "analytics_presence"
          )
          .select(
            `
            session_hash,
            visitor_hash,
            started_at,
            last_seen,
            page_path,
            page_title,
            country_code,
            country_name,
            city,
            region,
            timezone,
            device_type,
            browser,
            operating_system,
            utm_source,
            utm_medium,
            utm_campaign,
            has_gclid,
            has_fbclid,
            is_bot
            `
          )
          .gte(
            "last_seen",
            cutoff
          )
          .order(
            "last_seen",
            {
              ascending:
                false,
            }
          )
          .limit(200);

      if (error) {
        return NextResponse.json(
          {
            error:
              error.message,
          },
          {
            status: 500,
          }
        );
      }

      const visitors =
        (data ?? []).map(
          (visitor) => ({
            ...visitor,

            displayLocation:
              [
                visitor.city,
                visitor.region,
                visitor.country_name ||
                  visitor.country_code,
              ]
                .filter(Boolean)
                .join(
                  ", "
                ),
          })
        );

      return NextResponse.json({
        count:
          visitors.length,

        visitors,
      });
    }

    const today =
      new Date();

    const end =
      new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate()
        )
      );

    const start =
      new Date(
        end.getTime() -
          29 *
            24 *
            60 *
            60 *
            1000
      );

    const {
      data,
      error,
    } =
      await supabaseAdmin
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
          utm_source,
          utm_medium,
          utm_campaign,
          has_gclid,
          has_fbclid,
          event_label,
          event_target
          `
        )
        .gte(
          "occurred_at",
          start.toISOString()
        )
        .lt(
          "occurred_at",
          new Date(
            end.getTime() +
              24 *
                60 *
                60 *
                1000
          ).toISOString()
        )
        .eq(
          "event_name",
          "page_view"
        )
        .order(
          "occurred_at",
          {
            ascending:
              false,
          }
        )
        .limit(50000);

    if (error) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    const events =
      data ?? [];

    const visitors =
      new Set(
        events
          .map(
            (item) =>
              item.visitor_hash
          )
          .filter(Boolean)
      ).size;

    const sessions =
      new Set(
        events
          .map(
            (item) =>
              item.session_hash
          )
          .filter(Boolean)
      ).size;

    const countries =
      new Map<
        string,
        number
      >();

    const pages =
      new Map<
        string,
        number
      >();

    const sources =
      new Map<
        string,
        number
      >();

    const devices =
      new Map<
        string,
        number
      >();

    for (const event of
      events) {
      const country =
        event.country_name ||
        event.country_code ||
        "Unknown";

      countries.set(
        country,
        (
          countries.get(
            country
          ) ?? 0
        ) + 1
      );

      const page =
        event.page_path ||
        "/";

      pages.set(
        page,
        (
          pages.get(
            page
          ) ?? 0
        ) + 1
      );

      const source =
        event.utm_source ||
        "Direct";

      sources.set(
        source,
        (
          sources.get(
            source
          ) ?? 0
        ) + 1
      );

      const device =
        event.device_type ||
        "Unknown";

      devices.set(
        device,
        (
          devices.get(
            device
          ) ?? 0
        ) + 1
      );
    }

    return NextResponse.json({
      visitors,
      sessions,

      pageviews:
        events.length,

      countries:
        Array.from(
          countries.entries()
        )
          .map(
            ([
              country,
              count,
            ]) => ({
              country,
              count,
            })
          )
          .sort(
            (a, b) =>
              b.count -
              a.count
          ),

      pages:
        Array.from(
          pages.entries()
        )
          .map(
            ([
              page,
              count,
            ]) => ({
              page,
              count,
            })
          )
          .sort(
            (a, b) =>
              b.count -
              a.count
          )
          .slice(0, 25),

      sources:
        Array.from(
          sources.entries()
        )
          .map(
            ([
              source,
              count,
            ]) => ({
              source,
              count,
            })
          )
          .sort(
            (a, b) =>
              b.count -
              a.count
          ),

      devices:
        Array.from(
          devices.entries()
        )
          .map(
            ([
              device,
              count,
            ]) => ({
              device,
              count,
            })
          )
          .sort(
            (a, b) =>
              b.count -
              a.count
          ),
    });
  } catch (error) {
    console.error(
      "Analytics dashboard error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load analytics.",
      },
      {
        status: 500,
      }
    );
  }
}