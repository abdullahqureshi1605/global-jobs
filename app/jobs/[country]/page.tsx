import type { Metadata } from "next";
import Link from "next/link";

import { CityService } from "@/services/cityService";
import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";

interface Props {
  params: Promise<{
    country: string;
  }>;
}

const COUNTRY_NAMES: Record<
  string,
  string
> = {
  pakistan: "Pakistan",
  india: "India",
  canada: "Canada",
  "united-states":
    "United States",
  "united-kingdom":
    "United Kingdom",
  australia: "Australia",
  germany: "Germany",
  france: "France",
  netherlands:
    "Netherlands",
  ireland: "Ireland",
  spain: "Spain",
  italy: "Italy",
  portugal: "Portugal",
  switzerland:
    "Switzerland",
  austria: "Austria",
  belgium: "Belgium",
  sweden: "Sweden",
  norway: "Norway",
  denmark: "Denmark",
  finland: "Finland",
  poland: "Poland",
  bangladesh:
    "Bangladesh",
  nepal: "Nepal",
  china: "China",
  japan: "Japan",
  "south-korea":
    "South Korea",
  singapore: "Singapore",
  malaysia: "Malaysia",
  indonesia: "Indonesia",
  thailand: "Thailand",
  philippines:
    "Philippines",
  "saudi-arabia":
    "Saudi Arabia",
  "united-arab-emirates":
    "United Arab Emirates",
  qatar: "Qatar",
  kuwait: "Kuwait",
  bahrain: "Bahrain",
  oman: "Oman",
  "south-africa":
    "South Africa",
  nigeria: "Nigeria",
  kenya: "Kenya",
  egypt: "Egypt",
  brazil: "Brazil",
  mexico: "Mexico",
  argentina: "Argentina",
  chile: "Chile",
  "new-zealand":
    "New Zealand",
};

export const dynamic =
  "force-dynamic";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { country } =
    await params;

  const countryName =
    COUNTRY_NAMES[
      country
    ];

  return {
    title: countryName
      ? `${countryName} Jobs | Horizon Jobs`
      : "Country Jobs | Horizon Jobs",

    description: countryName
      ? `Explore jobs and opportunities in ${countryName}.`
      : "Explore jobs by country.",
  };
}

export default async function CountryJobsPage({
  params,
}: Props) {
  const { country } =
    await params;

  const countryName =
    COUNTRY_NAMES[
      country
    ];

  if (!countryName) {
    return (
      <main className="min-h-screen bg-slate-100 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Country Not Found
          </h1>
        </div>
      </main>
    );
  }

  const cityCounts =
    await CityService.getCityCounts(
      countryName
    );

  const jobs =
    await JobService.getJobsByCountry(
      countryName
    );

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Country Jobs
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Jobs in {countryName}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {jobs.length} published{" "}
            {jobs.length === 1
              ? "job"
              : "jobs"}{" "}
            across{" "}
            {cityCounts.length}{" "}
            cities.
          </p>
        </header>

        {/* CITY CARDS */}
        {cityCounts.length >
          0 && (
          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Jobs by City
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose a city to see only jobs available there.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {cityCounts.map(
                (item) => (
                  <Link
                    key={
                      item.city
                    }
                    href={`/jobs/${country}/${slugify(
                      item.city
                    )}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                      {item.city}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {item.count}{" "}
                      {item.count === 1
                        ? "job"
                        : "jobs"}
                    </p>

                    <span className="mt-4 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      View City Jobs →
                    </span>
                  </Link>
                )
              )}
            </div>
          </section>
        )}

        {/* ALL COUNTRY JOBS */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              All Jobs in {countryName}
            </h2>
          </div>

          {jobs.length ===
          0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500">
                No published jobs available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map(
                (job) => (
                  <article
                    key={job.id}
                    className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {job.company}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          {job.category}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {job.city}
                        </span>
                      </div>
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
    </main>
  );
}