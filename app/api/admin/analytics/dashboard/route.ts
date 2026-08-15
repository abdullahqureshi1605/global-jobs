import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

function parseDate(
  value: string | null
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      `${value}T00:00:00Z`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function formatDate(
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

    const rawStart =
      parseDate(
        url.searchParams.get(
          "start"
        )
      );

    const rawEnd =
      parseDate(
        url.searchParams.get(
          "end"
        )
      );

    const today =
      new Date();

    const end =
      rawEnd ||
      new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate()
        )
      );

    const start =
      rawStart ||
      new Date(
        end.getTime() -
          29 *
            24 *
            60 *
            60 *
            1000
      );

    const maxStart =
      new Date(
        end.getTime() -
          364 *
            24 *
            60 *
            60 *
            1000
      );

    if (
      start < maxStart
    ) {
      start.setTime(
        maxStart.getTime()
      );
    }

    if (
      start > end
    ) {
      return NextResponse.json(
        {
          error:
            "Start date cannot be after end date.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin.rpc(
        "analytics_dashboard",
        {
          p_start_date:
            formatDate(start),

          p_end_date:
            formatDate(end),
        }
      );

    if (error) {
      console.error(
        "Analytics dashboard query failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to load analytics.",
          details:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      start:
        formatDate(start),

      end:
        formatDate(end),

      data:
        data || {
          summary: {},
          daily: [],
          countries: [],
          sources: [],
          pages: [],
          landingPages: [],
          events: [],
          cta: [],
          devices: [],
          browsers: [],
          operatingSystems: [],
        },
    });
  } catch (error) {
    console.error(
      "Analytics API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected analytics error.",
      },
      {
        status: 500,
      }
    );
  }
}