import { createClient } from "@/lib/supabase/server";
import { Job } from "@/types/job";

function mapJob(row: any): Job {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    company: row.company,
    companyLogo: row.company_logo || "",
    country: row.country,
    countryCode: row.country_code,
    city: row.city,
    category: row.category,
    subcategory: row.subcategory || "",
    industry: row.industry || "",

    employmentType: row.employment_type,
    workplaceType: row.workplace_type,
    experienceLevel: row.experience_level,

    salaryMin: row.salary_min ?? 0,
    salaryMax: row.salary_max ?? 0,
    salaryCurrency: row.salary_currency || "",
    salaryPeriod: row.salary_period || "year",

    description: row.description,

    requirements: row.requirements || [],
    responsibilities: row.responsibilities || [],
    benefits: row.benefits || [],

    sourceName: row.source_name,
    sourceUrl: row.source_url,
    applyUrl: row.apply_url,

    datePosted: row.date_posted,
    closingDate: row.closing_date || "",
    lastVerified: row.last_verified || "",

    verificationStatus: row.verification_status,
    status: row.status,

    featured: row.featured ?? false,
  };
}

export class JobService {
  static async getPublishedJobs(): Promise<Job[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "published")
      .order("date_posted", {
        ascending: false,
      });

    if (error) {
      console.error("Failed to fetch published jobs:", error);
      return [];
    }

    return (data || []).map(mapJob);
  }

  static async getAllJobs(): Promise<Job[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Failed to fetch jobs:", error);
      return [];
    }

    return (data || []).map(mapJob);
  }

  static async getJobBySlug(
    slug: string
  ): Promise<Job | undefined> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch job:", error);
      return undefined;
    }

    return data ? mapJob(data) : undefined;
  }

  static async getJobsByCountry(
    countryName: string
  ): Promise<Job[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("country", countryName)
      .eq("status", "published")
      .order("date_posted", {
        ascending: false,
      });

    if (error) {
      console.error("Failed to fetch country jobs:", error);
      return [];
    }

    return (data || []).map(mapJob);
  }

  static async getJobsByCategory(
    categoryName: string
  ): Promise<Job[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("category", categoryName)
      .eq("status", "published")
      .order("date_posted", {
        ascending: false,
      });

    if (error) {
      console.error("Failed to fetch category jobs:", error);
      return [];
    }

    return (data || []).map(mapJob);
  }

  static async getJobsByCountryAndCategory(
    countryName: string,
    categoryName: string
  ): Promise<Job[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("country", countryName)
      .eq("category", categoryName)
      .eq("status", "published")
      .order("date_posted", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Failed to fetch country/category jobs:",
        error
      );

      return [];
    }

    return (data || []).map(mapJob);
  }

  static async getRemoteJobs(): Promise<Job[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("workplace_type", "Remote")
      .eq("status", "published")
      .order("date_posted", {
        ascending: false,
      });

    if (error) {
      console.error("Failed to fetch remote jobs:", error);
      return [];
    }

    return (data || []).map(mapJob);
  }
}