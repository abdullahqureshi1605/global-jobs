import type { Metadata } from "next";
import Link from "next/link";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import { slugify } from "@/lib/utils/slug";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export const metadata: Metadata = {
  title:
    "Find Jobs | Horizon Jobs",
  description:
    "Search published global jobs by keyword, location, category, workplace type, employment type, and experience level.",
};

type SearchParams = {
  q?: string;
  location?: string;
  category?: string;
  workplace?: string;
  employment?: string;
  experience?: string;
};

function getValue(
  value:
    | string
    | string[]
    | undefined
) {
  return Array.isArray(value)
    ? value[0] || ""
    : value || "";
}

function clean(
  value: string
) {
  return value
    .replace(
      /[,()%\\]/g,
      " "
    )
    .trim()
    .slice(0, 100);
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params =
    await searchParams;

  const q =
    getValue(params.q).trim();

  const location =
    getValue(
      params.location
    ).trim();

  const category =
    getValue(
      params.category
    ).trim();

  const workplace =
    getValue(
      params.workplace
    ).trim();

  const employment =
    getValue(
      params.employment
    ).trim();

  const experience =
    getValue(
      params.experience
    ).trim();

  /*
   * Only request fields required for the result cards.
   * We do NOT select "*".
   */
  let jobsQuery =
    supabaseAdmin
      .from("jobs")
      .select(
        `
        id,
        title,
        slug,
        company,
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
        description,
        featured,
        date_posted
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
      .limit(40);

  if (q) {
    const search =
      clean(q);

    if (search) {
      jobsQuery =
        jobsQuery.or(
          `title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`
        );
    }
  }

  if (location) {
    const search =
      clean(location);

    if (search) {
      jobsQuery =
        jobsQuery.or(
          `country.ilike.%${search}%,city.ilike.%${search}%`
        );
    }
  }

  if (category) {
    jobsQuery =
      jobsQuery.eq(
        "category",
        category
      );
  }

  if (workplace) {
    jobsQuery =
      jobsQuery.eq(
        "workplace_type",
        workplace
      );
  }

  if (employment) {
    jobsQuery =
      jobsQuery.eq(
        "employment_type",
        employment
      );
  }

  if (experience) {
    jobsQuery =
      jobsQuery.eq(
        "experience_level",
        experience
      );
  }

  /*
   * Categories are fetched separately and only the
   * category column is requested.
   */
  const [
    jobsResult,
    categoryResult,
  ] = await Promise.all([
    jobsQuery,

    supabaseAdmin
      .from("jobs")
      .select("category")
      .eq(
        "status",
        "published"
      ),
  ]);

  if (jobsResult.error) {
    throw new Error(
      `Failed to load jobs: ${jobsResult.error.message}`
    );
  }

  if (categoryResult.error) {
    throw new Error(
      `Failed to load categories: ${categoryResult.error.message}`
    );
  }

  const jobs =
    jobsResult.data ?? [];

  const categories =
    Array.from(
      new Set(
        (categoryResult.data ??
          [])
          .map(
            (row) =>
              row.category
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(
                value &&
                  value.trim()
              )
          )
      )
    ).sort();

  const hasFilters =
    Boolean(
      q ||
        location ||
        category ||
        workplace ||
        employment ||
        experience
    );

  return (
    <main className="min-h-screen bg-slate-100 py-8 dark:bg-slate-950 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Global Employment
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Find Your Opportunity
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            Search published opportunities by keyword, location,
            category, workplace, employment type, and experience.
          </p>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-80">
            <form
              action="/jobs"
              method="get"
              className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Search & Filters
                </h2>

                <Link
                  href="/jobs"
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Clear
                </Link>
              </div>

              <div className="mt-6 space-y-5">
                <Field
                  name="q"
                  label="Keyword"
                  defaultValue={q}
                  placeholder="Job title or company"
                />

                <Field
                  name="location"
                  label="Location"
                  defaultValue={
                    location
                  }
                  placeholder="Country or city"
                />

                <Select
                  name="category"
                  label="Category"
                  defaultValue={
                    category
                  }
                  options={[
                    {
                      value: "",
                      label:
                        "All categories",
                    },
                    ...categories.map(
                      (item) => ({
                        value: item,
                        label: item,
                      })
                    ),
                  ]}
                />

                <Select
                  name="workplace"
                  label="Workplace"
                  defaultValue={
                    workplace
                  }
                  options={[
                    {
                      value: "",
                      label:
                        "Any workplace",
                    },
                    {
                      value:
                        "Remote",
                      label:
                        "Remote",
                    },
                    {
                      value:
                        "Hybrid",
                      label:
                        "Hybrid",
                    },
                    {
                      value:
                        "On-site",
                      label:
                        "On-site",
                    },
                  ]}
                />

                <Select
                  name="employment"
                  label="Employment"
                  defaultValue={
                    employment
                  }
                  options={[
                    {
                      value: "",
                      label:
                        "Any employment",
                    },
                    {
                      value:
                        "Full-time",
                      label:
                        "Full-time",
                    },
                    {
                      value:
                        "Part-time",
                      label:
                        "Part-time",
                    },
                    {
                      value:
                        "Contract",
                      label:
                        "Contract",
                    },
                    {
                      value:
                        "Temporary",
                      label:
                        "Temporary",
                    },
                    {
                      value:
                        "Internship",
                      label:
                        "Internship",
                    },
                    {
                      value:
                        "Freelance",
                      label:
                        "Freelance",
                    },
                  ]}
                />

                <Select
                  name="experience"
                  label="Experience"
                  defaultValue={
                    experience
                  }
                  options={[
                    {
                      value: "",
                      label:
                        "Any experience",
                    },
                    {
                      value:
                        "Entry Level",
                      label:
                        "Entry Level",
                    },
                    {
                      value:
                        "Mid Level",
                      label:
                        "Mid Level",
                    },
                    {
                      value:
                        "Senior",
                      label:
                        "Senior",
                    },
                    {
                      value:
                        "Executive",
                      label:
                        "Executive",
                    },
                  ]}
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Search Jobs
                </button>
              </div>
            </form>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {hasFilters
                  ? "Search Results"
                  : "Latest Opportunities"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {jobs.length} published{" "}
                {jobs.length === 1
                  ? "job"
                  : "jobs"}{" "}
                found.
              </p>
            </div>

            {jobs.length ===
            0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="text-4xl">
                  🔎
                </div>

                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                  No jobs found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search criteria.
                </p>

                <Link
                  href="/jobs"
                  className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {jobs.map(
                  (job) => (
                    <article
                      key={
                        job.id
                      }
                      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex-1">
                        {job.featured && (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Featured
                          </span>
                        )}

                        <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                          {
                            job.title
                          }
                        </h3>

                        <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                          {
                            job.company
                          }
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {
                              job.country_code
                            }{" "}
                            {
                              job.city
                            }
                            ,{" "}
                            {
                              job.country
                            }
                          </span>

                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                            {
                              job.category
                            }
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {
                              job.workplace_type
                            }
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {
                              job.employment_type
                            }
                          </span>
                        </div>

                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {
                            job.description
                          }
                        </p>
                      </div>

                      <Link
                        href={`/jobs/${slugify(
                          job.country
                        )}/${slugify(
                          job.city
                        )}/${job.slug}`}
                        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
                      >
                        View Job
                      </Link>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        defaultValue={
          defaultValue
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
    </div>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        defaultValue={
          defaultValue
        }
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      >
        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          )
        )}
      </select>
    </div>
  );
}