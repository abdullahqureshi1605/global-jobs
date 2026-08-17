import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Job ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error:
            "Failed to load job.",
          details:
            error.message,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Job not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        job: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET job error:",
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

export async function PUT(
  request: Request,
  context: Context
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Job ID is required.",
        },
        { status: 400 }
      );
    }

    const body =
      await request.json();

    const slug =
      body.slug ||
      body.title
        ?.toLowerCase()
        .trim()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          "");

    const update = {
      title:
        String(
          body.title ?? ""
        ).trim(),

      slug,

      company:
        String(
          body.company ?? ""
        ).trim(),

      company_logo:
        body.companyLogo ||
        null,

      country:
        String(
          body.country ?? ""
        ).trim(),

      country_code:
        body.countryCode
          ? String(
              body.countryCode
            )
              .trim()
              .toLowerCase()
          : null,

      city:
        String(
          body.city ?? ""
        ).trim(),

      category:
        String(
          body.category ?? ""
        ).trim(),

      subcategory:
        body.subcategory ||
        null,

      industry:
        body.industry ||
        null,

      employment_type:
        body.employmentType ||
        "Full-time",

      workplace_type:
        body.workplaceType ||
        "On-site",

      experience_level:
        body.experienceLevel ||
        "Entry Level",

      salary_min:
        body.salaryMin === "" ||
        body.salaryMin == null
          ? null
          : Number(
              body.salaryMin
            ),

      salary_max:
        body.salaryMax === "" ||
        body.salaryMax == null
          ? null
          : Number(
              body.salaryMax
            ),

      salary_currency:
        body.salaryCurrency ||
        null,

      salary_period:
        body.salaryPeriod ||
        "year",

      description:
        String(
          body.description ?? ""
        ).trim(),

      requirements:
        Array.isArray(
          body.requirements
        )
          ? body.requirements
          : [],

      responsibilities:
        Array.isArray(
          body.responsibilities
        )
          ? body.responsibilities
          : [],

      benefits:
        Array.isArray(
          body.benefits
        )
          ? body.benefits
          : [],

      source_name:
        body.sourceName ||
        null,

      source_url:
        body.sourceUrl ||
        null,

      apply_url:
        String(
          body.applyUrl ?? ""
        ).trim(),

      date_posted:
        body.datePosted ||
        null,

      closing_date:
        body.closingDate ||
        null,

      last_verified:
        body.lastVerified ||
        null,

      verification_status:
        body.verificationStatus ||
        "unverified",

      status:
        body.status ||
        "draft",

      featured:
        Boolean(
          body.featured
        ),

      updated_at:
        new Date().toISOString(),
    };

    if (
      !update.title ||
      !update.company ||
      !update.country ||
      !update.city ||
      !update.category ||
      !update.description ||
      !update.apply_url
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete all required job fields.",
        },
        { status: 400 }
      );
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("jobs")
        .update(update)
        .eq("id", id)
        .select()
        .single();

    if (error) {
      console.error(
        "Job update failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to update job.",
          details:
            error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        job: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "PUT job error:",
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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Job ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      error,
    } =
      await supabaseAdmin
        .from("jobs")
        .delete()
        .eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          error:
            "Failed to delete job.",
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
      "DELETE job error:",
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