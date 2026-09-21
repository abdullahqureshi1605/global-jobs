import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function validUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

async function getUserId() {
  const session =
    await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const id =
    String(session.user.id || "");

  return validUuid(id)
    ? id
    : null;
}

export async function GET() {
  try {
    const userId =
      await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You must be signed in.",
          savedJobs: [],
        },
        { status: 401 }
      );
    }

    const { data, error } =
      await getSupabaseAdmin()
        .from("saved_jobs")
        .select(
          "id,candidate_id,job_id,created_at"
        )
        .eq(
          "candidate_id",
          userId
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      savedJobs: data || [],
    });
  } catch (error) {
    console.error(
      "Saved jobs GET:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load saved jobs.",
        savedJobs: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const userId =
      await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "You must be signed in.",
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const jobId =
      typeof body.job_id === "string"
        ? body.job_id.trim()
        : "";

    if (!validUuid(jobId)) {
      return NextResponse.json(
        {
          error:
            "Valid job ID is required.",
        },
        { status: 400 }
      );
    }

    const supabase =
      getSupabaseAdmin();

    const { data: job } =
      await supabase
        .from("jobs")
        .select("id,status")
        .eq("id", jobId)
        .maybeSingle();

    if (!job) {
      return NextResponse.json(
        {
          error:
            "Job not found.",
        },
        { status: 404 }
      );
    }

    const { data: existing } =
      await supabase
        .from("saved_jobs")
        .select("id")
        .eq(
          "candidate_id",
          userId
        )
        .eq("job_id", jobId)
        .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        saved: true,
        existing: true,
      });
    }

    const { data, error } =
      await supabase
        .from("saved_jobs")
        .insert({
          candidate_id:
            userId,
          job_id: jobId,
        })
        .select(
          "id,candidate_id,job_id,created_at"
        )
        .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        success: true,
        saved: true,
        item: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Saved jobs POST:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save job.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const userId =
      await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "You must be signed in.",
        },
        { status: 401 }
      );
    }

    const body =
      await request.json();

    const jobId =
      typeof body.job_id === "string"
        ? body.job_id.trim()
        : "";

    if (!validUuid(jobId)) {
      return NextResponse.json(
        {
          error:
            "Valid job ID is required.",
        },
        { status: 400 }
      );
    }

    const { error } =
      await getSupabaseAdmin()
        .from("saved_jobs")
        .delete()
        .eq(
          "candidate_id",
          userId
        )
        .eq(
          "job_id",
          jobId
        );

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      saved: false,
    });
  } catch (error) {
    console.error(
      "Saved jobs DELETE:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to remove saved job.",
      },
      { status: 500 }
    );
  }
}
