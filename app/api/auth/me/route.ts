import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);

    console.log("🔵 ME route called, session:", session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, created_at")
      .eq("email", session.user.email)
      .single();

    if (error || !user) {
      console.error("❌ User not found in DB:", error);
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    });

  } catch (error) {
    console.error("❌ ME route error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}