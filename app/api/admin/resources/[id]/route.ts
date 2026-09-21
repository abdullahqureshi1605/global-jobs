import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

interface Context {
  params: Promise<{
    id: string;
  }>;
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

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export async function GET(
  _request: Request,
  context: Context
) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Resource ID is required." },
        { status: 400 }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("career_resources")
        .select(
          "id,title,slug,body,category,published_at,created_at"
        )
        .eq("id", id)
        .single();

    if (error) {
      return NextResponse.json(
        {
          error: "Career resource not found.",
          details: error.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      resource: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load resource.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: Context
) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Resource ID is required." },
        { status: 400 }
      );
    }

    const input = await request.json();

    const update: Record<string, unknown> = {};

    if (input?.title !== undefined) {
      const title = String(
        input.title
      ).trim();

      if (!title) {
        return NextResponse.json(
          { error: "Title is required." },
          { status: 400 }
        );
      }

      update.title = title;
    }

    if (
      input?.body !== undefined ||
      input?.content !== undefined ||
      input?.description !== undefined
    ) {
      const body = String(
        input?.body ??
        input?.content ??
        input?.description ??
        ""
      ).trim();

      if (!body) {
        return NextResponse.json(
          { error: "Content is required." },
          { status: 400 }
        );
      }

      update.body = body;
    }

    if (input?.category !== undefined) {
      update.category = String(
        input.category
      ).trim();
    }

    if (input?.slug !== undefined) {
      update.slug = makeSlug(
        String(input.slug)
      );
    }

    if (
      input?.published !== undefined ||
      input?.publicationStatus !== undefined ||
      input?.publishedDate !== undefined
    ) {
      const published =
        input?.published === true ||
        input?.published === "true" ||
        input?.publicationStatus === "published";

      if (published) {
        update.published_at =
          input?.publishedDate
            ? new Date(
                input.publishedDate
              ).toISOString()
            : new Date().toISOString();
      } else {
        update.published_at = null;
      }
    }

    if (
      Object.keys(update).length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No valid fields were supplied.",
        },
        { status: 400 }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("career_resources")
        .update(update)
        .eq("id", id)
        .select(
          "id,title,slug,body,category,published_at,created_at"
        )
        .single();

    if (error) {
      return NextResponse.json(
        {
          error:
            "Failed to update career resource.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resource: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update resource.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: Context
) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Resource ID is required." },
        { status: 400 }
      );
    }

    const { error } =
      await supabaseAdmin
        .from("career_resources")
        .delete()
        .eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          error:
            "Failed to delete career resource.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete resource.",
      },
      { status: 500 }
    );
  }
}
