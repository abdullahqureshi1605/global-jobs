import Link from "next/link";

import {
  ArrowRight,
  Briefcase,
  Globe2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import JobList from "@/components/jobs/JobList";
import {
  JobService,
} from "@/services/jobService";

import {
  ResourceService,
} from "@/services/resourceService";

import {
  slugify,
} from "@/lib/utils/slug";

export const metadata = {
  title:
    "Horizon Jobs | Global Job Discovery Platform",

  description:
    "Discover global employment opportunities, verified job listings, and practical career resources.",

  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const [
    jobs,
    resources,
  ] = await Promise.all([
    JobService.getPublishedJobs(),
    ResourceService.getPublishedResources(),
  ]);

  const latestJobs =
    jobs.slice(0, 6);

  const latestResources =
    resources.slice(0, 3);

  const countryCounts =
    new Map<
      string,
      number
    >();

  const categoryCounts =
    new Map<
      string,
      number
    >();

  for (const job of jobs) {
    countryCounts.set(
      job.country,
      (countryCounts.get(
        job.country
      ) || 0) + 1
    );

    categoryCounts.set(
      job.category,
      (categoryCounts.get(
        job.category
      ) || 0) + 1
    );
  }

  const topCountries =
    Array.from(
      countryCounts.entries()
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 8);

  const topCategories =
    Array.from(
      categoryCounts.entries()
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 8);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">

      {/* Compact Hero */}
      <section className="bg-slate-900 text-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">

          <div className="max-w-4xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Global Job Discovery
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Find Your Next Job
            </h1>

            <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-300 leading-6 sm:leading-7 max-w-2xl mx-auto">
              Search global opportunities and discover practical career
              resources in one place.
            </p>

            <form
              action="/jobs"
              method="GET"
              className="mt-7 sm:mt-8 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-12 gap-2.5 text-left"
            >

              <div className="md:col-span-5 relative">

                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />

                <input
                  type="search"
                  name="keyword"
                  placeholder="Job title, keyword, company"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              <div className="md:col-span-4 relative">

                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />

                <input
                  type="search"
                  name="location"
                  placeholder="Country or city"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm border-0 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              <div className="md:col-span-3">

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  Search Jobs
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>

            </form>

            <div className="mt-4 flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-xs text-slate-400">

              <span>
                Popular:
              </span>

              <Link
                href="/jobs?keyword=Software"
                className="hover:text-white underline underline-offset-2"
              >
                Software
              </Link>

              <Link
                href="/jobs?keyword=Data"
                className="hover:text-white underline underline-offset-2"
              >
                Data
              </Link>

              <Link
                href="/jobs?workplace=Remote"
                className="hover:text-white underline underline-offset-2"
              >
                Remote
              </Link>

              <Link
                href="/jobs?location=Dubai"
                className="hover:text-white underline underline-offset-2"
              >
                Dubai
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            <StatCard
              icon={
                <Briefcase className="w-5 h-5" />
              }
              value={
                jobs.length.toLocaleString()
              }
              label="Published Jobs"
            />

            <StatCard
              icon={
                <Globe2 className="w-5 h-5" />
              }
              value={
                countryCounts.size.toLocaleString()
              }
              label="Countries"
            />

            <StatCard
              icon={
                <ShieldCheck className="w-5 h-5" />
              }
              value="Verified"
              label="Source-Focused Listings"
            />

          </div>

        </div>

      </section>

      {/* Latest Jobs */}
      <section
        id="latest-jobs"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14"
      >

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">

          <div>

            <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
              Fresh Opportunities
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Latest Jobs
            </h2>

          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400"
          >
            View all jobs
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

        {latestJobs.length > 0 ? (
          <JobList
            jobs={latestJobs}
          />
        ) : (
          <EmptyState
            message="No published jobs are available yet."
          />
        )}

      </section>

      {/* Countries */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-12 sm:py-14">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-6">

            <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
              Global Markets
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Explore by Country
            </h2>

          </div>

          {topCountries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

              {topCountries.map(
                ([country, count]) => (
                  <Link
                    key={country}
                    href={
                      `/jobs/${slugify(
                        country
                      )}`
                    }
                    className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 hover:border-indigo-500/50 hover:shadow-lg transition-all"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {country}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          {count}{" "}
                          {count === 1
                            ? "job"
                            : "jobs"}
                        </p>

                      </div>

                      <MapPin className="w-4 h-4 text-slate-400" />

                    </div>

                  </Link>
                )
              )}

            </div>
          ) : (
            <EmptyState
              message="Country data will appear when jobs are published."
            />
          )}

        </div>

      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">

        <div className="mb-6">

          <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
            Career Areas
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Explore by Category
          </h2>

        </div>

        {topCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {topCategories.map(
              ([category, count]) => (
                <Link
                  key={category}
                  href={
                    `/categories/${slugify(
                      category
                    )}`
                  }
                  className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-500/50 hover:shadow-lg transition-all"
                >

                  <Briefcase className="w-5 h-5 text-indigo-500 mb-4" />

                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {category}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {count}{" "}
                    {count === 1
                      ? "job"
                      : "jobs"}
                  </p>

                </Link>
              )
            )}

          </div>
        ) : (
          <EmptyState
            message="Category data will appear when jobs are published."
          />
        )}

      </section>

      {/* Career Resources */}
      <section className="bg-slate-900 text-white py-12 sm:py-14">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">

            <div>

              <p className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                Career Knowledge
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold mt-1">
                Career Resources
              </h2>

            </div>

            <Link
              href="/career-resources"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300"
            >
              View all resources
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

          {latestResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {latestResources.map(
                (resource) => (
                  <article
                    key={resource.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-6"
                  >

                    <span className="text-xs font-semibold text-indigo-300">
                      {resource.category}
                    </span>

                    <h3 className="text-lg font-bold mt-3">
                      {resource.title}
                    </h3>

                    <p className="text-sm text-slate-400 mt-3 line-clamp-3">
                      {resource.description}
                    </p>

                    <Link
                      href={
                        `/career-resources/${resource.slug}`
                      }
                      className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-indigo-300 hover:text-white"
                    >
                      Read article
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                  </article>
                )
              )}

            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-sm text-slate-400">
              New career resources will appear here after publication.
            </div>
          )}

        </div>

      </section>

      {/* Trust */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">

        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 sm:p-9">

          <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
            Platform Standard
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            Clear job sources. Straightforward discovery.
          </h2>

          <p className="text-sm text-slate-500 leading-7 mt-4 max-w-3xl">
            Horizon Jobs organizes employment information and sends applicants
            to the original job source. We are not a staffing agency and do
            not charge applicants simply to discover jobs through the platform.
          </p>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
          >
            Learn About Horizon Jobs
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

      </section>

    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4">

      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
        {icon}
      </div>

      <div>

        <strong className="block text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          {value}
        </strong>

        <span className="text-xs text-slate-500">
          {label}
        </span>

      </div>

    </div>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}