import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Fetch all data in parallel
    const [
      jobsResult,
      reportsResult,
      leadsResult,
      tasksResult,
      approvalsResult,
      automationsResult,
      eventsResult,
    ] = await Promise.all([
      // Jobs count
      supabaseAdmin
        .from("jobs")
        .select("status, created_at", { count: "exact", head: false })
        .gte("created_at", startOfMonth.toISOString()),

      // Reports count
      supabaseAdmin
        .from("job_reports")
        .select("created_at", { count: "exact", head: false })
        .gte("created_at", startOfMonth.toISOString()),

      // Leads count
      supabaseAdmin
        .from("crm_leads")
        .select("status, priority, created_at", { count: "exact", head: false })
        .gte("created_at", startOfMonth.toISOString()),

      // Tasks count
      supabaseAdmin
        .from("crm_tasks")
        .select("status, priority, due_date", { count: "exact", head: false }),

      // Approvals pending
      supabaseAdmin
        .from("ops_approvals")
        .select("status", { count: "exact", head: false })
        .eq("status", "pending"),

      // Automations
      supabaseAdmin
        .from("ops_automation_runs")
        .select("status", { count: "exact", head: false })
        .gte("created_at", startOfDay.toISOString()),

      // Events
      supabaseAdmin
        .from("ops_events")
        .select("status", { count: "exact", head: false })
        .gte("occurred_at", startOfDay.toISOString()),
    ]);

    // Calculate counts
    const totalJobs = jobsResult.data?.length || 0;
    const publishedJobs = jobsResult.data?.filter((j: any) => j.status === "published").length || 0;
    const draftJobs = jobsResult.data?.filter((j: any) => j.status === "draft").length || 0;

    const totalReports = reportsResult.data?.length || 0;

    const totalLeads = leadsResult.data?.length || 0;
    const hotLeads = leadsResult.data?.filter((l: any) => l.priority === "Hot").length || 0;
    const qualifiedLeads = leadsResult.data?.filter((l: any) => l.status === "Qualified").length || 0;

    const totalTasks = tasksResult.data?.length || 0;
    const pendingTasks = tasksResult.data?.filter((t: any) => t.status === "Pending" || t.status === "In Progress").length || 0;
    const overdueTasks = tasksResult.data?.filter((t: any) => t.due_date && new Date(t.due_date) < new Date()).length || 0;

    const pendingApprovals = approvalsResult.count || 0;

    const todayAutomations = automationsResult.data?.length || 0;
    const failedAutomations = automationsResult.data?.filter((a: any) => a.status === "failed").length || 0;

    const todayEvents = eventsResult.data?.length || 0;

    // Build response
    const controlCenter = {
      timestamp: new Date().toISOString(),
      company: {
        totalJobs,
        publishedJobs,
        draftJobs,
        totalReports,
        todayEvents,
      },
      marketing: {
        totalLeads,
        hotLeads,
        qualifiedLeads,
      },
      administration: {
        totalTasks,
        pendingTasks,
        overdueTasks,
        pendingApprovals,
      },
      production: {
        jobsPublishedThisMonth: publishedJobs,
        jobsAddedThisMonth: totalJobs,
      },
      automation: {
        todayAutomations,
        failedAutomations,
        successRate: todayAutomations > 0 
          ? Math.round(((todayAutomations - failedAutomations) / todayAutomations) * 100) 
          : 100,
      },
    };

    return NextResponse.json({ success: true, data: controlCenter });
  } catch (error) {
    console.error("Control center error:", error);
    return NextResponse.json(
      { error: "Failed to load control center data" },
      { status: 500 }
    );
  }
}