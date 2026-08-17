import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
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
        {
          status: 401,
        }
      );
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("resources")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "Resources GET failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to load resources.",
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
        resources: data ?? [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Unexpected resources GET error:",
      error
    );

    return NextResponse.json(
      {
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
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const requiredFields = [
      "title",
      "category",
      "description",
      "content",
      "author",
      "publishedDate",
      "readTime",
    ];

    for (const field of requiredFields) {
      if (
        body[field] ===
          undefined ||
        body[field] === null ||
        String(body[field]).trim() ===
          ""
      ) {
        return NextResponse.json(
          {
            error:
              `Missing required field: ${field}`,
          },
          {
            status: 400,
          }
        );
      }
    }

    const slug =
      String(
        body.slug ??
          body.title
      )
        .toLowerCase()
        .trim()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          "");

    const resource = {
      id:
        body.id ||
        `resource-${Date.now()}`,

      slug,

      title:
        String(
          body.title
        ).trim(),

      category:
        String(
          body.category
        ).trim(),

      description:
        String(
          body.description
        ).trim(),

      content:
        String(
          body.content
        ).trim(),

      author:
        String(
          body.author
        ).trim(),

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

      read_time:
        String(
          body.readTime
        ).trim(),

      featured:
        Boolean(
          body.featured
        ),

      status:
        body.status ||
        "draft",

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
    };

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("resources")
        .insert(resource)
        .select()
        .single();

    if (error) {
      console.error(
        "Resource creation failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to create resource.",
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
        resource: data,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Unexpected resource creation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unexpected server error.",
      },
      {
        status: 500,
      }
    );
  }
}