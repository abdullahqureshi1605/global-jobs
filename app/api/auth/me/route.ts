import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const COOKIE_NAME = "auth_token";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token.value, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, created_at")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
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
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}