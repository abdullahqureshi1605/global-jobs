import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  _request: Request,
  context: Context
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Report ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      error,
    } = await supabaseAdmin
      .from("job_reports")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Report deletion failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to delete report.",
          details:
            error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Unexpected report deletion error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}