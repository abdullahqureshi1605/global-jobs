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

export function detectCountryCode(location: string | null): string | null {
  const value = String(location || "").trim().toLowerCase();

  if (!value) return null;

  const countryPatterns: Array<[RegExp, string]> = [
    [/\b(united states|united states of america|usa|u\.s\.a\.|u\.s\.|liberty lake|spokane county|washington|wa)\b/i, "us"],
    [/\b(united kingdom|great britain|uk|u\.k\.)\b/i, "gb"],
    [/\b(australia|aus)\b/i, "au"],
    [/\b(canada|can)\b/i, "ca"],
    [/\b(new zealand|nz)\b/i, "nz"],
    [/\b(india|ind)\b/i, "in"],
    [/\b(pakistan|pak)\b/i, "pk"],
    [/\b(philippines|ph)\b/i, "ph"],
    [/\b(singapore|sg)\b/i, "sg"],
    [/\b(malaysia|mys)\b/i, "my"],
    [/\b(united arab emirates|uae|u\.a\.e\.)\b/i, "ae"],
    [/\b(saudi arabia|ksa)\b/i, "sa"],
    [/\b(germany|deutschland)\b/i, "de"],
    [/\b(france)\b/i, "fr"],
    [/\b(italy|italia)\b/i, "it"],
    [/\b(spain|españa)\b/i, "es"],
    [/\b(portugal)\b/i, "pt"],
    [/\b(netherlands|holland)\b/i, "nl"],
    [/\b(belgium)\b/i, "be"],
    [/\b(austria)\b/i, "at"],
    [/\b(switzerland)\b/i, "ch"],
    [/\b(ireland)\b/i, "ie"],
    [/\b(sweden)\b/i, "se"],
    [/\b(norway)\b/i, "no"],
    [/\b(denmark)\b/i, "dk"],
    [/\b(finland)\b/i, "fi"],
    [/\b(poland)\b/i, "pl"],
    [/\b(czech republic|czechia)\b/i, "cz"],
    [/\b(hungary)\b/i, "hu"],
    [/\b(romania)\b/i, "ro"],
    [/\b(brazil)\b/i, "br"],
    [/\b(mexico)\b/i, "mx"],
    [/\b(china)\b/i, "cn"],
    [/\b(japan)\b/i, "jp"],
    [/\b(south korea|korea)\b/i, "kr"],
  ];

  for (const [pattern, code] of countryPatterns) {
    if (pattern.test(value)) return code;
  }

  // US state names and postal abbreviations.
  const usStates = new Set([
    "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga",
    "hi", "id", "il", "in", "ia", "ks", "ky", "la", "me", "md",
    "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj",
    "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc",
    "sd", "tn", "tx", "ut", "vt", "va", "wa", "wv", "wi", "wy",
    "dc",
  ]);

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (usStates.has(part)) return "us";
  }

  const usStateNames: Record<string, string> = {
    alabama: "us", alaska: "us", arizona: "us", arkansas: "us",
    california: "us", colorado: "us", connecticut: "us", delaware: "us",
    florida: "us", georgia: "us", hawaii: "us", idaho: "us",
    illinois: "us", indiana: "us", iowa: "us", kansas: "us",
    kentucky: "us", louisiana: "us", maine: "us", maryland: "us",
    massachusetts: "us", michigan: "us", minnesota: "us",
    mississippi: "us", missouri: "us", montana: "us", nebraska: "us",
    nevada: "us", "new hampshire": "us", "new jersey": "us",
    "new mexico": "us", "new york": "us", "north carolina": "us",
    "north dakota": "us", ohio: "us", oklahoma: "us", oregon: "us",
    pennsylvania: "us", "rhode island": "us", "south carolina": "us",
    "south dakota": "us", tennessee: "us", texas: "us", utah: "us",
    vermont: "us", virginia: "us", washington: "us",
    "west virginia": "us", wisconsin: "us", wyoming: "us",
  };

  for (const stateName of Object.keys(usStateNames)) {
    if (value.includes(stateName)) return "us";
  }

  return null;
}

export function currencyForCountry(code:string|null): string|null {
  const currencies:Record<string,string>={US:"USD",CA:"CAD",GB:"GBP",PK:"PKR",AU:"AUD",DE:"EUR",FR:"EUR",IE:"EUR",NZ:"NZD",IN:"INR",PH:"PHP",SG:"SGD",JP:"JPY",AE:"AED",SA:"SAR"};
  return code ? currencies[code] || null : null;
}

function countryName(code:string|null): string|null {
  const names:Record<string,string>={US:"United States",CA:"Canada",GB:"United Kingdom",PK:"Pakistan",AU:"Australia",DE:"Germany",FR:"France",IE:"Ireland",NZ:"New Zealand",IN:"India",PH:"Philippines",SG:"Singapore",JP:"Japan",AE:"United Arab Emirates",SA:"Saudi Arabia"};
  return code ? names[code] || null : null;
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
    currency: currencyForCountry(detectCountryCode(row.location_display)),
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
    countries: (() => { const code=detectCountryCode(row.location_display); const name=countryName(code); return code && name ? {id:code,name,code} : null; })(),
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

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}
function normalizeSearchTerm(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function searchWords(value: string): string[] {
  return normalizeSearchTerm(value)
    .split(" ")
    .filter((word) => word.length >= 2);
}
function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(a: string, b: string): number {
  const left = normalizeSearchText(a);
  const right = normalizeSearchText(b);
  if (!left || !right) return Math.max(left.length, right.length);

  const previous = Array.from({ length: right.length + 1 }, (_, i) => i);

  for (let i = 1; i <= left.length; i++) {
    const current = [i];

    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
    }

    for (let j = 0; j < current.length; j++) {
      previous[j] = current[j];
    }
  }

  return previous[right.length];
}

function searchMatchScore(job: Job, search: string): number {
  const words = normalizeSearchText(search)
    .split(" ")
    .filter((word) => word.length >= 2);

  if (!words.length) return 1;

  const company = one(job.companies)?.name || "";
  const category = one(job.categories)?.name || "";

  const fields = [
    { text: normalizeSearchText(job.title || ""), weight: 100 },
    { text: normalizeSearchText(company), weight: 80 },
    { text: normalizeSearchText(category), weight: 75 },
    { text: normalizeSearchText(String(job.skills || "")), weight: 70 },
    { text: normalizeSearchText(`${job.city || ""} ${one(job.countries)?.name || ""}`), weight: 65 },
    { text: normalizeSearchText(job.summary || ""), weight: 45 },
    { text: normalizeSearchText(job.description || ""), weight: 25 },
  ].filter((field) => field.text);

  let total = 0;

  for (const word of words) {
    let best = 0;

    for (const field of fields) {
      if (field.text.includes(word)) {
        best = Math.max(best, field.weight);
        continue;
      }

      const tokens = field.text.split(" ").filter(Boolean);
      const maxDistance = word.length <= 4 ? 1 : word.length <= 8 ? 2 : 3;

      for (const token of tokens) {
        if (Math.abs(token.length - word.length) > maxDistance) continue;

        const distance = editDistance(word, token);

        if (distance <= maxDistance) {
          best = Math.max(best, field.weight - distance * 5);
        }
      }
    }

    if (!best) return 0;
    total += best;
  }

  return total;
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

  const mappedJobs = (data ?? []).map((row) => toJob(row as JobContentRow));

  if (!search.trim()) {
    return mappedJobs;
  }

  return mappedJobs
    .map((job) => ({
      job,
      score: searchMatchScore(job, search),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.job);
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














