import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, companyName, website, phone, industry, country } = body;

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: "Email, password, and company name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if recruiter already exists
    const { data: existing } = await supabaseAdmin
      .from("crm_recruiters")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A recruiter with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const recruiter = {
      name,
      email,
      password_hash: passwordHash,
      company_name: companyName,
      website,
      phone,
      industry,
      country,
      plan: "free",
      status: "pending",
      jobs_posted: 0,
      jobs_remaining: 3,
      created_at: new Date().toISOString(),
    };

    const { data: saved, error } = await supabaseAdmin
      .from("crm_recruiters")
      .insert(recruiter)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create recruiter account: ${error.message}`);
    }

    // Create company page
    await supabaseAdmin.from("crm_companies").insert({
      name: companyName,
      website,
      industry,
      country,
      recruiter_id: saved.id,
      status: "active",
    });

    // Add to leads
    await supabaseAdmin.from("crm_leads").insert({
      lead_name: name || companyName,
      company: companyName,
      email,
      phone,
      country,
      source: "recruiter_signup",
      status: "Qualified",
      priority: "Hot",
    });

    return NextResponse.json({
      success: true,
      message: "Recruiter account created successfully! You can now login.",
      recruiter: {
        id: saved.id,
        email: saved.email,
        name: saved.name,
        company: saved.company_name,
        plan: saved.plan,
        jobsRemaining: saved.jobs_remaining,
      },
    });

  } catch (error) {
    console.error("Recruiter signup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signup failed" },
      { status: 500 }
    );
  }
}