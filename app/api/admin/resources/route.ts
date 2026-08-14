import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

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
      if (!body[field]) {
        return NextResponse.json(
          {
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    const slug = body.slug ||
      body.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const resource = {
      id: body.id || `resource-${Date.now()}`,
      slug,

      title: body.title.trim(),
      category: body.category.trim(),

      description: body.description.trim(),
      content: body.content.trim(),

      author: body.author.trim(),
      author_role: body.authorRole?.trim() || null,

      published_date: body.publishedDate,
      updated_date: body.updatedDate || null,

      read_time: body.readTime.trim(),

      featured: Boolean(body.featured),

      status: body.status || "draft",

      seo_title:
        body.seoTitle?.trim() || null,

      seo_description:
        body.seoDescription?.trim() || null,
    };

    const { data, error } = await supabaseAdmin
      .from("resources")
      .insert(resource)
      .select()
      .single();

    if (error) {
      console.error("Resource creation failed:", error);

      return NextResponse.json(
        {
          error: "Failed to create resource.",
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
      "Unexpected resource creation error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}