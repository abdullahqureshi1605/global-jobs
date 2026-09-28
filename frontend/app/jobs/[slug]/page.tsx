import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Flag,
  MapPin,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getJobBySlug, type Job , detectCountryCode, currencyForCountry} from "@/lib/jobs";
import ApplyButton from "@/components/ApplyButton";

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function getJobCountryCode(job: Job): string {
  const relatedCode = String(
    one(job.countries)?.code || ""
  ).toUpperCase();

  if (relatedCode) {
    return relatedCode;
  }

  const city = String(job.city || "")
    .trim()
    .toLowerCase();

  const cityCountryMap: Record<string, string> = {
    "liberty lake": "US",
    "veradale": "US",
    "jersey city": "US",
    "austin": "US",
    "new york": "US",
    "seattle": "US",
    "chicago": "US",
    "houston": "US",
    "dallas": "US",
    "boston": "US",
    "denver": "US",
    "phoenix": "US",
    "los angeles": "US",
    "san francisco": "US",
    "miami": "US",
    "atlanta": "US",
    "canberra": "AU",
    "sydney": "AU",
    "melbourne": "AU",
    "toronto": "CA",
    "vancouver": "CA",
    "manchester": "GB",
    "london": "GB",
    "abbottabad": "PK",
    "islamabad": "PK",
    "lahore": "PK",
    "karachi": "PK",
    "munich": "DE",
    "berlin": "DE",
    "paris": "FR",
    "dublin": "IE",
    "delhi": "IN",
    "mumbai": "IN"
  };

  return cityCountryMap[city] || "";
}

function flagEmoji(code: string) {
  const value = String(code || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(value)) return "🌐";
  return String.fromCodePoint(
    ...value.split("").map((char) => 127397 + char.charCodeAt(0))
  );
}
function salary(job: Job) {
  if (job.salary_min == null && job.salary_max == null) {
    return "Salary not specified";
  }

  const code = getJobCountryCode(job);

  const currencies: Record<string, string> = {
    US:"USD", CA:"CAD", GB:"GBP", PK:"PKR", AU:"AUD",
    DE:"EUR", FR:"EUR", IE:"EUR", NZ:"NZD", IN:"INR",
    PH:"PHP", SG:"SGD", JP:"JPY", AE:"AED", SA:"SAR", MY:"MYR"
  };

  const currency = job.currency || currencies[code] || "";

  const clean = (value: number) =>
    Math.trunc(value).toLocaleString("en-US");

  if (job.salary_min != null && job.salary_max != null) {
    return `${clean(job.salary_min)} – ${clean(job.salary_max)}${currency ? ` ${currency}` : ""}`;
  }

  if (job.salary_min != null) {
    return `${clean(job.salary_min)}+${currency ? ` ${currency}` : ""}`;
  }

  return `Up to ${clean(job.salary_max!)}${currency ? ` ${currency}` : ""}`;
}

function workMode(job: Job) {
  const value = String((job as any).work_mode || "").toLowerCase();

  if (value.includes("remote")) return "Remote";
  if (value.includes("hybrid")) return "Hybrid";
  return "On-site";
}

