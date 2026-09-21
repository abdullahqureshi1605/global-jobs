import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

async function requireAdmin() {
  const ok = await isAdminAuthenticated();

  if (!ok) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return null;
}

export async function GET() {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("career_resources")
      .select(
        "id,title,slug,body,category,published_at,created_at"
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Career resources GET failed:",
        error
      );

      return NextResponse.json(
        {
          error: "Failed to load career resources.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resources: data ?? [],
    });
  } catch (error) {
    console.error(
      "Career resources GET unexpected error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load career resources.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const input = await request.json();

    const title = String(
      input?.title ?? ""
    ).trim();

    const category = String(
      input?.category ?? "Career Advice"
    ).trim();

    const body = String(
      input?.body ??
      input?.content ??
      input?.description ??
      ""
    ).trim();

    const requestedSlug = String(
      input?.slug ?? ""
    ).trim();

    const published =
      input?.published === true ||
      input?.published === "true" ||
      input?.publicationStatus === "published" ||
      Boolean(input?.publishedDate);

    if (!title) {
      return NextResponse.json(
        {
          error: "Title is required.",
        },
        { status: 400 }
      );
    }

    if (!body) {
      return NextResponse.json(
        {
          error: "Content is required.",
        },
        { status: 400 }
      );
    }

    let slug =
      makeSlug(requestedSlug || title);

    if (!slug) {
      slug = `resource-${Date.now()}`;
    }

    const { data: existing } =
      await supabaseAdmin
        .from("career_resources")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

    if (existing?.id) {
      slug = `${slug}-${Date.now()}`;
    }

    const now =
      new Date().toISOString();

    const publishedAt = published
      ? (
          input?.publishedDate
            ? new Date(
                input.publishedDate
              ).toISOString()
            : now
        )
      : null;

    const { data, error } =
      await supabaseAdmin
        .from("career_resources")
        .insert({
          title,
          slug,
          body,
          category,
          published_at: publishedAt,
        })
        .select(
          "id,title,slug,body,category,published_at,created_at"
        )
        .single();

    if (error) {
      console.error(
        "Career resource creation failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to create career resource.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        resource: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Career resource POST unexpected error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create career resource.",
      },
      { status: 500 }
    );
  }
}
