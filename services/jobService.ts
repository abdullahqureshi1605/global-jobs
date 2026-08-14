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
      row.status ?? "draft",

    featured:
      Boolean(row.featured),
  };
}

export class JobService {
  static async getAllJobs(): Promise<Job[]> {
    const { data, error } =
      await supabaseAdmin
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

  static async getPublishedJobs(): Promise<Job[]> {
    const { data, error } =
      await supabaseAdmin
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

  static async getJobBySlug(
    slug: string
  ): Promise<Job | null> {
    const { data, error } =
      await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to load job: ${error.message}`
      );
    }

    return data ? mapJob(data) : null;
  }

  static async getJobsByCountry(
    country: string
  ): Promise<Job[]> {
    const { data, error } =
      await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("status", "published")
        .ilike("country", country)
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

  static async getJobsByCategory(
    category: string
  ): Promise<Job[]> {
    const { data, error } =
      await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("status", "published")
        .ilike("category", category)
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

  static async getRemoteJobs(): Promise<Job[]> {
    const { data, error } =
      await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("status", "published")
        .ilike("workplace_type", "Remote")
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