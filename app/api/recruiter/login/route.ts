import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const COOKIE_NAME = "recruiter_token";

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

    const { data: recruiter, error } = await supabaseAdmin
      .from("crm_recruiters")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !recruiter) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!recruiter.password_hash) {
      return NextResponse.json(
        { error: "Please sign up with email and password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, recruiter.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = sign(
      {
        id: recruiter.id,
        email: recruiter.email,
        name: recruiter.name,
        company: recruiter.company_name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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
      recruiter: {
        id: recruiter.id,
        email: recruiter.email,
        name: recruiter.name,
        company: recruiter.company_name,
        plan: recruiter.plan,
        jobsPosted: recruiter.jobs_posted,
        jobsRemaining: recruiter.jobs_remaining,
      },
    });

  } catch (error) {
    console.error("Recruiter login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}