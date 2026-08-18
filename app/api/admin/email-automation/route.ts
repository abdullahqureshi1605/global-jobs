import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EmailAutomation } from "@/lib/email/automation";

export const dynamic = "force-dynamic";

// POST - Run automation tasks
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
      case "extract_emails":
        result = await EmailAutomation.extractEmailsFromUsers();
        break;
      case "create_plan":
        result = await EmailAutomation.createEmailPlan(data.listId);
        break;
      case "approve":
        result = await EmailAutomation.approveEmail(data.planId);
        break;
      case "reject":
        result = await EmailAutomation.rejectEmail(data.planId);
        break;
      case "modify":
        result = await EmailAutomation.modifyEmail(data.planId, data.updates);
        break;
      case "approve_all":
        result = await EmailAutomation.approveAllEmails(data.listId);
        break;
      case "reject_all":
        result = await EmailAutomation.rejectAllEmails(data.listId);
        break;
      case "send_approved":
        result = await EmailAutomation.sendApprovedEmails(data.limit || 10);
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
    console.error("Email automation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to run automation" },
      { status: 500 }
    );
  }
}

// GET - Get pending emails and email lists
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "pending";
    const limit = parseInt(url.searchParams.get("limit") || "20");

    let data: any = {};

    if (type === "pending" || type === "all") {
      const [pendingEmails, emailLists] = await Promise.all([
        EmailAutomation.getPendingEmails(limit),
        EmailAutomation.getEmailLists(),
      ]);

      data = {
        pendingEmails,
        emailLists,
        totals: {
          pending: pendingEmails.length,
          lists: emailLists.length,
          totalEmails: emailLists.reduce((acc, list) => acc + list.total, 0),
        },
      };
    }

    if (type === "lists") {
      const emailLists = await EmailAutomation.getEmailLists();
      data = { emailLists };
    }

    return NextResponse.json({
      success: true,
      type,
      data,
    });

  } catch (error) {
    console.error("Email automation status error:", error);
    return NextResponse.json(
      { error: "Failed to load email automation status" },
      { status: 500 }
    );
  }
}