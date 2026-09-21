import { createClient } from "@/lib/supabase-server";

export type JobCompany = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  verification_status: string;
};

export type JobCountry = {
  id: string;
  name: string;
  code: string;
};

export type JobCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

export type Job = {
  id: string;
  raw_job_id: string;
  title: string;
  slug: string;
  description: string;
  summary: string | null;
  skills: string[];
  city: string | null;
  work_mode: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  apply_url: string | null;
  source: string | null;
  status: string;
  posted_at: string | null;
  created_at: string;
  companies: JobCompany | JobCompany[] | null;
  countries: JobCountry | JobCountry[] | null;
  categories: JobCategory | JobCategory[] | null;

  // SEO metadata. Used only by server-side metadata/structured data.
  meta_title: string | null;
  meta_description: string | null;
  seo_keywords: string[];
  application_job_id: string | null;
  responsibilities: string[];
  requirements: string[];
  additional_information: string[];
};

type JobContentRow = {
  id: string;
  raw_job_id: string;
  title: string;
  summary: string | null;
  detailed_description: string | null;
  skills: string[] | null;
  company_name: string | null;
  category_label: string | null;
  category_tag: string | null;
  location_display: string | null;
  salary_min: number | null;
  salary_max: number | null;
  contract_type: string | null;
  contract_time: string | null;
  source: string | null;
  redirect_url: string | null;
  published_at: string | null;
  created_at: string | null;
  public_slug: string | null;
  application_job_id: string | null;
  responsibilities: string[];
  requirements: string[];
  additional_information: string[];
  meta_title: string | null;
  meta_description: string | null;
  seo_keywords: string[] | null;
};

function makeSlug(row: JobContentRow): string {
  if (row.public_slug) {
    return row.public_slug;
  }

  const base = row.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = row.raw_job_id.replace(/-/g, "").slice(0, 12);

  return base ? `${base}-${suffix}` : `job-${suffix}`;
}

function toJob(row: JobContentRow): Job {
  const locationParts = (row.location_display || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const city = locationParts[0] || null;

  return {
    id: row.id,
    raw_job_id: row.raw_job_id,
    title: row.title,
    slug: makeSlug(row),
    description: row.detailed_description || row.summary || "",
    summary: row.summary,
    skills: Array.isArray(row.skills) ? row.skills : [],
    city,
    work_mode: null,
    employment_type: row.contract_type || row.contract_time || null,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    currency: null,
    apply_url: row.redirect_url,
    source: row.source,
    application_job_id: row.application_job_id,
    responsibilities: row.responsibilities ?? [],
    requirements: row.requirements ?? [],
    additional_information: row.additional_information ?? [],
    status: "published",
    posted_at: row.published_at,
    created_at: row.created_at || row.published_at || new Date(0).toISOString(),
    companies: row.company_name
      ? {
          id: `company-${row.id}`,
          name: row.company_name,
          slug: row.company_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
          logo_url: null,
          verification_status: "unverified",
        }
      : null,
    countries: null,
    categories: row.category_label
      ? {
          id: `category-${row.id}`,
          name: row.category_label,
          slug: (row.category_tag || row.category_label)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
          icon: null,
        }
      : null,

    meta_title: row.meta_title,
    meta_description: row.meta_description,
    seo_keywords: Array.isArray(row.seo_keywords)
      ? row.seo_keywords
      : [],
  };
}

async function buildQuery(search = "", location = "", limit = 50, category = "") {
  const supabase = await createClient();

  let query = supabase
    .from("job_content")
    .select(`
      id,
      raw_job_id,
      title,
      summary,
      detailed_description,
      skills,
      company_name,
      category_label,
      category_tag,
      location_display,
      salary_min,
      salary_max,
      contract_type,
      contract_time,
      source,
      redirect_url,
      published_at,
      created_at,
      public_slug,
      application_job_id,
      responsibilities,
      requirements,
      additional_information,
      meta_title,
      meta_description,
      seo_keywords
    `)
    .eq("quality_status", "approved")
    .eq("publication_status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (search.trim()) {
    const term = search.trim().replace(/[%_]/g, "");
    query = query.or(
      `title.ilike.%${term}%,summary.ilike.%${term}%,detailed_description.ilike.%${term}%`,
    );
  }

  if (category.trim()) {
    const categoryTerm = category.trim().replace(/[%_]/g, "");
    query = query.eq("category_tag", categoryTerm);
  }

  if (location.trim()) {
    const term = location.trim().replace(/[%_]/g, "");
    query = query.ilike("location_display", `%${term}%`);
  }

  return query;
}

export async function getLatestJobs(limit = 12): Promise<Job[]> {
  const query = await buildQuery("", "", limit);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load jobs: ${error.message}`);
  }

  return (data ?? []).map((row) => toJob(row as JobContentRow));
}

export async function getPublishedJobs(
  search = "",
  location = "",
  limit = 50,
  category = "",
): Promise<Job[]> {
  const query = await buildQuery(search, location, limit, category);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load published jobs: ${error.message}`);
  }

  return (data ?? []).map((row) => toJob(row as JobContentRow));
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("job_content")
    .select(`
      id,
      raw_job_id,
      title,
      summary,
      detailed_description,
      skills,
      company_name,
      category_label,
      category_tag,
      location_display,
      salary_min,
      salary_max,
      contract_type,
      contract_time,
      source,
      redirect_url,
      published_at,
      created_at,
      public_slug,
      application_job_id,
      responsibilities,
      requirements,
      additional_information,
      meta_title,
      meta_description,
      seo_keywords
    `)
    .eq("quality_status", "approved")
    .eq("publication_status", "published")
    .eq("public_slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load job: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return toJob(data as JobContentRow);
}
