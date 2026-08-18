import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const COOKIE_NAME = "recruiter_token";

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

    const { data: recruiter, error } = await supabaseAdmin
      .from("crm_recruiters")
      .select("id, name, email, company_name, plan, jobs_posted, jobs_remaining, status")
      .eq("id", decoded.id)
      .single();

    if (error || !recruiter) {
      return NextResponse.json(
        { error: "Recruiter not found" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      recruiter: {
        id: recruiter.id,
        name: recruiter.name,
        email: recruiter.email,
        company: recruiter.company_name,
        plan: recruiter.plan,
        jobsPosted: recruiter.jobs_posted,
        jobsRemaining: recruiter.jobs_remaining,
        status: recruiter.status,
      },
    });

  } catch (error) {
    console.error("Recruiter me error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}