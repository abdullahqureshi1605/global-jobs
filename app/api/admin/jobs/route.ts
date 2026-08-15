import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomUUID } from "node:crypto";

import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

function cleanString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function nullableString(value: unknown): string | null {
  const cleaned = cleanString(value);
  return cleaned || null;
}

function numberValue(value: unknown): number | null {
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

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(
  date: Date,
  days: number
): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return dateOnly(result);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title = cleanString(body.title);
    const company = cleanString(body.company);
    const country = cleanString(body.country);
    const countryCode =
      cleanString(body.countryCode);
    const city = cleanString(body.city);
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
        { status: 400 }
      );
    }

    const baseSlug = slugify(title);

    if (!baseSlug) {
      return NextResponse.json(
        {
          error:
            "Unable to create a valid slug from the job title.",
        },
        { status: 400 }
      );
    }

    let slug = baseSlug;

    const { data: existingJob, error: slugError } =
      await supabaseAdmin
        .from("jobs")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

    if (slugError) {
      return NextResponse.json(
        {
          error:
            `Slug check failed: ${slugError.message}`,
        },
        { status: 500 }
      );
    }

    if (existingJob) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    const today = new Date();

    const datePosted =
      cleanString(body.datePosted) ||
      dateOnly(today);

    const closingDate =
      cleanString(body.closingDate) ||
      addDays(today, 30);

    const lastVerified =
      cleanString(body.lastVerified) ||
      dateOnly(today);

    const jobRecord = {
      id: randomUUID(),

      title,

      slug,

      company,

      company_logo:
        cleanString(body.companyLogo),

      country,

      country_code: countryCode,

      city,

      category,

      subcategory:
        cleanString(body.subcategory),

      industry:
        cleanString(body.industry),

      employment_type:
        cleanString(body.employmentType) ||
        "Full-time",

      workplace_type:
        cleanString(body.workplaceType) ||
        "On-site",

      experience_level:
        cleanString(body.experienceLevel) ||
        "Entry Level",

      salary_min:
        numberValue(body.salaryMin),

      salary_max:
        numberValue(body.salaryMax),

      salary_currency:
        cleanString(body.salaryCurrency),

      salary_period:
        cleanString(body.salaryPeriod) ||
        "year",

      description,

      requirements:
        Array.isArray(body.requirements)
          ? body.requirements
          : [],

      responsibilities:
        Array.isArray(body.responsibilities)
          ? body.responsibilities
          : [],

      benefits:
        Array.isArray(body.benefits)
          ? body.benefits
          : [],

      source_name: sourceName,

      source_url: sourceUrl,

      apply_url: applyUrl,

      date_posted: datePosted,

      closing_date: closingDate,

      last_verified: lastVerified,

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

    const { data, error } =
      await supabaseAdmin
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
          code: error.code ?? null,
          details: error.details ?? null,
          hint: error.hint ?? null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Job saved successfully.",
        job: data,
      },
      { status: 201 }
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
      { status: 500 }
    );
  }
}