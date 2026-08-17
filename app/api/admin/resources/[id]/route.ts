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
            "Resource ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      error,
    } = await supabaseAdmin
      .from("resources")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Resource deletion failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to delete resource.",
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
      "Unexpected resource deletion error:",
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