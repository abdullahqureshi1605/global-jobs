import {
  NextResponse,
} from "next/server";

import {
  getServerSession,
} from "next-auth";

import {
  authOptions,
} from "@/lib/auth";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import OpenAI from "openai";

const client =
  new OpenAI({
    apiKey:
      process.env.OPENAI_API_KEY,
  });

export async function POST(
  request: Request
) {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user) {
    return NextResponse.json(
      {
        error:
          "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  if (
    !process.env.OPENAI_API_KEY
  ) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not configured.",
      },
      {
        status: 503,
      }
    );
  }

  try {
    const body =
      await request.json();

    const command =
      String(
        body?.command ??
          ""
      ).trim();

    if (!command) {
      return NextResponse.json(
        {
          error:
            "command is required.",
        },
        {
          status: 400,
        }
      );
    }

    const [
      eventsResult,
      approvalsResult,
      emailResult,
    ] = await Promise.all([
      supabaseAdmin
        .from(
          "ops_events"
        )
        .select(
          "id,event_type,entity_type,entity_id,status,occurred_at,payload"
        )
        .order(
          "occurred_at",
          {
            ascending: false,
          }
        )
        .limit(50),

      supabaseAdmin
        .from(
          "ops_approvals"
        )
        .select(
          "id,status,requested_at,action_id"
        )
        .eq(
          "status",
          "pending"
        )
        .order(
          "requested_at",
          {
            ascending: false,
          }
        )
        .limit(30),

      supabaseAdmin
        .from(
          "ops_email_outbox"
        )
        .select(
          "id,status,email_type,scheduled_for,created_at"
        )
        .in(
          "status",
          [
            "queued",
            "processing",
          ]
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(30),
    ]);

    const context = {
      currentTime:
        new Date().toISOString(),

      pendingApprovals:
        approvalsResult.data ??
        [],

      pendingEmails:
        emailResult.data ??
        [],

      recentEvents:
        eventsResult.data ??
        [],
    };

    const response =
      await client.responses.create(
        {
          model:
            process.env.OPENAI_MODEL ??
            "gpt-5.6",

          store: false,

          input: `
You are the CEO operating assistant for Horizon Jobs.

The CEO gave this command:

${command}

Current company operating context:

${JSON.stringify(
  context,
  null,
  2
)}

Give a practical response based only on available data.

You may:
- identify problems
- prioritize work
- recommend actions
- explain KPI issues
- identify pending approvals
- identify operational bottlenecks
- propose automation

Do NOT claim that you actually sent emails,
published jobs, changed money, or executed external
actions. Those require a separate approved automation.

Keep the answer practical and management-focused.
`,
        }
      );

    await supabaseAdmin
      .from(
        "ops_audit_log"
      )
      .insert({
        actor_type:
          "admin",

        actor_id:
          session.user.email ??
          null,

        action:
          "ai_command",

        entity_type:
          "ops",

        entity_id:
          null,

        metadata: {
          command,
        },
      });

    return NextResponse.json(
      {
        success: true,

        command,

        response:
          response.output_text ??
          "",
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "AI command failed.",
      },
      {
        status: 500,
      }
    );
  }
}