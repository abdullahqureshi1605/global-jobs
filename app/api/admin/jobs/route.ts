import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getServerSession,
} from "next-auth";

import {
  authOptions,
} from "@/lib/auth";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  checkRateLimit,
} from "@/lib/security/requestGuard";

import {
  rateLimitedResponse,
  securityHeaders,
} from "@/lib/security/apiResponse";

export async function POST(
  request: NextRequest
) {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user) {
    return securityHeaders(
      NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      )
    );
  }

  const rateLimit =
    checkRateLimit({
      request,
      keyPrefix:
        "admin-job-write",
      limit: 20,
      windowMs:
        10 * 60 * 1000,
    });

  if (!rateLimit.allowed) {
    return rateLimitedResponse(
      rateLimit.retryAfterSeconds
    );
  }

  try {
    const body =
      await request.json();

    if (
      !body ||
      typeof body !==
        "object"
    ) {
      return securityHeaders(
        NextResponse.json(
          {
            error:
              "Invalid request.",
          },
          {
            status: 400,
          }
        )
      );
    }

    const requiredFields = [
      "title",
      "company",
      "country",
      "countryCode",
      "city",
      "category",
      "employmentType",
      "workplaceType",
      "experienceLevel",
      "description",
      "sourceName",
      "sourceUrl",
      "applyUrl",
    ];

    for (
      const field of requiredFields
    ) {
      if (
        typeof body[field] !==
          "string" ||
        !body[field].trim()
      ) {
        return securityHeaders(
          NextResponse.json(
            {
              error:
                `${field} is required.`,
            },
            {
              status: 400,
            }
          )
        );
      }
    }

    const safeString =
      (
        value: unknown,
        max: number
      ) =>
        typeof value ===
          "string"
          ? value
              .trim()
              .slice(0, max)
          : "";

    const title =
      safeString(
        body.title,
        200
      );

    const company =
      safeString(
        body.company,
        200
      );

    const country =
      safeString(
        body.country,
        100
      );

    const countryCode =
      safeString(
        body.countryCode,
        10
      ).toUpperCase();

    const city =
      safeString(
        body.city,
        150
      );

    const category =
      safeString(
        body.category,
        150
      );

    const description =
      safeString(
        body.description,
        30_000
      );

    if (
      title.length < 2 ||
      company.length < 2 ||
      country.length < 2 ||
      city.length < 2 ||
      category.length < 2 ||
      description.length < 20
    ) {
      return securityHeaders(
        NextResponse.json(
          {
            error:
              "Some job fields are too short or incomplete.",
          },
          {
            status: 400,
          }
        )
      );
    }

    function stringArray(
      value: unknown,
      maxItems = 50,
      maxLength = 500
    ) {
      if (!Array.isArray(value)) {
        return [];
      }

      return value
        .slice(0, maxItems)
        .filter(
          (item) =>
            typeof item ===
            "string"
        )
        .map(
          (item) =>
            item
              .trim()
              .slice(
                0,
                maxLength
              )
        )
        .filter(Boolean);
    }

    const requirements =
      stringArray(
        body.requirements
      );

    const responsibilities =
      stringArray(
        body.responsibilities
      );

    const benefits =
      stringArray(
        body.benefits
      );

    const response =
      await supabaseAdmin
        .from("jobs")
        .insert({
          ...body,

          title,

          company,

          country,

          countryCode,

          city,

          category,

          description,

          requirements,

          responsibilities,

          benefits,

          subcategory:
            safeString(
              body.subcategory,
              150
            ),

          industry:
            safeString(
              body.industry,
              150
            ),

          employmentType:
            safeString(
              body.employmentType,
              50
            ),

          workplaceType:
            safeString(
              body.workplaceType,
              50
            ),

          experienceLevel:
            safeString(
              body.experienceLevel,
              50
            ),

          sourceName:
            safeString(
              body.sourceName,
              200
            ),

          sourceUrl:
            safeString(
              body.sourceUrl,
              2000
            ),

          applyUrl:
            safeString(
              body.applyUrl,
              2000
            ),
        })
        .select()
        .single();

    if (response.error) {
      console.error(
        "Admin job insert error:",
        response.error
      );

      return securityHeaders(
        NextResponse.json(
          {
            error:
              "Failed to save job.",
          },
          {
            status: 500,
          }
        )
      );
    }

    return securityHeaders(
      NextResponse.json({
        success: true,
        job: response.data,
      })
    );
  } catch (error) {
    console.error(
      "Admin job API error:",
      error
    );

    return securityHeaders(
      NextResponse.json(
        {
          error:
            "Unexpected server error.",
        },
        {
          status: 500,
        }
      )
    );
  }
}