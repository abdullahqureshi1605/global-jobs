import {
  unstable_cache,
} from "next/cache";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { Job } from "@/types/job";

function mapJob(
  row: any
): Job {
  return {
    id: row.id ?? "",
    title: row.title ?? "",
    slug: row.slug ?? "",
    company: row.company ?? "",

    companyLogo:
      row.company_logo ??
      row.companyLogo ??
      "",

    country:
      row.country ?? "",

    countryCode:
      row.country_code ??
      row.countryCode ??
      "",

    city:
      row.city ?? "",

    category:
      row.category ?? "",

    subcategory:
      row.subcategory ?? "",

    industry:
      row.industry ?? "",

    employmentType:
      row.employment_type ??
      row.employmentType ??
      "",

    workplaceType:
      row.workplace_type ??
      row.workplaceType ??
      "",

    experienceLevel:
      row.experience_level ??
      row.experienceLevel ??
      "",

    salaryMin:
      row.salary_min ??
      row.salaryMin ??
      null,

    salaryMax:
      row.salary_max ??
      row.salaryMax ??
      null,

    salaryCurrency:
      row.salary_currency ??
      row.salaryCurrency ??
      "",

    salaryPeriod:
      row.salary_period ??
      row.salaryPeriod ??
      "",

    description:
      row.description ?? "",

    requirements:
      Array.isArray(
        row.requirements
      )
        ? row.requirements
        : [],

    responsibilities:
      Array.isArray(
        row.responsibilities
      )
        ? row.responsibilities
        : [],

    benefits:
      Array.isArray(
        row.benefits
      )
        ? row.benefits
        : [],

    sourceName:
      row.source_name ??
      row.sourceName ??
      "",

    sourceUrl:
      row.source_url ??
      row.sourceUrl ??
      "",

    applyUrl:
      row.apply_url ??
      row.applyUrl ??
      "",

    datePosted:
      row.date_posted ??
      row.datePosted ??
      "",

    closingDate:
      row.closing_date ??
      row.closingDate ??
      "",

    lastVerified:
      row.last_verified ??
      row.lastVerified ??
      "",

    verificationStatus:
      row.verification_status ??
      row.verificationStatus ??
      "unverified",

    status:
      row.status ??
      "draft",

    featured:
      Boolean(
        row.featured
      ),
  };
}

const getCachedLatestJobs =
  unstable_cache(
    async () => {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from("jobs")
          .select(
            `
            id,
            title,
            slug,
            company,
            company_logo,
            country,
            country_code,
            city,
            category,
            workplace_type,
            salary_min,
            salary_max,
            salary_currency,
            description,
            featured
            `
          )
          .eq(
            "status",
            "published"
          )
          .order(
            "date_posted",
            {
              ascending: false,
            }
          )
          .limit(6);

      if (error) {
        throw new Error(
          `Failed to load latest jobs: ${error.message}`
        );
      }

      return (
        data ?? []
      ).map(
        mapJob
      );
    },
    [
      "horizon-latest-jobs",
    ],
    {
      revalidate: 30,
    }
  );

const getCachedCountryCounts =
  unstable_cache(
    async () => {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from("jobs")
          .select(
            "country"
          )
          .eq(
            "status",
            "published"
          );

      if (error) {
        throw new Error(
          `Failed to load country counts: ${error.message}`
        );
      }

      const counts =
        new Map<
          string,
          number
        >();

      for (const row of
        data ?? []) {
        const country =
          typeof row.country ===
          "string"
            ? row.country.trim()
            : "";

        if (!country) {
          continue;
        }

        counts.set(
          country,
          (
            counts.get(
              country
            ) ?? 0
          ) + 1
        );
      }

      return Array.from(
        counts.entries()
      );
    },
    [
      "horizon-country-counts",
    ],
    {
      revalidate: 60,
    }
  );

const getCachedCategoryCounts =
  unstable_cache(
    async () => {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from("jobs")
          .select(
            "category"
          )
          .eq(
            "status",
            "published"
          );

      if (error) {
        throw new Error(
          `Failed to load category counts: ${error.message}`
        );
      }

      const counts =
        new Map<
          string,
          number
        >();

      for (const row of
        data ?? []) {
        const category =
          typeof row.category ===
          "string"
            ? row.category.trim()
            : "";

        if (!category) {
          continue;
        }

        counts.set(
          category,
          (
            counts.get(
              category
            ) ?? 0
          ) + 1
        );
      }

      return Array.from(
        counts.entries()
      );
    },
    [
      "horizon-category-counts",
    ],
    {
      revalidate: 60,
    }
  );

const getCachedCountryJobs =
  (country: string) =>
    unstable_cache(
      async () => {
        const {
          data,
          error,
        } =
          await supabaseAdmin
            .from("jobs")
            .select(
              `
              id,
              title,
              slug,
              company,
              company_logo,
              country,
              country_code,
              city,
              category,
              employment_type,
              workplace_type,
              experience_level,
              salary_min,
              salary_max,
              salary_currency,
              salary_period,
              description,
              featured,
              date_posted
              `
            )
            .eq(
              "status",
              "published"
            )
            .ilike(
              "country",
              country
            )
            .order(
              "date_posted",
              {
                ascending: false,
              }
            )
            .limit(60);

        if (error) {
          throw new Error(
            `Failed to load country jobs: ${error.message}`
          );
        }

        return (
          data ?? []
        ).map(
          mapJob
        );
      },
      [
        "horizon-country-jobs",
        country.toLowerCase(),
      ],
      {
        revalidate: 30,
      }
    )();

