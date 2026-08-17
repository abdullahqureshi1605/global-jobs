import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(
      authOptions
    );

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Resource ID is required.",
        },
        { status: 400 }
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("resources")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
      console.error(
        "Resource GET failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load resource.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Resource not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        resource: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Unexpected resource GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(
      authOptions
    );

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Resource ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const title = String(
      body.title ?? ""
    ).trim();

    const category = String(
      body.category ?? ""
    ).trim();

    const description = String(
      body.description ?? ""
    ).trim();

    const content = String(
      body.content ?? ""
    ).trim();

    const author = String(
      body.author ?? ""
    ).trim();

    const readTime = String(
      body.readTime ?? ""
    ).trim();

    if (
      !title ||
      !category ||
      !description ||
      !content ||
      !author ||
      !readTime ||
      !body.publishedDate
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please complete all required resource fields.",
        },
        { status: 400 }
      );
    }

    const slug =
      String(
        body.slug ?? ""
      ).trim() ||
      makeSlug(title);

    const update = {
      title,
      slug,
      category,

      description,
      content,

      author,

      author_role:
        body.authorRole
          ? String(
              body.authorRole
            ).trim()
          : null,

      published_date:
        body.publishedDate,

      updated_date:
        body.updatedDate ||
        null,

      read_time: readTime,

      featured:
        Boolean(body.featured),

      status:
        body.status || "draft",

      seo_title:
        body.seoTitle
          ? String(
              body.seoTitle
            ).trim()
          : null,

      seo_description:
        body.seoDescription
          ? String(
              body.seoDescription
            ).trim()
          : null,

      updated_at:
        new Date().toISOString(),
    };

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("resources")
        .update(update)
        .eq("id", id)
        .select()
        .single();

    if (error) {
      console.error(
        "Resource PUT failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to update resource.",
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
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Unexpected resource PUT error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(
      authOptions
    );

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Resource ID is required.",
        },
        { status: 400 }
      );
    }

    const { error } =
      await supabaseAdmin
        .from("resources")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(
        "Resource DELETE failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to delete resource.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Unexpected resource DELETE error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}