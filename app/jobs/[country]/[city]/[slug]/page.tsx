import type { Metadata } from "next";
import Link from "next/link";

import { JobService } from "@/services/jobService";
import { CityService } from "@/services/cityService";
import { slugify } from "@/lib/utils/slug";

interface Props {
  params: Promise<{
    country: string;
    city: string;
  }>;
}

export const dynamic =
  "force-dynamic";

function titleize(
  value: string
) {
  return decodeURIComponent(
    value
  )
    .replace(
      /[-_]+/g,
      " "
    )
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
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

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const {
    country,
    city,
  } = await params;

  const countryName =
    COUNTRY_NAMES[
      country
    ] ??
    titleize(
      country
    );

  const cityName =
    titleize(
      city
    );

  return {
    title:
      `${cityName}, ${countryName} Jobs | Horizon Jobs`,

    description:
      `Explore published jobs in ${cityName}, ${countryName}.`,
  };
}

export default async function CityJobsPage({
  params,
}: Props) {
  const {
    country,
    city,
  } = await params;

  const countryName =
    COUNTRY_NAMES[
      country
    ] ??
    titleize(
      country
    );

  const cityName =
    titleize(
      city
    );

  const cityCounts =
    await CityService.getCityCounts(
      countryName
    );

  const matchedCity =
    cityCounts.find(
      (item) =>
        slugify(
          item.city
        ) === city
    );

  if (!matchedCity) {
    return (
      <main className="min-h-screen bg-slate-100 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              City Not Found
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              No published jobs currently exist for this city.
            </p>

            <Link
              href={`/jobs/${country}`}
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Browse {countryName} Jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const jobs =
    await JobService.getJobsByCountry(
      countryName
    );

  const cityJobs =
    jobs.filter(
      (job) =>
        slugify(
          job.city
        ) === city
    );

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            City Jobs
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Jobs in {cityName}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {countryName} ·{" "}
            {matchedCity.count} published{" "}
            {matchedCity.count === 1
              ? "job"
              : "jobs"}
          </p>
        </header>

        {cityJobs.length ===
        0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            No published jobs available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cityJobs.map(
              (job) => (
                <article
                  key={job.id}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
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

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {job.category}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {job.workplaceType}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {job.employmentType}
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
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}