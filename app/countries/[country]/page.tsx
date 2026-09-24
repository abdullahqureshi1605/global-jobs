import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import type { Job } from "@/lib/jobs";
import PublicJobCard from "@/components/PublicJobCard";

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

const currencies: Record<string, string> = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  PK: "PKR",
  AU: "AUD",
  DE: "EUR",
  FR: "EUR",
  IE: "EUR",
  NZ: "NZD",
  IN: "INR",
  PH: "PHP",
  SG: "SGD",
  JP: "JPY",
  AE: "AED",
  SA: "SAR",
  MY: "MYR",
};

function salaryText(job: Job, countryCode: string) {
  if (job.salary_min == null && job.salary_max == null) {
    return "Salary not specified";
  }

  const currency = job.currency || currencies[countryCode] || "";

  const clean = (value: number) => {
    const n = Math.trunc(value);

    if (n >= 1000) {
      return `${Math.round(n / 1000)}k`;
    }

    return n.toLocaleString("en-US");
  };

  if (job.salary_min != null && job.salary_max != null) {
    return `${clean(job.salary_min)} – ${clean(job.salary_max)} ${currency}`.trim();
  }

  if (job.salary_min != null) {
    return `${clean(job.salary_min)}+ ${currency}`.trim();
  }

  return `Up to ${clean(job.salary_max!)} ${currency}`.trim();
}

function getWorkMode(job: Job) {
  const text = `${job.work_mode || ""} ${job.title || ""} ${job.summary || ""} ${job.description || ""}`.toLowerCase();

  if (text.includes("hybrid")) {
    return "Hybrid";
  }

  if (text.includes("remote") || text.includes("work from home")) {
    return "Remote";
  }

  return "On-site";
}


export default async function CountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;

  const supabase = await createClient();

  const { data: countries } = await supabase
    .from("countries")
    .select("id,name,code");

  const c = (countries ?? []).find(
    (item) => item.code.toLowerCase() === country.toLowerCase()
  );

  if (!c) {
    notFound();
  }

  let jobs: Job[] = [];

  try {
    const backend =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const response = await fetch(
      `${backend}/api/public/jobs?country=${encodeURIComponent(
        c.code.toLowerCase()
      )}&limit=100`,
      { cache: "no-store" }
    );

    if (response.ok) {
      const data = await response.json();

      jobs = (data.jobs ?? []).map((row: any) => ({
        id: row.id,
        raw_job_id: "",
        title: row.title,
        slug:
          row.public_slug ||
          `${(row.title || "job")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")}-${String(row.id)
            .replace(/-/g, "")
            .slice(0, 12)}`,
        description: row.detailed_description || row.summary || "",
        summary: row.summary || null,
        skills: Array.isArray(row.skills) ? row.skills : [],
        city: (row.location_display || "").split(",")[0]?.trim() || null,
        work_mode: null,
        employment_type:
          row.contract_type || row.contract_time || null,
        salary_min: row.salary_min ?? null,
        salary_max: row.salary_max ?? null,
        currency: null,
        apply_url: row.redirect_url || null,
        source: row.source || null,
        status: "published",
        posted_at: row.published_at || null,
        created_at: row.published_at || new Date(0).toISOString(),
        companies: row.company_name
          ? {
              id: "company-" + row.id,
              name: row.company_name,
              slug: row.company_name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, ""),
              logo_url: null,
              verification_status: "unverified",
            }
          : null,
        countries: {
          id: c.id,
          name: c.name,
          code: c.code,
        },
        categories: row.category_label
          ? {
              id: "category-" + row.id,
              name: row.category_label,
              slug: row.category_tag || row.category_label,
              icon: null,
            }
          : null,
        meta_title: null,
        meta_description: null,
        seo_keywords: [],
        application_job_id: null,
        responsibilities: [],
        requirements: [],
        additional_information: [],
      } as Job));
    }
  } catch {}

  return (
    <main className="horizon-page">
      <section className="bg-[#071a35] py-7 text-white md:py-8">
        <div className="horizon-container">
<div className="mt-5 flex items-center gap-4">
            <span
              className={`fi fi-${c.code.toLowerCase()} h-7 w-9 shrink-0 rounded-sm`}
              aria-label={c.name}
            />

            <div>
              <p className="horizon-eyebrow">Country</p>

              <h1 className="mt-1 text-3xl font-black md:text-4xl">
                Jobs in {c.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="horizon-container py-5 md:py-6">
        {jobs.length ? (
          <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <PublicJobCard
                key={job.id}
                job={job}
                href={`/countries/${c.code.toLowerCase()}/jobs/${job.slug}`}
                countryCode={c.code}
              />
            ))}
          </div>
        ) : (
          <div className="horizon-card p-12 text-center">
            <h2 className="font-black text-[#071a35]">
              No published jobs in {c.name}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Check back later for new opportunities.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}






