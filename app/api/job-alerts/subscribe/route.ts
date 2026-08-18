import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, countries, cities, categories, frequency, userId } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const { data: existing } = await supabaseAdmin
      .from("job_alert_subscriptions")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 400 }
      );
    }

    // Create subscription
    const { data, error } = await supabaseAdmin
      .from("job_alert_subscriptions")
      .insert({
        email,
        name: name || null,
        countries: countries || [],
        cities: cities || [],
        categories: categories || [],
        frequency: frequency || "daily",
        remote_only: false,
        active: true,
        user_id: userId || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to subscribe: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to job alerts!",
      subscription: data,
    });

  } catch (error) {
    console.error("Job alert subscription error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to subscribe" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const token = url.searchParams.get("token");

    if (!email && !token) {
      return NextResponse.json(
        { error: "Email or token is required" },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from("job_alert_subscriptions");

    if (token) {
      const { data, error } = await query
        .update({ active: false })
        .eq("unsubscribe_token", token)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to unsubscribe: ${error.message}`);
      }

      return NextResponse.json({
        success: true,
        message: "Successfully unsubscribed from job alerts",
      });
    }

    if (email) {
      const { data, error } = await query
        .update({ active: false })
        .eq("email", email)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to unsubscribe: ${error.message}`);
      }

      return NextResponse.json({
        success: true,
        message: "Successfully unsubscribed from job alerts",
      });
    }

    return NextResponse.json(
      { error: "Email or token is required" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Job alert unsubscribe error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("job_alert_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true);

    if (error) {
      throw new Error(`Failed to get subscriptions: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      subscriptions: data || [],
    });

  } catch (error) {
    console.error("Get job alerts error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get subscriptions" },
      { status: 500 }
    );
  }
}