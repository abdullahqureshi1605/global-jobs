import type { Metadata } from "next";
import Link from "next/link";

import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";
import { countryCodeToFlag } from "@/lib/utils/countryFlag";
import {
  getCategoryIcon,
} from "@/lib/utils/categoryIcon";

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

async function resolveCountry(
  slug: string
) {
  return (
    COUNTRY_NAMES[slug] ??
    null
  );
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { country } =
    await params;

  const countryName =
    await resolveCountry(
      country
    );

  return {
    title: countryName
      ? `${countryName} Jobs | Horizon Jobs`
      : "Country Jobs | Horizon Jobs",

    description: countryName
      ? `Explore published jobs in ${countryName}.`
      : "Explore published jobs by country.",
  };
}

export default async function CountryJobsPage({
  params,
}: Props) {
  const { country } =
    await params;

  const countryName =
    await resolveCountry(
      country
    );

  if (!countryName) {
    return (
      <NotFound />
    );
  }

  const jobs =
    await JobService.getJobsByCountry(
      countryName
    );

  const countryCode =
    jobs[0]?.countryCode ??
    "";

  const flag =
    countryCodeToFlag(
      countryCode
    );

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <span className="text-5xl">
              {flag}
            </span>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Country Jobs
              </p>

              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                Jobs in{" "}
                {countryName}
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {jobs.length} published{" "}
            {jobs.length === 1
              ? "job"
              : "jobs"}{" "}
            available.
          </p>
        </header>

        {jobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No jobs available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no published jobs in{" "}
              {countryName}.
            </p>

            <Link
              href="/countries"
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Browse Countries
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map(
              (job) => {
                const CategoryIcon =
                  getCategoryIcon(
                    job.category
                  );

                return (
                  <article
                    key={job.id}
                    className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex-1">
                      {job.featured && (
                        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Featured
                        </span>
                      )}

                      <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                        {job.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {job.company}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          <CategoryIcon className="h-3.5 w-3.5" />
                          {job.category}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {job.city}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {
                            job.workplaceType
                          }
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {job.description}
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
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="min-h-screen bg-slate-100 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Country Not Found
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            This country is not currently available.
          </p>

          <Link
            href="/countries"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Browse Countries
          </Link>
        </div>
      </div>
    </main>
  );
}