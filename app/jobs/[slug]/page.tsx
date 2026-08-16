import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slug";
import { countryCodeToFlag } from "@/lib/utils/countryFlag";
import {
  getCategoryIcon,
} from "@/lib/utils/categoryIcon";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

async function getJob(slug: string) {
  const { data, error } =
    await supabaseAdmin
      .from("jobs")
      .select(`
        id,
        title,
        slug,
        company,
        company_logo,
        country,
        country_code,
        city,
        category,
        subcategory,
        industry,
        employment_type,
        workplace_type,
        experience_level,
        salary_min,
        salary_max,
        salary_currency,
        salary_period,
        description,
        requirements,
        responsibilities,
        benefits,
        source_name,
        source_url,
        apply_url,
        date_posted,
        closing_date,
        last_verified,
        verification_status,
        status,
        featured
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load job: ${error.message}`
    );
  }

  return data;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const job = await getJob(slug);

  if (!job) {
    return {
      title:
        "Job Not Found | Horizon Jobs",
    };
  }

  return {
    title:
      `${job.title} at ${job.company} | Horizon Jobs`,
    description:
      job.description?.slice(0, 160) ||
      `View the ${job.title} opportunity at ${job.company}.`,
  };
}

export default async function JobDetailPage({
  params,
}: Props) {
  const { slug } = await params;

  const job = await getJob(slug);

  if (!job) {
    notFound();
  }

  const CategoryIcon =
    getCategoryIcon(job.category);

  const flag =
    countryCodeToFlag(
      job.country_code
    );

  const requirements =
    Array.isArray(job.requirements)
      ? job.requirements
      : [];

  const responsibilities =
    Array.isArray(
      job.responsibilities
    )
      ? job.responsibilities
      : [];

  const benefits =
    Array.isArray(job.benefits)
      ? job.benefits
      : [];

  return (
    <main className="min-h-screen bg-slate-100 py-8 dark:bg-slate-950 sm:py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <header className="p-7 sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {job.featured && (
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Featured
                  </span>
                )}

                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {job.title}
                </h1>

                <p className="mt-2 text-lg font-semibold text-slate-600 dark:text-slate-400">
                  {job.company}
                </p>
              </div>

              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-4xl dark:bg-slate-800"
                role="img"
                aria-label={`${job.country} flag`}
              >
                {flag}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                <CategoryIcon className="h-4 w-4" />
                {job.category}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {flag} {job.country}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {job.city}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {job.workplace_type}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {job.employment_type}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {job.experience_level}
              </span>
            </div>
          </header>

          <div className="grid gap-8 border-t border-slate-200 p-7 dark:border-slate-800 sm:p-10 lg:grid-cols-[1fr_300px]">
            <div>
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Job Description
                </h2>

                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-600 dark:text-slate-400">
                  {job.description}
                </p>
              </section>

              {responsibilities.length >
                0 && (
                <section className="mt-10">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Responsibilities
                  </h2>

                  <ul className="mt-4 space-y-3">
                    {responsibilities.map(
                      (
                        item: string,
                        index: number
                      ) => (
                        <li
                          key={index}
                          className="flex gap-3 text-sm leading-7 text-slate-600 dark:text-slate-400"
                        >
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </section>
              )}

              {requirements.length >
                0 && (
                <section className="mt-10">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Requirements
                  </h2>

                  <ul className="mt-4 space-y-3">
                    {requirements.map(
                      (
                        item: string,
                        index: number
                      ) => (
                        <li
                          key={index}
                          className="flex gap-3 text-sm leading-7 text-slate-600 dark:text-slate-400"
                        >
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </section>
              )}

              {benefits.length >
                0 && (
                <section className="mt-10">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Benefits
                  </h2>

                  <ul className="mt-4 space-y-3">
                    {benefits.map(
                      (
                        item: string,
                        index: number
                      ) => (
                        <li
                          key={index}
                          className="flex gap-3 text-sm leading-7 text-slate-600 dark:text-slate-400"
                        >
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </section>
              )}
            </div>

            <aside>
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50">
                {job.salary_min !== null &&
                  job.salary_max !== null && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Salary
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400">
                        {job.salary_currency}{" "}
                        {Number(
                          job.salary_min
                        ).toLocaleString()}{" "}
                        -{" "}
                        {Number(
                          job.salary_max
                        ).toLocaleString()}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {job.salary_period}
                      </p>
                    </div>
                  )}

                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Apply for Job
                </a>

                {job.source_url && (
                  <a
                    href={job.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    View Original Source
                  </a>
                )}

                <div className="mt-6 space-y-4 border-t border-slate-200 pt-5 dark:border-slate-700">
                  <Info
                    label="Country"
                    value={`${flag} ${job.country}`}
                  />

                  <Info
                    label="City"
                    value={job.city}
                  />

                  <Info
                    label="Category"
                    value={job.category}
                  />

                  <Info
                    label="Employment"
                    value={
                      job.employment_type
                    }
                  />

                  <Info
                    label="Workplace"
                    value={
                      job.workplace_type
                    }
                  />

                  <Info
                    label="Experience"
                    value={
                      job.experience_level
                    }
                  />

                  <Info
                    label="Verified"
                    value={
                      job.verification_status
                    }
                  />

                  {job.date_posted && (
                    <Info
                      label="Posted"
                      value={job.date_posted}
                    />
                  )}
                </div>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        {value || "Not specified"}
      </p>
    </div>
  );
}