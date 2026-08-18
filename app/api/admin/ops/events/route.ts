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
  recordOpsEvent,
} from "@/lib/ops/eventBus";

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

  try {
    const body =
      await request.json();

    if (
      !body?.eventType ||
      !body?.entityType
    ) {
      return NextResponse.json(
        {
          error:
            "eventType and entityType are required.",
        },
        {
          status: 400,
        }
      );
    }

    const event =
      await recordOpsEvent({
        eventType:
          String(
            body.eventType
          ),

        entityType:
          String(
            body.entityType
          ),

        entityId:
          body.entityId
            ? String(
                body.entityId
              )
            : null,

        source:
          body.source ??
          "admin",

        actorType:
          body.actorType ??
          "admin",

        actorId:
          session.user.email ??
          null,

        payload:
          body.payload ?? {},

        dedupeKey:
          body.dedupeKey ??
          null,
      });

    return NextResponse.json(
      {
        success: true,
        event,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Failed to record event.",
      },
      {
        status: 500,
      }
    );
  }
}