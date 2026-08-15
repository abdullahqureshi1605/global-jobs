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

function toNumberOrNull(value: unknown): number | null {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function toArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);
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

  if (!session?.user) {
    return null;
  }

  return session;
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Returns one complete job for the admin editor.
*/
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireAdmin();

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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Job ID is required.",
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
      .from("jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "Admin job GET error:",
        error
      );

      return NextResponse.json(
        {
          error:
            `Failed to load job: ${error.message}`,
        },
        {
          status: 500,
        }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Job not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      job: data,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/jobs/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load job.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH
|--------------------------------------------------------------------------
| Updates every editable job field.
*/
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireAdmin();

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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Job ID is required.",
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

    const company =
      cleanString(body.company);

    const country =
      cleanString(body.country);

    const countryCode =
      cleanString(body.countryCode);

    const city =
      cleanString(body.city);

    const category =
      cleanString(body.category);

    const description =
      cleanString(body.description);

    const sourceName =
      cleanString(body.sourceName);

    const sourceUrl =
      cleanString(body.sourceUrl);

    const applyUrl =
      cleanString(body.applyUrl);

    if (
      !title ||
      !company ||
      !country ||
      !countryCode ||
      !city ||
      !category ||
      !description ||
      !sourceName ||
      !sourceUrl ||
      !applyUrl
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete all required job fields.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Keep the existing slug when possible.
    |--------------------------------------------------------------------------
    | This is important because changing a published job slug can break
    | existing search-engine URLs and links.
    */
    const {
      data: currentJob,
      error: currentJobError,
    } = await supabaseAdmin
      .from("jobs")
      .select("id, slug, title")
      .eq("id", id)
      .maybeSingle();

    if (currentJobError) {
      return NextResponse.json(
        {
          error:
            `Failed to load current job: ${currentJobError.message}`,
        },
        {
          status: 500,
        }
      );
    }

    if (!currentJob) {
      return NextResponse.json(
        {
          error: "Job not found.",
        },
        {
          status: 404,
        }
      );
    }

    let slug =
      cleanString(body.slug) ||
      currentJob.slug ||
      slugify(title);

    /*
    |--------------------------------------------------------------------------
    | If the admin explicitly changes the slug, check uniqueness.
    |--------------------------------------------------------------------------
    */
    if (
      slug !== currentJob.slug
    ) {
      const {
        data: slugConflict,
        error: slugConflictError,
      } = await supabaseAdmin
        .from("jobs")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();

      if (slugConflictError) {
        return NextResponse.json(
          {
            error:
              `Could not verify job slug: ${slugConflictError.message}`,
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
              "Another job already uses this slug. Please choose a different slug.",
          },
          {
            status: 409,
          }
        );
      }
    }

    const updatedJob = {
      title,

      slug,

      company,

      company_logo:
        cleanString(body.companyLogo),

      country,

      country_code:
        countryCode,

      city,

      category,

      subcategory:
        cleanString(body.subcategory),

      industry:
        cleanString(body.industry),

      employment_type:
        cleanString(
          body.employmentType
        ) || "Full-time",

      workplace_type:
        cleanString(
          body.workplaceType
        ) || "On-site",

      experience_level:
        cleanString(
          body.experienceLevel
        ) || "Entry Level",

      salary_min:
        toNumberOrNull(
          body.salaryMin
        ),

      salary_max:
        toNumberOrNull(
          body.salaryMax
        ),

      salary_currency:
        cleanString(
          body.salaryCurrency
        ),

      salary_period:
        cleanString(
          body.salaryPeriod
        ) || "year",

      description,

      requirements:
        toArray(
          body.requirements
        ),

      responsibilities:
        toArray(
          body.responsibilities
        ),

      benefits:
        toArray(
          body.benefits
        ),

      source_name:
        sourceName,

      source_url:
        sourceUrl,

      apply_url:
        applyUrl,

      date_posted:
        cleanString(
          body.datePosted
        ) || null,

      closing_date:
        cleanString(
          body.closingDate
        ) || null,

      last_verified:
        cleanString(
          body.lastVerified
        ) || null,

      verification_status:
        cleanString(
          body.verificationStatus
        ) || "unverified",

      status:
        body.status === "published" ||
        body.status === "archived"
          ? body.status
          : "draft",

      featured:
        Boolean(body.featured),
    };

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .update(updatedJob)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error(
        "Supabase job update error:",
        error
      );

      return NextResponse.json(
        {
          error:
            `Failed to update job: ${error.message}`,
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
        "Job updated successfully.",
      job: data,
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/jobs/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update job.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
| We don't physically delete the job by default.
| We archive it instead.
|--------------------------------------------------------------------------
*/
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireAdmin();

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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Job ID is required.",
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
      .from("jobs")
      .update({
        status: "archived",
        featured: false,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error(
        "Supabase job archive error:",
        error
      );

      return NextResponse.json(
        {
          error:
            `Failed to archive job: ${error.message}`,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Job archived successfully.",
      job: data,
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/jobs/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to archive job.",
      },
      {
        status: 500,
      }
    );
  }
}