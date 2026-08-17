import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const TABLES = {
  leads: "crm_leads",
  companies: "crm_companies",
  contacts: "crm_contacts",
  deals: "crm_deals",
  tasks: "crm_tasks",
  activities: "crm_activities",
  content: "crm_content",
  targets: "crm_job_targets",
  social: "crm_social_posts",
} as const;

type ModuleName =
  keyof typeof TABLES;

function isModule(
  value: string
): value is ModuleName {
  return Object.prototype.hasOwnProperty.call(
    TABLES,
    value
  );
}

async function requireAdmin() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user) {
    return null;
  }

  return session;
}

export async function GET(
  request: Request
) {
  const session =
    await requireAdmin();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Unauthorized. Please log in again.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const { searchParams } =
      new URL(request.url);

    const module =
      searchParams.get(
        "module"
      ) ?? "leads";

    if (!isModule(module)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid CRM module.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from(
        TABLES[module]
      )
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

    if (error) {
      console.error(
        "CRM GET error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to load CRM data.",
          details:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: data ?? [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "CRM GET unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unexpected server error.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  const session =
    await requireAdmin();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Unauthorized. Please log in again.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body =
      await request.json();

    const module =
      body?.module as string;

    const data =
      body?.data;

    if (
      !module ||
      !isModule(module)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid CRM module.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !data ||
      typeof data !==
        "object" ||
      Array.isArray(data)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "CRM record data is required.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: created,
      error,
    } = await supabaseAdmin
      .from(
        TABLES[module]
      )
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error(
        "CRM POST error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to create CRM record.",
          details:
            error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CRM POST unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unexpected server error.",
      },
      {
        status: 500,
      }
    );
  }
}