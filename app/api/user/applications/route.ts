import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

async function resolveUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const sessionId = String(session.user.id ?? "");
  const email = String(
    session.user.email ?? ""
  )
    .trim()
    .toLowerCase();

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(sessionId)) {
    return sessionId;
  }

  if (!email) {
    return null;
  }

  const admin = getSupabaseAdmin();

  const { data, error } =
    await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (error) {
    throw new Error(error.message);
  }

  const user = data.users.find(
    (u) =>
      String(u.email ?? "").toLowerCase() ===
      email
  );

  return user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await resolveUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const admin = getSupabaseAdmin();

    const { data, error } = await admin
      .from("applications")
      .select(
        "id,job_id,candidate_id,status,fit_score,applied_at,updated_at"
      )
      .eq("candidate_id", userId)
      .order("applied_at", {
        ascending: false,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load applications.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const userId = await resolveUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const jobId = String(
      body.job_id ?? ""
    ).trim();

    if (!jobId) {
      return NextResponse.json(
        { error: "job_id is required." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const payload = {
      job_id: jobId,
      candidate_id: userId,
      status: "applied",
      fit_score:
        body.fit_score === null ||
        body.fit_score === undefined
          ? null
          : Number(body.fit_score),
    };

    const { data, error } = await admin
      .from("applications")
      .insert(payload)
      .select(
        "id,job_id,candidate_id,status,fit_score,applied_at,updated_at"
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { application: data },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit application.",
      },
      { status: 500 }
    );
  }
}