const getCachedCategoryJobs =
  (category: string) =>
    unstable_cache(
      async () => {
        const {
          data,
          error,
        } =
          await supabaseAdmin
            .from("jobs")
            .select(
              `
              id,
              title,
              slug,
              company,
              company_logo,
              country,
              country_code,
              city,
              category,
              employment_type,
              workplace_type,
              experience_level,
              salary_min,
              salary_max,
              salary_currency,
              salary_period,
              description,
              featured,
              date_posted
              `
            )
            .eq(
              "status",
              "published"
            )
            .ilike(
              "category",
              category
            )
            .order(
              "date_posted",
              {
                ascending: false,
              }
            )
            .limit(60);

        if (error) {
          throw new Error(
            `Failed to load category jobs: ${error.message}`
          );
        }

        return (
          data ?? []
        ).map(
          mapJob
        );
      },
      [
        "horizon-category-jobs",
        category.toLowerCase(),
      ],
      {
        revalidate: 30,
      }
    )();

export class JobService {
  static async getAllJobs(): Promise<Job[]> {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("jobs")
        .select("*")
        .order(
          "date_posted",
          {
            ascending: false,
          }
        );

    if (error) {
      throw new Error(
        `Failed to load jobs: ${error.message}`
      );
    }

    return (
      data ?? []
    ).map(
      mapJob
    );
  }

  static async getPublishedJobs(
    limit = 60
  ): Promise<Job[]> {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq(
          "status",
          "published"
        )
        .order(
          "date_posted",
          {
            ascending: false,
          }
        )
        .limit(
          Math.min(
            Math.max(
              limit,
              1
            ),
            100
          )
        );

    if (error) {
      throw new Error(
        `Failed to load published jobs: ${error.message}`
      );
    }

    return (
      data ?? []
    ).map(
      mapJob
    );
  }

  static async getLatestPublishedJobs(
    limit = 6
  ): Promise<Job[]> {
    const jobs =
      await getCachedLatestJobs();

    return jobs.slice(
      0,
      Math.min(
        Math.max(
          limit,
          1
        ),
        6
      )
    );
  }

  static async getPublishedCountryCounts(): Promise<
    Map<string, number>
  > {
    return new Map(
      await getCachedCountryCounts()
    );
  }

  static async getPublishedCategoryCounts(): Promise<
    Map<string, number>
  > {
    return new Map(
      await getCachedCategoryCounts()
    );
  }

  static async getJobsByCountry(
    country: string
  ): Promise<Job[]> {
    return getCachedCountryJobs(
      country
    );
  }

  static async getJobsByCategory(
    category: string
  ): Promise<Job[]> {
    return getCachedCategoryJobs(
      category
    );
  }

  static async getJobsByCountryAndCategory(
    country: string,
    category: string
  ): Promise<Job[]> {
    const cacheKey =
      unstable_cache(
        async () => {
          const {
            data,
            error,
          } =
            await supabaseAdmin
              .from("jobs")
              .select(
                `
                id,
                title,
                slug,
                company,
                company_logo,
                country,
                country_code,
                city,
                category,
                employment_type,
                workplace_type,
                experience_level,
                salary_min,
                salary_max,
                salary_currency,
                salary_period,
                description,
                featured,
                date_posted
                `
              )
              .eq(
                "status",
                "published"
              )
              .ilike(
                "country",
                country
              )
              .ilike(
                "category",
                category
              )
              .order(
                "date_posted",
                {
                  ascending:
                    false,
                }
              )
              .limit(60);

          if (error) {
            throw new Error(
              `Failed to load jobs: ${error.message}`
            );
          }

          return (
            data ?? []
          ).map(
            mapJob
          );
        },
        [
          "horizon-country-category-jobs",
          country.toLowerCase(),
          category.toLowerCase(),
        ],
        {
          revalidate: 30,
        }
      );

    return cacheKey();
  }

  static async getJobBySlug(
    slug: string
  ): Promise<Job | null> {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq(
          "slug",
          slug
        )
        .eq(
          "status",
          "published"
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to load job: ${error.message}`
      );
    }

    return data
      ? mapJob(data)
      : null;
  }

  static async getRemoteJobs(
    limit = 30
  ): Promise<Job[]> {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq(
          "status",
          "published"
        )
        .ilike(
          "workplace_type",
          "Remote"
        )
        .order(
          "date_posted",
          {
            ascending: false,
          }
        )
        .limit(
          Math.min(
            Math.max(
              limit,
              1
            ),
            50
          )
        );

    if (error) {
      throw new Error(
        `Failed to load remote jobs: ${error.message}`
      );
    }

    return (
      data ?? []
    ).map(
      mapJob
    );
  }
}