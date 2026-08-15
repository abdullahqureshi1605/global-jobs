import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function cleanString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function requireAdmin() {
  const session =
    await getServerSession(authOptions);

  return session?.user
    ? session
    : null;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requireAdmin();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
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
        {
          status: 400,
        }
      );
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("resources")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error:
            `Failed to load resource: ${error.message}`,
        },
        {
          status: 500,
        }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Resource not found.",
        },
        {
          status: 404,
        }
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
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requireAdmin();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
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
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const title =
      cleanString(body.title);

    const category =
      cleanString(body.category);

    const description =
      cleanString(body.description);

    const content =
      cleanString(body.content);

    const author =
      cleanString(body.author);

    const readTime =
      cleanString(body.readTime);

    if (
      !title ||
      !category ||
      !description ||
      !content ||
      !author ||
      !readTime ||
      !cleanString(
        body.publishedDate
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete all required resource fields.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: currentResource,
      error: currentError,
    } = await supabaseAdmin
      .from("resources")
      .select(
        "id, slug"
      )
      .eq("id", id)
      .maybeSingle();

    if (currentError) {
      return NextResponse.json(
        {
          error:
            `Failed to load current resource: ${currentError.message}`,
        },
        {
          status: 500,
        }
      );
    }

    if (!currentResource) {
      return NextResponse.json(
        {
          error:
            "Resource not found.",
        },
        {
          status: 404,
        }
      );
    }

    const requestedSlug =
      cleanString(body.slug);

    const slug =
      requestedSlug ||
      currentResource.slug ||
      slugify(title);

    if (
      slug !==
      currentResource.slug
    ) {
      const {
        data: slugConflict,
        error: slugError,
      } = await supabaseAdmin
        .from("resources")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();

      if (slugError) {
        return NextResponse.json(
          {
            error:
              `Could not verify resource slug: ${slugError.message}`,
          },
          {
            status: 500,
          }
        );
      }

      if (slugConflict) {
        return NextResponse.json(
          {
            error:
              "Another resource already uses this slug.",
          },
          {
            status: 409,
          }
        );
      }
    }

    const resourceUpdate = {
      slug,

      title,

      category,

      description,

      content,

      author,

      author_role:
        cleanString(
          body.authorRole
        ) || null,

      published_date:
        cleanString(
          body.publishedDate
        ),

      updated_date:
        cleanString(
          body.updatedDate
        ) || null,

      read_time: readTime,

      featured:
        Boolean(
          body.featured
        ),

      status:
        body.status ===
          "published" ||
        body.status ===
          "archived"
          ? body.status
          : "draft",

      seo_title:
        cleanString(
          body.seoTitle
        ) || null,

      seo_description:
        cleanString(
          body.seoDescription
        ) || null,
    };

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("resources")
      .update(
        resourceUpdate
      )
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "Resource update failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            `Failed to update resource: ${error.message}`,
          code:
            error.code ?? null,
          details:
            error.details ?? null,
          hint:
            error.hint ?? null,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Resource updated successfully.",
      resource: data,
    });
  } catch (error) {
    console.error(
      "Unexpected resource update error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update resource.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await requireAdmin();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
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
        {
          status: 400,
        }
      );
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("resources")
      .update({
        status: "archived",
        featured: false,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error:
            `Failed to archive resource: ${error.message}`,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Resource archived successfully.",
      resource: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to archive resource.",
      },
      {
        status: 500,
      }
    );
  }
}