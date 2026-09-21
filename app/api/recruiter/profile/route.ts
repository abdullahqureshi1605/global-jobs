import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

async function getCompanyId(userId: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("company_members")
    .select("company_id,role")
    .eq("user_id", userId)
    .in("role", ["admin", "recruiter"])
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.company_id ?? null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (
      session.user.role !== "recruiter" &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Recruiter access required." },
        { status: 403 }
      );
    }

    const companyId = await getCompanyId(
      session.user.id
    );

    if (!companyId) {
      return NextResponse.json(
        { error: "No company workspace found." },
        { status: 404 }
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from("companies")
      .select(
        "id,owner_user_id,name,slug,industry,website,size_range,logo_url,about,verification_status,created_at,updated_at"
      )
      .eq("id", companyId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      company: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load company profile.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (
      session.user.role !== "recruiter" &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Recruiter access required." },
        { status: 403 }
      );
    }

    const companyId = await getCompanyId(
      session.user.id
    );

    if (!companyId) {
      return NextResponse.json(
        { error: "No company workspace found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const allowed = {
      name:
        typeof body.name === "string"
          ? body.name.trim()
          : undefined,
      industry:
        typeof body.industry === "string"
          ? body.industry.trim()
          : undefined,
      website:
        typeof body.website === "string"
          ? body.website.trim()
          : undefined,
      size_range:
        typeof body.size_range === "string"
          ? body.size_range.trim()
          : undefined,
      logo_url:
        typeof body.logo_url === "string"
          ? body.logo_url.trim()
          : undefined,
      about:
        typeof body.about === "string"
          ? body.about.trim()
          : undefined,
      updated_at: new Date().toISOString(),
    };

    const updateData = Object.fromEntries(
      Object.entries(allowed).filter(
        ([, value]) => value !== undefined
      )
    );

    if (
      typeof updateData.name === "string" &&
      updateData.name.length < 2
    ) {
      return NextResponse.json(
        { error: "Company name is required." },
        { status: 400 }
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from("companies")
      .update(updateData)
      .eq("id", companyId)
      .select(
        "id,owner_user_id,name,slug,industry,website,size_range,logo_url,about,verification_status,created_at,updated_at"
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      company: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update company profile.",
      },
      { status: 500 }
    );
  }
}
