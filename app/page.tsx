import Link from "next/link";

import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";

export const revalidate = 60;

export const metadata = {
  title: "Horizon Jobs | Global Job Discovery",
  description:
    "Discover global job opportunities and practical career resources with Horizon Jobs.",
};

function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string
) {
  if (
    min === null ||
    min === undefined ||
    max === null ||
    max === undefined ||
    !currency
  ) {
    return "";
  }

  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
}

export default async function HomePage() {
  const [
    latestJobs,
    countryMap,
    categoryMap,
  ] = await Promise.all([
    JobService.getLatestPublishedJobs(6),
    JobService.getPublishedCountryCounts(),
    JobService.getPublishedCategoryCounts(),
  ]);

  const countries =
    Array.from(countryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

  const categories =
    Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* HERO */}
      <section className="bg-slate-900 px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
            Global Employment Intelligence
          </p>

          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Find Your Next Opportunity
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Discover published job opportunities across countries,
            categories, workplace types, and career levels.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/jobs"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Find Jobs
            </Link>

            <Link
              href="/career-resources"
              className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Career Resources
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST JOBS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Latest Opportunities
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
              Recently Published Jobs
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              A small selection of the latest published opportunities.
            </p>
          </div>

          <Link
            href="/jobs"
            className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View All Jobs →
          </Link>
        </div>

        {latestJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            No published jobs are available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {latestJobs.map((job) => (
              <article
                key={job.id}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex-1">
                  {job.featured && (
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      Featured
                    </span>
                  )}

                  <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">
                    {job.title}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {job.company}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {job.city}, {job.country}
                    </span>

                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                      {job.category}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {job.workplaceType}
                    </span>
                  </div>

                  {job.salaryMin !== null &&
                    job.salaryMin !== undefined &&
                    job.salaryMax !== null &&
                    job.salaryMax !== undefined && (
                      <p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatSalary(
                          job.salaryMin,
                          job.salaryMax,
                          job.salaryCurrency
                        )}
                      </p>
                    )}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    href={`/jobs/${slugify(
                      job.country
                    )}/${slugify(
                      job.city
                    )}/${job.slug}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    View Job
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/jobs"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Browse All Jobs
          </Link>
        </div>
      </section>

      {/* COUNTRIES */}
      <section className="border-y border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Global Markets
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                Explore Countries
              </h2>
            </div>

            <Link
              href="/countries"
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View All Countries →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {countries.map(([country, count]) => (
              <Link
                key={country}
                href={`/jobs/${slugify(country)}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
              >
                <span className="text-lg">🌍</span>

                <h3 className="mt-3 font-bold text-slate-900 dark:text-white">
                  {country}
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {count} published{" "}
                  {count === 1 ? "job" : "jobs"}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/countries"
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Browse All Countries
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Career Areas
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                Explore Categories
              </h2>
            </div>

            <Link
              href="/categories"
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map(([category, count]) => (
              <Link
                key={category}
                href={`/categories/${slugify(category)}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="text-lg">💼</span>

                <h3 className="mt-3 font-bold text-slate-900 dark:text-white">
                  {category}
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {count} published{" "}
                  {count === 1 ? "job" : "jobs"}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/categories"
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Browse All Categories
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}