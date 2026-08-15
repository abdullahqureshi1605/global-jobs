import { unstable_cache } from "next/cache";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { Job } from "@/types/job";

function mapJob(row: any): Job {
  return {
    id: row.id ?? "",

    title: row.title ?? "",

    slug: row.slug ?? "",

    company: row.company ?? "",

    companyLogo:
      row.company_logo ??
      row.companyLogo ??
      "",

    country: row.country ?? "",

    countryCode:
      row.country_code ??
      row.countryCode ??
      "",

    city: row.city ?? "",

    category: row.category ?? "",

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
      Array.isArray(row.requirements)
        ? row.requirements
        : [],

    responsibilities:
      Array.isArray(row.responsibilities)
        ? row.responsibilities
        : [],

    benefits:
      Array.isArray(row.benefits)
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
      Boolean(row.featured),
  };
}

type CachedJobQuery = () => Promise<Job[]>;

/*
|--------------------------------------------------------------------------
| ALL JOBS
|--------------------------------------------------------------------------
*/

export class JobService {
  static async getAllJobs(): Promise<Job[]> {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .order("date_posted", {
        ascending: false,
      });

    if (error) {
      throw new Error(
        `Failed to load jobs: ${error.message}`
      );
    }

    return (data ?? []).map(mapJob);
  }

  /*
  |--------------------------------------------------------------------------
  | PUBLISHED JOBS
  |--------------------------------------------------------------------------
  */

  static async getPublishedJobs(): Promise<Job[]> {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .order("date_posted", {
        ascending: false,
      });

    if (error) {
      throw new Error(
        `Failed to load published jobs: ${error.message}`
      );
    }

    return (data ?? []).map(mapJob);
  }

  /*
  |--------------------------------------------------------------------------
  | LATEST PUBLISHED JOBS
  |--------------------------------------------------------------------------
  |
  | For homepage/featured/latest sections.
  | This avoids loading every published job when only a few are needed.
  |--------------------------------------------------------------------------
  */

  static async getLatestPublishedJobs(
    limit = 12
  ): Promise<Job[]> {
    const safeLimit = Math.max(
      1,
      Math.min(
        Math.floor(limit),
        50
      )
    );

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .order("date_posted", {
        ascending: false,
      })
      .limit(safeLimit);

    if (error) {
      throw new Error(
        `Failed to load latest jobs: ${error.message}`
      );
    }

    return (data ?? []).map(mapJob);
  }

  /*
  |--------------------------------------------------------------------------
  | FEATURED PUBLISHED JOBS
  |--------------------------------------------------------------------------
  */

  static async getFeaturedJobs(
    limit = 6
  ): Promise<Job[]> {
    const safeLimit = Math.max(
      1,
      Math.min(
        Math.floor(limit),
        30
      )
    );

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .eq("featured", true)
      .order("date_posted", {
        ascending: false,
      })
      .limit(safeLimit);

    if (error) {
      throw new Error(
        `Failed to load featured jobs: ${error.message}`
      );
    }

    return (data ?? []).map(mapJob);
  }

  /*
  |--------------------------------------------------------------------------
  | LIGHTWEIGHT CATEGORY COUNTS
  |--------------------------------------------------------------------------
  */

  static async getPublishedCategoryCounts(): Promise<
    Map<string, number>
  > {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("category")
      .eq("status", "published");

    if (error) {
      throw new Error(
        `Failed to load category counts: ${error.message}`
      );
    }

    const counts =
      new Map<string, number>();

    for (const row of data ?? []) {
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
        (counts.get(category) ?? 0) +
          1
      );
    }

    return counts;
  }

  /*
  |--------------------------------------------------------------------------
  | LIGHTWEIGHT COUNTRY COUNTS
  |--------------------------------------------------------------------------
  */

  static async getPublishedCountryCounts(): Promise<
    Map<string, number>
  > {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("country")
      .eq("status", "published");

    if (error) {
      throw new Error(
        `Failed to load country counts: ${error.message}`
      );
    }

    const counts =
      new Map<string, number>();

    for (const row of data ?? []) {
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
        (counts.get(country) ?? 0) +
          1
      );
    }

    return counts;
  }

  /*
  |--------------------------------------------------------------------------
  | SINGLE JOB
  |--------------------------------------------------------------------------
  */

  static async getJobBySlug(
    slug: string
  ): Promise<Job | null> {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("slug", slug)
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

  /*
  |--------------------------------------------------------------------------
  | JOBS BY COUNTRY
  |--------------------------------------------------------------------------
  */

  static async getJobsByCountry(
    country: string
  ): Promise<Job[]> {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .eq("country", country)
      .order("date_posted", {
        ascending: false,
      });

    if (error) {
      throw new Error(
        `Failed to load country jobs: ${error.message}`
      );
    }

    return (data ?? []).map(mapJob);
  }

  /*
  |--------------------------------------------------------------------------
  | JOBS BY CATEGORY
  |--------------------------------------------------------------------------
  */

  static async getJobsByCategory(
    category: string
  ): Promise<Job[]> {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .eq("category", category)
      .order("date_posted", {
        ascending: false,
      });

    if (error) {
      throw new Error(
        `Failed to load category jobs: ${error.message}`
      );
    }

    return (data ?? []).map(mapJob);
  }

  /*
  |--------------------------------------------------------------------------
  | COUNTRY + CATEGORY
  |--------------------------------------------------------------------------
  */

  static async getJobsByCountryAndCategory(
    country: string,
    category: string
  ): Promise<Job[]> {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .eq("country", country)
      .eq("category", category)
      .order("date_posted", {
        ascending: false,
      });

    if (error) {
      throw new Error(
        `Failed to load country/category jobs: ${error.message}`
      );
    }

    return (data ?? []).map(mapJob);
  }

  /*
  |--------------------------------------------------------------------------
  | REMOTE JOBS
  |--------------------------------------------------------------------------
  */

  static async getRemoteJobs(): Promise<Job[]> {
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .eq("workplace_type", "Remote")
      .order("date_posted", {
        ascending: false,
      });

    if (error) {
      throw new Error(
        `Failed to load remote jobs: ${error.message}`
      );
    }

    return (data ?? []).map(mapJob);
  }
}