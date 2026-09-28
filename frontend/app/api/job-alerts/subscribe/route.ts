import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

async function currentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return {
    id: String(session.user.id || ""),
    email: String(session.user.email || "").trim().toLowerCase(),
    name: String(session.user.name || ""),
  };
}

function splitList(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export async function GET() {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from("job_alert_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      subscriptions: data || [],
    });
  } catch (error) {
    console.error(
      "Job alert GET:",
      error
    );

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
  request: NextRequest
) {
  try {
    const user = await currentUser();
    const body = await request.json();

    const email =
      String(body.email || user?.email || "")
        .trim()
        .toLowerCase();

    if (!user?.id || !email) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const countries = splitList(body.countries);
    const cities = splitList(body.cities);
    const categories = splitList(body.categories);

    const frequency =
      body.frequency === "weekly"
        ? "weekly"
        : "daily";

    const admin = getSupabaseAdmin();

    const { data: existing } = await admin
      .from("job_alert_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("email", email)
      .eq("active", true)
      .limit(1);

    if (existing?.length) {
      return NextResponse.json(
        {
          error:
            "You already have an active job alert for this email.",
        },
        { status: 409 }
      );
    }

    const { data, error } = await admin
      .from("job_alert_subscriptions")
      .insert({
        email,
        name:
          String(body.name || user.name || "").trim() ||
          null,
        countries,
        cities,
        categories,
        frequency,
        remote_only: false,
        active: true,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        success: true,
        subscription: data,
        message: "Job alert created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Job alert POST:",
      error
    );

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
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const { error } = await getSupabaseAdmin()
      .from("job_alert_subscriptions")
      .update({
        active: false,
      })
      .eq("user_id", user.id)
      .eq("active", true);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Job alerts removed.",
    });
  } catch (error) {
    console.error(
      "Job alert DELETE:",
      error
    );

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
