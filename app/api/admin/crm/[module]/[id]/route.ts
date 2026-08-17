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

interface Context {
  params: Promise<{
    module: string;
    id: string;
  }>;
}

export async function PUT(
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
    const {
      module,
      id,
    } =
      await context.params;

    if (
      !isModule(module) ||
      !id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid CRM record.",
        },
        {
          status: 400,
        }
      );
    }

    const payload =
      await request.json();

    if (
      !payload ||
      typeof payload !==
        "object" ||
      Array.isArray(payload)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid CRM data.",
        },
        {
          status: 400,
        }
      );
    }

    delete payload.id;
    delete payload.created_at;

    payload.updated_at =
      new Date().toISOString();

    const {
      data,
      error,
    } = await supabaseAdmin
      .from(
        TABLES[module]
      )
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "CRM PUT error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to update CRM record.",
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
        data,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "CRM PUT unexpected error:",
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

export async function DELETE(
  _request: Request,
  context: Context
) {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user) {
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
    const {
      module,
      id,
    } =
      await context.params;

    if (
      !isModule(module) ||
      !id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid CRM record.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      error,
    } = await supabaseAdmin
      .from(
        TABLES[module]
      )
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "CRM DELETE error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to delete CRM record.",
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
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "CRM DELETE unexpected error:",
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