import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getJobBySlug, type Job } from "@/lib/jobs";
import ApplyButton from "@/components/ApplyButton";

function one<T>(
  value: T | T[] | null | undefined
): T | null {
  return Array.isArray(value)
    ? value[0] ?? null
    : value ?? null;
}

function salary(job: Job) {
  if (
    job.salary_min == null &&
    job.salary_max == null
  ) {
    return "Salary not specified";
  }

  const currency = job.currency
    ? `${job.currency} `
    : "";

  if (
    job.salary_min != null &&
    job.salary_max != null
  ) {
    return `${currency}${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}`;
  }

  return job.salary_min != null
    ? `${currency}${job.salary_min.toLocaleString()}+`
    : `Up to ${currency}${job.salary_max!.toLocaleString()}`;
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
      description:
        "Explore career opportunities on Horizon Jobs.",
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://horizonjobs.online";

  const canonical =
    `${siteUrl.replace(/\/$/, "")}/jobs/${encodeURIComponent(slug)}`;

  const title =
    job.meta_title ||
    `${job.title} | Horizon Jobs`;

  const description =
    job.meta_description ||
    job.summary ||
    `Explore the ${job.title} opportunity on Horizon Jobs.`;

  return {
    title,
    description,
    keywords:
      job.seo_keywords?.length
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

  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-12 text-white">
        <div className="horizon-container">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to jobs
          </Link>

          <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#e4ad2f] text-xl font-black text-[#071a35]">
              {company?.name?.charAt(0) || "J"}
            </div>

            <div>
              <p className="horizon-eyebrow">
                Job opportunity
              </p>

              <h1 className="mt-2 text-3xl font-black md:text-5xl">
                {job.title}
              </h1>

              <p className="mt-2 text-lg text-white/65">
                {company?.name || "Employer"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {country?.name && (
              <Tag>{country.name}</Tag>
            )}

            {job.city && (
              <Tag>{job.city}</Tag>
            )}

            {job.work_mode && (
              <Tag>{job.work_mode}</Tag>
            )}

            {category?.name && (
              <Tag>{category.name}</Tag>
            )}
          </div>
        </div>
      </section>

      <section className="horizon-container grid gap-7 py-9 lg:grid-cols-[1fr_340px]">
        <article className="horizon-card p-7 sm:p-9">
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

        <aside className="space-y-4">
          <div className="horizon-card p-6">
            <h2 className="text-lg font-black">
              Apply for this position
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to continue with your application.
            </p>

            <div className="mt-5">
              <ApplyButton
                jobId={job.id}
                source={job.source}
                applyUrl={job.apply_url}
              />
            </div>
          </div>

          <div className="horizon-card p-6">
            <h2 className="text-lg font-black">
              Job details
            </h2>

            <div className="mt-5 space-y-4">
              <Detail
                icon={<Building2 />}
                label="Company"
                value={
                  company?.name || "Not specified"
                }
              />

              <Detail
                icon={<MapPin />}
                label="Location"
                value={
                  [
                    job.city,
                    country?.name,
                  ]
                    .filter(Boolean)
                    .join(", ") ||
                  "Not specified"
                }
              />

              <Detail
                icon={<BriefcaseBusiness />}
                label="Employment"
                value={
                  job.employment_type?.replaceAll(
                    "_",
                    " "
                  ) || "Not specified"
                }
              />

              <Detail
                icon={<CalendarDays />}
                label="Salary"
                value={salary(job)}
              />
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
      employmentType:
        job.employment_type
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
                addressLocality:
                  job.city || undefined,
                addressCountry:
                  country?.name || undefined,
              },
            }
          : undefined,
      baseSalary:
        job.salary_min != null ||
        job.salary_max != null
          ? {
              "@type": "MonetaryAmount",
              currency: job.currency || "GBP",
              value: {
                "@type": "QuantitativeValue",
                minValue:
                  job.salary_min ?? undefined,
                maxValue:
                  job.salary_max ?? undefined,
              },
            }
          : undefined,
    }),
  }}
/>

</main>
  );
}

function Tag({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80">
      {children}
    </span>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-[#b88410]">
        {icon}
      </span>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold capitalize text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}
