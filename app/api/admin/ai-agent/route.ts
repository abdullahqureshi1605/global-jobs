import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// POST - Execute AI actions
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
      case "publish_job":
        result = await publishJob(data.jobId);
        break;
      case "publish_resource":
        result = await publishResource(data.resourceId);
        break;
      case "create_social_post":
        result = await createSocialPost(data);
        break;
      case "follow_up_lead":
        result = await followUpLead(data.leadId);
        break;
      case "create_task":
        result = await createTask(data);
        break;
      case "approve_deal":
        result = await approveDeal(data.dealId);
        break;
      case "review_overdue":
        result = await reviewOverdueTasks();
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
    console.error("AI Agent execution error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute action" },
      { status: 500 }
    );
  }
}

// GET - Recommendations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const department = url.searchParams.get("department") || "all";

    // Fetch data based on department
    let data = {};

    if (department === "all" || department === "marketing") {
      const [leads, social, content] = await Promise.all([
        supabaseAdmin.from("crm_leads").select("*").order("created_at", { ascending: false }).limit(20),
        supabaseAdmin.from("crm_social_posts").select("*").order("created_at", { ascending: false }).limit(10),
        supabaseAdmin.from("crm_content").select("*").order("created_at", { ascending: false }).limit(10),
      ]);
      data = { ...data, leads: leads.data || [], social: social.data || [], content: content.data || [] };
    }

    if (department === "all" || department === "finance") {
      const [deals, revenue] = await Promise.all([
        supabaseAdmin.from("crm_deals").select("*").order("created_at", { ascending: false }).limit(10),
        supabaseAdmin.from("kpi_records").select("*").order("recorded_at", { ascending: false }).limit(10),
      ]);
      data = { ...data, deals: deals.data || [], revenue: revenue.data || [] };
    }

    if (department === "all" || department === "administration") {
      const [tasks, approvals] = await Promise.all([
        supabaseAdmin.from("crm_tasks").select("*").eq("status", "Pending").order("due_date", { ascending: true }).limit(20),
        supabaseAdmin.from("ops_approvals").select("*").eq("status", "pending").limit(10),
      ]);
      data = { ...data, tasks: tasks.data || [], approvals: approvals.data || [] };
    }

    if (department === "all" || department === "production") {
      const [jobs, resources] = await Promise.all([
        supabaseAdmin.from("jobs").select("*").eq("status", "draft").limit(20),
        supabaseAdmin.from("resources").select("*").eq("status", "draft").limit(10),
      ]);
      data = { ...data, jobs: jobs.data || [], resources: resources.data || [] };
    }

    // Generate actionable AI recommendations
    const recommendations = generateActionableRecommendations(department, data);

    return NextResponse.json({
      success: true,
      department,
      data,
      recommendations,
    });

  } catch (error) {
    console.error("AI Agent error:", error);
    return NextResponse.json(
      { error: "Failed to load AI agent data" },
      { status: 500 }
    );
  }
}

// ============================================
// EXECUTION FUNCTIONS - These actually DO things
// ============================================

async function publishJob(jobId: string) {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .update({ status: "published" })
    .eq("id", jobId)
    .select()
    .single();

  if (error) throw new Error(`Failed to publish job: ${error.message}`);
  return { message: "Job published successfully!", job: data };
}

async function publishResource(resourceId: string) {
  const { data, error } = await supabaseAdmin
    .from("resources")
    .update({ status: "published" })
    .eq("id", resourceId)
    .select()
    .single();

  if (error) throw new Error(`Failed to publish resource: ${error.message}`);
  return { message: "Resource published successfully!", resource: data };
}

