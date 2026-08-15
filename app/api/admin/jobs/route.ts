import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

function toNullableString(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

function toNullableNumber(
  value: unknown
): number | null {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const numberValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
}

function slugify(
  value: string
): string {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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
          error:
            "Unauthorized. Please log in again.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    if (
      !body.title ||
      !body.company ||
      !body.country ||
      !body.countryCode ||
      !body.city ||
      !body.category ||
      !body.description ||
      !body.sourceName ||
      !body.sourceUrl ||
      !body.applyUrl
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

    const title =
      String(body.title).trim();

    const baseSlug =
      slugify(title);

    if (!baseSlug) {
      return NextResponse.json(
        {
          error:
            "Unable to create a valid job slug from the title.",
        },
        {
          status: 400,
        }
      );
    }

    let slug = baseSlug;

    const {
      data: existingJob,
      error:
        existingJobError,
    } = await supabaseAdmin
      .from("jobs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingJobError) {
      console.error(
        "Slug lookup error:",
        existingJobError
      );

      return NextResponse.json(
        {
          error:
            `Could not verify job slug: ${existingJobError.message}`,
        },
        {
          status: 500,
        }
      );
    }

    if (existingJob) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    const jobRecord = {
        id: randomUUID(),
      
      title,

      slug,

      company:
        String(body.company).trim(),

      company_logo:
        toNullableString(
        body.companyLogo
            ) ?? "",

      country:
        String(body.country).trim(),

      country_code:
        String(
          body.countryCode
        ).trim(),

      city:
        String(body.city).trim(),

      category:
        String(body.category).trim(),

      subcategory:
        toNullableString(
          body.subcategory
        ),

      industry:
        toNullableString(
          body.industry
        ),

      employment_type:
        toNullableString(
          body.employmentType
        ),

      workplace_type:
        toNullableString(
          body.workplaceType
        ),

      experience_level:
        toNullableString(
          body.experienceLevel
        ),

      salary_min:
        toNullableNumber(
          body.salaryMin
        ),

      salary_max:
        toNullableNumber(
          body.salaryMax
        ),

      salary_currency:
        toNullableString(
          body.salaryCurrency
        ),

      salary_period:
        toNullableString(
          body.salaryPeriod
        ),

      description:
        String(
          body.description
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
        String(
          body.sourceName
        ).trim(),

      source_url:
        String(
          body.sourceUrl
        ).trim(),

      apply_url:
        String(
          body.applyUrl
        ).trim(),

      date_posted:
        toNullableString(
          body.datePosted
        ),

      closing_date:
        toNullableString(
          body.closingDate
        ),

      last_verified:
        toNullableString(
          body.lastVerified
        ),

      verification_status:
        toNullableString(
          body.verificationStatus
        ) ??
        "unverified",

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
      .insert(jobRecord)
      .select("*")
      .single();

    if (error) {
      console.error(
        "Supabase job insert error:",
        error
      );

      return NextResponse.json(
        {
          error:
            `Failed to save job: ${error.message}`,
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

    return NextResponse.json(
      {
        success: true,
        message:
          "Job saved successfully.",
        job: data,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/jobs error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save job.",
      },
      {
        status: 500,
      }
    );
  }
}