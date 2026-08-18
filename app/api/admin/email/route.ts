import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ZohoMail } from "@/lib/email/zoho";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// POST - Send emails
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    let result;

    switch (type) {
      case "recruiter_outreach":
        result = await ZohoMail.sendRecruiterOutreach(data);
        break;
      case "job_alert":
        result = await ZohoMail.sendJobAlert(data);
        break;
      case "newsletter":
        result = await ZohoMail.sendNewsletter(data);
        break;
      case "send_email":
        result = await ZohoMail.sendEmail(data);
        break;
      case "send_bulk":
        result = await ZohoMail.sendBulkEmail(data);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      result,
    });

  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}

// GET - Get email logs and pending emails
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "pending";

    let data: any = {};

    if (type === "pending" || type === "all") {
      const [pendingEmails, sentEmails] = await Promise.all([
        supabaseAdmin.from("ops_email_outbox").select("*").eq("status", "queued").limit(20),
        supabaseAdmin.from("ops_email_outbox").select("*").eq("status", "sent").order("created_at", { ascending: false }).limit(20),
      ]);

      data = {
        pendingEmails: pendingEmails.data || [],
        sentEmails: sentEmails.data || [],
        totals: {
          pending: pendingEmails.data?.length || 0,
          sent: sentEmails.data?.length || 0,
        },
      };
    }

    return NextResponse.json({
      success: true,
      type,
      data,
    });

  } catch (error) {
    console.error("Email status error:", error);
    return NextResponse.json(
      { error: "Failed to load email status" },
      { status: 500 }
    );
  }
}