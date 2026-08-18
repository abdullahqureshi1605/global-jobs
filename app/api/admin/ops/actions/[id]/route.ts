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

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  context: Context
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

  const {
    id,
  } = await context.params;

  try {
    const body =
      await request.json();

    const decision =
      String(
        body?.decision ??
          ""
      );

    if (
      ![
        "approve",
        "reject",
      ].includes(decision)
    ) {
      return NextResponse.json(
        {
          error:
            "decision must be approve or reject.",
        },
        {
          status: 400,
        }
      );
    }

    const newStatus =
      decision ===
      "approve"
        ? "approved"
        : "rejected";

    const {
      data: action,
      error:
        actionError,
    } =
      await supabaseAdmin
        .from(
          "ops_ai_actions"
        )
        .update({
          status:
            newStatus,
          approved_by:
            session.user
              .email ??
            null,
          approved_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (
      actionError ||
      !action
    ) {
      return NextResponse.json(
        {
          error:
            actionError?.message ??
            "Action not found.",
        },
        {
          status: 404,
        }
      );
    }

    await supabaseAdmin
      .from(
        "ops_approvals"
      )
      .update({
        status:
          newStatus,
        resolved_by:
          session.user
            .email ??
          null,
        resolved_at:
          new Date().toISOString(),
        note:
          body?.note ??
          null,
      })
      .eq(
        "action_id",
        id
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
          `ai_action_${decision}`,
        entity_type:
          "ai_action",
        entity_id: id,
        metadata: {
          note:
            body?.note ??
            null,
        },
      });

    return NextResponse.json({
      success: true,
      status:
        newStatus,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Failed to process approval.",
      },
      {
        status: 500,
      }
    );
  }
}