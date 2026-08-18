import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// POST - Create recruiter account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    let result;

    switch (action) {
      case "create_account":
        result = await createRecruiterAccount(data);
        break;
      case "update_status":
        result = await updateRecruiterStatus(data.recruiterId, data.status);
        break;
      case "upgrade_to_paid":
        result = await upgradeToPaid(data.recruiterId, data.plan);
        break;
      case "post_job":
        result = await postRecruiterJob(data);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
    });

  } catch (error) {
    console.error("Recruiter error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    );
  }
}

// GET - Get recruiters and their status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "all";

    let data: any = {};

    if (type === "all" || type === "pending") {
      const [recruiters, pendingJobs] = await Promise.all([
        supabaseAdmin.from("crm_recruiters").select("*").order("created_at", { ascending: false }).limit(50),
        supabaseAdmin.from("jobs").select("*").eq("status", "draft").eq("source", "recruiter").limit(20),
      ]);

      data = {
        recruiters: recruiters.data || [],
        pendingJobs: pendingJobs.data || [],
        totals: {
          total: recruiters.data?.length || 0,
          free: recruiters.data?.filter((r: any) => r.plan === "free").length || 0,
          paid: recruiters.data?.filter((r: any) => r.plan === "paid").length || 0,
          pending: recruiters.data?.filter((r: any) => r.status === "pending").length || 0,
        },
      };
    }

    if (type === "stats") {
      const [recruiters, jobs, revenue] = await Promise.all([
        supabaseAdmin.from("crm_recruiters").select("plan, status"),
        supabaseAdmin.from("jobs").select("source, status"),
        supabaseAdmin.from("recruiter_payments").select("amount, status"),
      ]);

      data = {
        stats: {
          totalRecruiters: recruiters.data?.length || 0,
          freeRecruiters: recruiters.data?.filter((r: any) => r.plan === "free").length || 0,
          paidRecruiters: recruiters.data?.filter((r: any) => r.plan === "paid").length || 0,
          totalJobs: jobs.data?.filter((j: any) => j.source === "recruiter").length || 0,
          publishedJobs: jobs.data?.filter((j: any) => j.source === "recruiter" && j.status === "published").length || 0,
          totalRevenue: revenue.data?.reduce((acc: number, r: any) => acc + (r.amount || 0), 0) || 0,
        },
      };
    }

    return NextResponse.json({
      success: true,
      type,
      data,
    });

  } catch (error) {
    console.error("Recruiter status error:", error);
    return NextResponse.json(
      { error: "Failed to load recruiter data" },
      { status: 500 }
    );
  }
}

// ============================================
// RECRUITER FUNCTIONS
// ============================================

async function createRecruiterAccount(data: any) {
  const {
    email,
    companyName,
    website,
    industry,
    country,
    name,
    phone,
  } = data;

  const { data: existing } = await supabaseAdmin
    .from("crm_recruiters")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    throw new Error("Recruiter with this email already exists");
  }

  const recruiter = {
    email,
    company_name: companyName,
    website,
    industry,
    country,
    name,
    phone,
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

  await supabaseAdmin.from("crm_companies").insert({
    name: companyName,
    website,
    industry,
    country,
    recruiter_id: saved.id,
    status: "active",
  });

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

  return {
    message: "Recruiter account created successfully!",
    recruiter: saved,
  };
}

async function updateRecruiterStatus(recruiterId: string, status: string) {
  const { data, error } = await supabaseAdmin
    .from("crm_recruiters")
    .update({ status })
    .eq("id", recruiterId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update recruiter status: ${error.message}`);
  }

  return {
    message: `Recruiter status updated to ${status}`,
    recruiter: data,
  };
}

async function upgradeToPaid(recruiterId: string, plan: string) {
  const { data, error } = await supabaseAdmin
    .from("crm_recruiters")
    .update({
      plan: "paid",
      status: "active",
      jobs_remaining: 999,
      upgraded_at: new Date().toISOString(),
    })
    .eq("id", recruiterId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upgrade recruiter: ${error.message}`);
  }

  const amount = plan === "premium" ? 99 : 49;
  await supabaseAdmin.from("recruiter_payments").insert({
    recruiter_id: recruiterId,
    amount: amount,
    plan: plan,
    status: "paid",
    paid_at: new Date().toISOString(),
  });

  return {
    message: `Recruiter upgraded to ${plan} plan!`,
    recruiter: data,
  };
}

async function postRecruiterJob(data: any) {
  const {
    recruiterId,
    title,
    description,
    country,
    city,
    category,
    employmentType,
    workplaceType,
    applyUrl,
    salaryMin,
    salaryMax,
  } = data;

  const { data: recruiter, error: recruiterError } = await supabaseAdmin
    .from("crm_recruiters")
    .select("jobs_remaining, plan, company_name, jobs_posted")
    .eq("id", recruiterId)
    .single();

  if (recruiterError || !recruiter) {
    throw new Error("Recruiter not found");
  }

  if (recruiter.plan === "free" && recruiter.jobs_remaining <= 0) {
    throw new Error("No free jobs remaining. Please upgrade to paid plan.");
  }

  const job = {
    title,
    description,
    country,
    city,
    category,
    employment_type: employmentType,
    workplace_type: workplaceType,
    apply_url: applyUrl,
    salary_min: salaryMin,
    salary_max: salaryMax,
    source: "recruiter",
    source_name: recruiter.company_name || "Recruiter",
    status: "published",
    verification_status: "verified",
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

  await supabaseAdmin
    .from("crm_recruiters")
    .update({
      jobs_posted: (recruiter.jobs_posted || 0) + 1,
      jobs_remaining: recruiter.plan === "free" ? (recruiter.jobs_remaining || 0) - 1 : 999,
    })
    .eq("id", recruiterId);

  return {
    message: "Job posted successfully!",
    job: saved,
  };
}