function employment(job: Job) {
  return String(job.employment_type || "Full time")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function postedAgo(dateValue: string | null | undefined) {
  if (!dateValue) return "Recently posted";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently posted";

  const diff = Math.max(0, Date.now() - date.getTime());
  const days = Math.floor(diff / 86400000);

  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours <= 0) return "Posted today";
    return `Posted ${hours}h ago`;
  }

  if (days === 1) return "Posted 1 day ago";
  if (days < 30) return `Posted ${days} days ago`;

  const months = Math.floor(days / 30);
  if (months === 1) return "Posted 1 month ago";

  return `Posted ${months} months ago`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let job: Job | null = null;

  try {
    job = await getJobBySlug(slug);
  } catch {}

  if (!job) {
    return {
      title: "Job Opportunity | Horizon Jobs",
      description: "Explore career opportunities on Horizon Jobs.",
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://horizonjobs.online";

  const canonical =
    `${siteUrl.replace(/\/$/, "")}/jobs/${encodeURIComponent(slug)}`;

  const title = job.meta_title || `${job.title} | Horizon Jobs`;

  const description =
    job.meta_description ||
    job.summary ||
    `Explore the ${job.title} opportunity on Horizon Jobs.`;

  return {
    title,
    description,
    keywords: job.seo_keywords?.length
      ? job.seo_keywords
      : undefined,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "Horizon Jobs",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function JobDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let job: Job | null = null;

  try {
    job = await getJobBySlug(slug);
  } catch {}

  if (!job) {
    notFound();
  }

  const company = one(job.companies);
  const country = one(job.countries);
  const category = one(job.categories);

  const flagCode = getJobCountryCode(job);
  const location =
    [job.city, country?.name].filter(Boolean).join(", ") ||
    "Location not specified";

  const categoryName = category?.name || "Jobs";
  const mode = workMode(job);
  const employmentType = employment(job);
  const salaryText = salary(job);
  const postedText = postedAgo(job.posted_at || job.created_at);

  return (
    <main className="horizon-page bg-[#f5f7fa]">
      {/* Compact job header */}
      <section className="border-b border-[#E3E8EF] bg-white">
        <div className="horizon-container py-5">
<div className="mt-5 rounded-2xl border border-[#E3E8EF] bg-white p-5 shadow-[0_2px_8px_rgba(11,21,38,0.03)] md:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-4">
                  <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#071a35]"><img src={`/flags/${flagCode || "xx"}.svg`} alt={country?.name || "Country flag"} className="h-full w-full object-cover" /></div>

                  <div className="min-w-0">
                    <h1 className="text-2xl font-black leading-tight text-[#0B1526] md:text-[30px]">
                      {job.title}
                    </h1>

                    <p className="mt-1.5 text-sm font-medium text-[#45617F] md:text-[15px]">
                      {company?.name || "Employer"}
                      {location !== "Location not specified"
                        ? ` · ${location}`
                        : ""}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <InfoCapsule blue>{categoryName}</InfoCapsule>
                      <InfoCapsule>{mode}</InfoCapsule>
                      <InfoCapsule green>{employmentType}</InfoCapsule>
                      <InfoCapsule>{location}</InfoCapsule>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 xl:min-w-[230px] xl:items-end">
                <div className="text-left xl:text-right">
                  <p className="text-lg font-bold text-[#0B1526] md:text-xl">
                    {salaryText}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#7890AA]">
                    {postedText}
                  </p>
                </div>

                <ApplyButton
                  jobId={job.id}
                  source={job.source}
                  applyUrl={job.apply_url}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main job content */}
      <section className="horizon-container grid gap-6 py-7 lg:grid-cols-[minmax(0,1fr)_330px]">
        <article className="horizon-card p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-[#b88410]">
            <BriefcaseBusiness size={15} />
            Job description
          </div>

          {job.summary && (
            <section className="mt-6">
              <h2 className="text-xl font-black text-[#071a35]">
                Job Summary
              </h2>
              <p className="mt-3 text-sm leading-8 text-slate-700">
                {job.summary}
              </p>
            </section>
          )}

          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-black text-[#071a35]">
                Key Skills
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-full border border-[#e4ad2f]/30 bg-[#fff8df] px-3 py-2 text-xs font-bold text-[#7b5a08]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8 border-t border-slate-100 pt-8">
            <h2 className="text-xl font-black text-[#071a35]">
              Full Job Description
            </h2>

            {job.description && (
              <p className="mt-5 whitespace-pre-wrap text-sm leading-8 text-slate-700">
                {job.description}
              </p>
            )}

            {job.responsibilities?.length > 0 && (
              <section className="mt-8">
                <h3 className="text-lg font-black text-[#071a35]">
                  Key Responsibilities
                </h3>

                <ul className="mt-4 space-y-3">
                  {job.responsibilities.map((item, index) => (
                    <li
                      key={`responsibility-${index}`}
                      className="flex gap-3 text-sm leading-7 text-slate-700"
                    >
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e4ad2f]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.requirements?.length > 0 && (
              <section className="mt-8">
                <h3 className="text-lg font-black text-[#071a35]">
                  Requirements
                </h3>

                <ul className="mt-4 space-y-3">
                  {job.requirements.map((item, index) => (
                    <li
                      key={`requirement-${index}`}
                      className="flex gap-3 text-sm leading-7 text-slate-700"
                    >
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e4ad2f]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.additional_information?.length > 0 && (
              <section className="mt-8">
                <h3 className="text-lg font-black text-[#071a35]">
                  Additional Information
                </h3>

                <ul className="mt-4 space-y-3">
                  {job.additional_information.map((item, index) => (
                    <li
                      key={`additional-${index}`}
                      className="flex gap-3 text-sm leading-7 text-slate-700"
                    >
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e4ad2f]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </section>
        </article>

        {/* Job overview */}
        <aside>
          <div className="horizon-card p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-black text-[#071a35]">
              Job Overview
            </h2>

            <div className="mt-5 space-y-5">
              <OverviewRow
                icon={<MapPin size={17} />}
                label="Location"
                value={location}
              />

              <OverviewRow
                icon={<BriefcaseBusiness size={17} />}
                label="Work mode"
                value={mode}
              />

              <OverviewRow
                icon={<BriefcaseBusiness size={17} />}
                label="Category"
                value={categoryName}
              />

              <OverviewRow
                icon={<CalendarDays size={17} />}
                label="Employment"
                value={employmentType}
              />

              <OverviewRow
                icon={<CalendarDays size={17} />}
                label="Salary"
                value={salaryText}
              />

              <OverviewRow
                icon={<CalendarDays size={17} />}
                label="Posted"
                value={postedText.replace(/^Posted /, "")}
              />
            </div>

            <div className="mt-6 border-t border-[#E3E8EF] pt-5">
              <button
                type="button"
                className="text-sm font-semibold text-[#7890AA] transition hover:text-[#0B1526]"
              >
                ⚑ Report this job
              </button>
            </div>
          </div>
        </aside>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: [
              job.summary,
              job.description,
              ...(job.responsibilities || []),
              ...(job.requirements || []),
              ...(job.additional_information || []),
            ]
              .filter(Boolean)
              .join("\n\n"),
            datePosted: job.posted_at || job.created_at,
            employmentType: job.employment_type
              ? job.employment_type
                  .toUpperCase()
                  .replace(/-/g, "_")
              : undefined,
            hiringOrganization: company?.name
              ? {
                  "@type": "Organization",
                  name: company.name,
                }
              : undefined,
            jobLocation:
              job.city || country?.name
                ? {
                    "@type": "Place",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: job.city || undefined,
                      addressCountry: country?.name || undefined,
                    },
                  }
                : undefined,
            baseSalary:
              job.salary_min != null || job.salary_max != null
                ? {
                    "@type": "MonetaryAmount",
                    currency: job.currency || "USD",
                    value: {
                      "@type": "QuantitativeValue",
                      minValue: job.salary_min ?? undefined,
                      maxValue: job.salary_max ?? undefined,
                    },
                  }
                : undefined,
          }),
        }}
      />
    </main>
  );
}

function InfoCapsule({
  children,
  blue = false,
  green = false,
}: {
  children: React.ReactNode;
  blue?: boolean;
  green?: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
        blue
          ? "bg-[#EAF1FF] text-[#2563EB]"
          : green
            ? "bg-[#E7F7EF] text-[#16834F]"
            : "bg-[#F0F2F5] text-[#45617F]",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function OverviewRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2 text-sm text-[#7890AA]">
        <span className="shrink-0 text-[#7890AA]">{icon}</span>
        <span>{label}</span>
      </div>

      <span className="max-w-[190px] text-right text-sm font-semibold text-[#0B1526]">
        {value}
      </span>
    </div>
  );
}










