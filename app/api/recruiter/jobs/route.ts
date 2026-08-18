import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const COOKIE_NAME = "recruiter_token";

async function getRecruiterId(request: NextRequest): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);
    if (!token) return null;
    const decoded: any = verify(token.value, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

// GET - Get recruiter's jobs
export async function GET(request: NextRequest) {
  try {
    const recruiterId = await getRecruiterId(request);
    if (!recruiterId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");

    if (jobId) {
      const { data, error } = await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .eq("source", "recruiter")
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Job not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, job: data });
    }

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("source", "recruiter")
      .eq("source_id", recruiterId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get jobs: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      jobs: data || [],
    });

  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Failed to get jobs" },
      { status: 500 }
    );
  }
}

// POST - Post a new job
export async function POST(request: NextRequest) {
  try {
    const recruiterId = await getRecruiterId(request);
    if (!recruiterId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      company,
      country,
      city,
      category,
      employmentType,
      workplaceType,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      description,
      requirements,
      applyUrl,
    } = body;

    if (!title || !company || !country || !city || !category || !description || !applyUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check recruiter has jobs remaining
    const { data: recruiter, error: recruiterError } = await supabaseAdmin
      .from("crm_recruiters")
      .select("jobs_remaining, plan, jobs_posted, company_name")
      .eq("id", recruiterId)
      .single();

    if (recruiterError || !recruiter) {
      return NextResponse.json(
        { error: "Recruiter not found" },
        { status: 404 }
      );
    }

    if (recruiter.plan === "free" && recruiter.jobs_remaining <= 0) {
      return NextResponse.json(
        { error: "No free jobs remaining. Please upgrade to paid plan." },
        { status: 402 }
      );
    }

    const job = {
      title,
      company,
      country,
      city,
      category,
      employment_type: employmentType,
      workplace_type: workplaceType,
      experience_level: experienceLevel,
      salary_min: salaryMin ? parseFloat(salaryMin) : null,
      salary_max: salaryMax ? parseFloat(salaryMax) : null,
      salary_currency: salaryCurrency || "USD",
      description,
      requirements: requirements || [],
      apply_url: applyUrl,
      source: "recruiter",
      source_id: recruiterId,
      source_name: recruiter.company_name || company,
      status: "published",
      verification_status: "verified",
      views: 0,
      applications: 0,
      created_at: new Date().toISOString(),
    };

    const { data: saved, error } = await supabaseAdmin
      .from("jobs")
      .insert(job)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to post job: ${error.message}`);
    }

    // Update recruiter job count
    await supabaseAdmin
      .from("crm_recruiters")
      .update({
        jobs_posted: (recruiter.jobs_posted || 0) + 1,
        jobs_remaining: recruiter.plan === "free" ? (recruiter.jobs_remaining || 0) - 1 : 999,
      })
      .eq("id", recruiterId);

    return NextResponse.json({
      success: true,
      message: "Job posted successfully!",
      job: saved,
    });

  } catch (error) {
    console.error("Post job error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to post job" },
      { status: 500 }
    );
  }
}