async function createSocialPost(data: any) {
  const { title, platform, target_country, target_category, target_url } = data;

  const { data: post, error } = await supabaseAdmin
    .from("crm_social_posts")
    .insert({
      platform: platform || "LinkedIn",
      post_type: "Job Post",
      title: title,
      target_country: target_country || "",
      target_category: target_category || "",
      target_url: target_url || "",
      status: "Draft",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create social post: ${error.message}`);
  return { message: "Social post created! Ready for review.", post };
}

async function followUpLead(leadId: string) {
  // Create a follow-up task
  const { data: task, error } = await supabaseAdmin
    .from("crm_tasks")
    .insert({
      title: "Follow up with lead",
      description: "Follow up on lead",
      status: "Pending",
      priority: "High",
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create follow-up task: ${error.message}`);
  return { message: "Follow-up task created!", task };
}

async function createTask(data: any) {
  const { title, description, priority, due_date } = data;

  const { data: task, error } = await supabaseAdmin
    .from("crm_tasks")
    .insert({
      title: title || "New Task",
      description: description || "",
      status: "Pending",
      priority: priority || "Medium",
      due_date: due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create task: ${error.message}`);
  return { message: "Task created!", task };
}

async function approveDeal(dealId: string) {
  const { data, error } = await supabaseAdmin
    .from("crm_deals")
    .update({ stage: "Won" })
    .eq("id", dealId)
    .select()
    .single();

  if (error) throw new Error(`Failed to approve deal: ${error.message}`);
  return { message: "Deal approved and marked as Won!", deal: data };
}

async function reviewOverdueTasks() {
  const { data, error } = await supabaseAdmin
    .from("crm_tasks")
    .update({ priority: "High" })
    .eq("status", "Pending")
    .lt("due_date", new Date().toISOString())
    .select();

  if (error) throw new Error(`Failed to review overdue tasks: ${error.message}`);
  return { message: `${data?.length || 0} overdue tasks marked as High priority!`, tasks: data };
}

// ============================================
// RECOMMENDATION GENERATOR WITH ACTIONS
// ============================================

function generateActionableRecommendations(department: string, data: any) {
  const recommendations = [];

  // MARKETING
  if (department === "all" || department === "marketing") {
    const hotLeads = data.leads?.filter((l: any) => l.priority === "Hot") || [];
    if (hotLeads.length > 0) {
      recommendations.push({
        department: "marketing",
        title: `Follow up with ${hotLeads.length} hot lead(s)`,
        description: "These leads need immediate attention. Create follow-up tasks.",
        priority: "high",
        action: "follow_up_lead",
        params: { leadId: hotLeads[0]?.id },
        needsApproval: false,
      });
    }

    const draftContent = data.content?.filter((c: any) => c.status === "draft") || [];
    if (draftContent.length > 0) {
      recommendations.push({
        department: "marketing",
        title: `Publish ${draftContent.length} content piece(s)`,
        description: "Content is ready for publishing.",
        priority: "medium",
        action: "publish_resource",
        params: { resourceId: draftContent[0]?.id },
        needsApproval: true,
      });
    }

    if (data.social?.length === 0) {
      recommendations.push({
        department: "marketing",
        title: "Create social media content",
        description: "No social posts found. Create a new job post for LinkedIn.",
        priority: "medium",
        action: "create_social_post",
        params: {
          title: "We're hiring! New opportunity available",
          platform: "LinkedIn",
        },
        needsApproval: true,
      });
    }
  }

  // FINANCE
  if (department === "all" || department === "finance") {
    const pendingDeals = data.deals?.filter((d: any) => d.stage !== "Won" && d.stage !== "Lost") || [];
    if (pendingDeals.length > 0) {
      recommendations.push({
        department: "finance",
        title: `Approve ${pendingDeals.length} pending deal(s)`,
        description: "Deals ready to be marked as Won.",
        priority: "high",
        action: "approve_deal",
        params: { dealId: pendingDeals[0]?.id },
        needsApproval: true,
      });
    }
  }

  // ADMINISTRATION
  if (department === "all" || department === "administration") {
    const overdueTasks = data.tasks?.filter((t: any) => t.due_date && new Date(t.due_date) < new Date()) || [];
    if (overdueTasks.length > 0) {
      recommendations.push({
        department: "administration",
        title: `${overdueTasks.length} overdue task(s)`,
        description: "Automatically mark overdue tasks as High priority.",
        priority: "high",
        action: "review_overdue",
        params: {},
        needsApproval: false,
      });
    }

    if (data.approvals?.length > 0) {
      recommendations.push({
        department: "administration",
        title: `${data.approvals.length} approval(s) pending`,
        description: "Actions waiting for your approval.",
        priority: "high",
        action: "review_approvals",
        params: {},
        needsApproval: true,
      });
    }
  }

  // PRODUCTION
  if (department === "all" || department === "production") {
    const draftJobs = data.jobs?.filter((j: any) => j.status === "draft") || [];
    if (draftJobs.length > 0) {
      recommendations.push({
        department: "production",
        title: `${draftJobs.length} job(s) ready for publishing`,
        description: `Publish ${draftJobs[0]?.title || "job"}`,
        priority: "high",
        action: "publish_job",
        params: { jobId: draftJobs[0]?.id },
        needsApproval: true,
      });
    }

    const draftResources = data.resources?.filter((r: any) => r.status === "draft") || [];
    if (draftResources.length > 0) {
      recommendations.push({
        department: "production",
        title: `${draftResources.length} resource(s) ready for publishing`,
        description: `Publish "${draftResources[0]?.title || "resource"}"`,
        priority: "medium",
        action: "publish_resource",
        params: { resourceId: draftResources[0]?.id },
        needsApproval: true,
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      department: "system",
      title: "All caught up!",
      description: "No pending actions found. Everything is running smoothly.",
      priority: "low",
      action: "none",
      params: {},
      needsApproval: false,
    });
  }

  return recommendations;
}