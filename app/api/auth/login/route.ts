import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const COOKIE_NAME = "auth_token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}