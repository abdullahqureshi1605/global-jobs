import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    const { data, error } =
      await getSupabaseAdmin()
        .from("job_alerts")
        .select(
          "id,name,email,countries,cities,categories,frequency,active,created_at"
        )
        .eq(
          "user_id",
          session.user.id
        )
        .eq("active", true)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      alerts: data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load job alerts.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      String(
        body.name ||
          session.user.name ||
          ""
      ).trim();

    const email =
      String(
        body.email ||
          session.user.email ||
          ""
      ).trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required.",
        },
        { status: 400 }
      );
    }

    const countries = Array.isArray(
      body.countries
    )
      ? body.countries
          .map((x: unknown) =>
            String(x).trim()
          )
          .filter(Boolean)
      : [];

    const cities = Array.isArray(
      body.cities
    )
      ? body.cities
          .map((x: unknown) =>
            String(x).trim()
          )
          .filter(Boolean)
      : [];

    const categories = Array.isArray(
      body.categories
    )
      ? body.categories
          .map((x: unknown) =>
            String(x).trim()
          )
          .filter(Boolean)
      : [];

    const frequency =
      body.frequency === "weekly"
        ? "weekly"
        : "daily";

    const { data, error } =
      await getSupabaseAdmin()
        .from("job_alerts")
        .insert({
          user_id:
            session.user.id,
          name: name || null,
          email,
          countries,
          cities,
          categories,
          frequency,
          active: true,
        })
        .select(
          "id,name,email,countries,cities,categories,frequency,active,created_at"
        )
        .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        alert: data,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create job alert.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    const { error } =
      await getSupabaseAdmin()
        .from("job_alerts")
        .update({
          active: false,
        })
        .eq(
          "user_id",
          session.user.id
        )
        .eq("active", true);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to remove job alerts.",
      },
      { status: 500 }
    );
  }
}
