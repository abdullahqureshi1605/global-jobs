import Link from "next/link";

import { JobService } from "@/services/jobService";
import { TaxonomyService } from "@/services/taxonomyService";
import { slugify } from "@/lib/utils/slug";
import { countryCodeToFlag } from "@/lib/utils/countryFlag";
import {
  getCategoryIcon,
} from "@/lib/utils/categoryIcon";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export const metadata = {
  title:
    "Horizon Jobs | Global Job Discovery",

  description:
    "Discover global job opportunities and practical career resources with Horizon Jobs.",
};

function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string
) {
  if (
    min == null ||
    max == null ||
    !currency
  ) {
    return "";
  }

  return `${currency} ${Number(
    min
  ).toLocaleString()} - ${Number(
    max
  ).toLocaleString()}`;
}

export default async function HomePage() {
  const [
    latestJobs,
    countries,
    categories,
  ] = await Promise.all([
    JobService.getLatestPublishedJobs(
      6
    ),

    TaxonomyService.getCountryCounts(),

    TaxonomyService.getCategoryCounts(),
  ]);

  const previewCountries =
    countries.slice(0, 4);

  const previewCategories =
    categories.slice(0, 4);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* HERO */}
      <section className="bg-slate-900 px-4 py-16 sm:px-6 sm:py-[4.5rem] lg:px-8 lg:py-[5.4rem] xl:py-[5.75rem] 2xl:py-[6.1rem] text-white">
        <div className="mx-auto flex min-h-[300px] max-w-5xl items-center justify-center text-center sm:min-h-[330px] lg:min-h-[360px] xl:min-h-[390px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
              Global Employment Intelligence
            </p>

            <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Find Your Next Opportunity
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Discover published opportunities across countries,
              categories, workplace types, and career levels.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/jobs"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Find Jobs
              </Link>

              <Link
                href="/career-resources"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Career Resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* JOBS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Latest Opportunities
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
              Recently Published Jobs
            </h2>
          </div>

          <Link
            href="/jobs"
            className="inline-flex w-fit rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300"
          >
            Browse All Jobs →
          </Link>
        </div>

        {latestJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            No published jobs are available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {latestJobs.map(
              (job) => {
                const CategoryIcon =
                  getCategoryIcon(
                    job.category
                  );

                const flag =
                  countryCodeToFlag(
                    job.countryCode
                  );

                return (
                  <article
                    key={job.id}
                    className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
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
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">
                          {flag}
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          <CategoryIcon className="h-3.5 w-3.5" />
                          {job.category}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {flag} {job.country}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {job.city}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {job.workplaceType}
                        </span>
                      </div>

                      {job.description && (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {job.description}
                        </p>
                      )}

                      {formatSalary(
                        job.salaryMin,
                        job.salaryMax,
                        job.salaryCurrency
                      ) && (
                        <p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          {formatSalary(
                            job.salaryMin,
                            job.salaryMax,
                            job.salaryCurrency
                          )}
                        </p>
                      )}
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
                );
              }
            )}
          </div>
        )}
      </section>

      {/* COUNTRIES */}
      <section className="border-y border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
              className="inline-flex w-fit items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Browse All Countries →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {previewCountries.map(
              ({
                country,
                countryCode,
                count,
              }) => (
                <Link
                  key={country}
                  href={`/jobs/${slugify(
                    country
                  )}`}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex min-h-[116px] flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <span
                        className="block text-4xl leading-none sm:text-5xl"
                        aria-label={`${country} flag`}
                        role="img"
                      >
                        {countryCodeToFlag(
                          countryCode
                        )}
                      </span>

                      <span className="text-xs font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100 dark:text-indigo-400">
                        →
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {country}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {count} published{" "}
                        {count === 1
                          ? "job"
                          : "jobs"}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
              className="inline-flex w-fit items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Browse All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {previewCategories.map(
              ({
                category,
                count,
              }) => {
                const CategoryIcon =
                  getCategoryIcon(
                    category
                  );

                return (
                  <Link
                    key={
                      category
                    }
                    href={`/categories/${slugify(
                      category
                    )}`}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                      <CategoryIcon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-3 font-bold text-slate-900 dark:text-white">
                      {category}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {count} published{" "}
                      {count === 1
                        ? "job"
                        : "jobs"}
                    </p>
                  </Link>
                );
              }
            )}
          </div>
        </div>
      </section>
    </main>
  );
}