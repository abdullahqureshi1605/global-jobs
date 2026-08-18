import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // FREE AI: Rule-based responses without OpenAI
    const response = generateResponse(query);

    return NextResponse.json({
      success: true,
      openai: false,
      result: response,
    });

  } catch (error) {
    console.error("Ops command error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Command failed" },
      { status: 500 }
    );
  }
}

function generateResponse(query: string): any {
  const lowerQuery = query.toLowerCase();

  // Check for specific keywords
  if (lowerQuery.includes("jobs") || lowerQuery.includes("job")) {
    return {
      analysis: "You asked about jobs. Here's a quick summary.",
      recommendation: "Check the admin dashboard for job management.",
      confidence: 75,
      requiresApproval: false,
      data: {
        action: "view_jobs",
        message: "Recent job activity can be found in the Manage Jobs section.",
      },
    };
  }

  if (lowerQuery.includes("recruiter") || lowerQuery.includes("recruiters")) {
    return {
      analysis: "You asked about recruiters.",
      recommendation: "Check the Recruiter Management section for details.",
      confidence: 75,
      requiresApproval: false,
      data: {
        action: "view_recruiters",
        message: "Recruiter activity can be found in the CRM section.",
      },
    };
  }

  if (lowerQuery.includes("analytics") || lowerQuery.includes("traffic")) {
    return {
      analysis: "You asked about analytics and traffic.",
      recommendation: "Check the Analytics dashboard for detailed metrics.",
      confidence: 80,
      requiresApproval: false,
      data: {
        action: "view_analytics",
        message: "Analytics data is available in the Analytics section.",
      },
    };
  }

  if (lowerQuery.includes("report") || lowerQuery.includes("reported")) {
    return {
      analysis: "You asked about reports.",
      recommendation: "Check the Reported Jobs section for pending reports.",
      confidence: 85,
      requiresApproval: false,
      data: {
        action: "view_reports",
        message: "Reported jobs are available in the Reported Jobs section.",
      },
    };
  }

  if (lowerQuery.includes("crm") || lowerQuery.includes("lead") || lowerQuery.includes("deal")) {
    return {
      analysis: "You asked about CRM and business operations.",
      recommendation: "Check the CRM section for leads, companies, and deals.",
      confidence: 80,
      requiresApproval: false,
      data: {
        action: "view_crm",
        message: "CRM data is available in the Business CRM section.",
      },
    };
  }

  if (lowerQuery.includes("help") || lowerQuery.includes("what can")) {
    return {
      analysis: "You asked for help.",
      recommendation: "Here are the main sections you can explore:",
      confidence: 90,
      requiresApproval: false,
      data: {
        action: "help",
        message: "Available sections: Control Center, Manage Jobs, Career Resources, Analytics, Reported Jobs, Business CRM, AI Agents, Automation Center, Email Center, Recruiter Management.",
      },
    };
  }

  // Default response
  return {
    analysis: `You asked: "${query}"`,
    recommendation: "I'm operating in offline mode. Check the admin dashboard for detailed information.",
    confidence: 60,
    requiresApproval: false,
    data: {
      action: "view_dashboard",
      message: "All available sections are accessible from the admin dashboard.",
    },
  };
}