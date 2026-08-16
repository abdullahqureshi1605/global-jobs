import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CityService } from "@/services/cityService";
import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";
import CountryFlag from "@/components/countries/CountryFlag";
import {
  getCategoryIcon,
} from "@/lib/utils/categoryIcon";

interface Props {
  params: Promise<{
    country: string;
    city: string;
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
  netherlands: "Netherlands",
  ireland: "Ireland",
  spain: "Spain",
  italy: "Italy",
  portugal: "Portugal",
  switzerland: "Switzerland",
  austria: "Austria",
  belgium: "Belgium",
  sweden: "Sweden",
  norway: "Norway",
  denmark: "Denmark",
  finland: "Finland",
  poland: "Poland",
  bangladesh: "Bangladesh",
  nepal: "Nepal",
  china: "China",
  japan: "Japan",
  "south-korea": "South Korea",
  singapore: "Singapore",
  malaysia: "Malaysia",
  indonesia: "Indonesia",
  thailand: "Thailand",
  philippines: "Philippines",
  "saudi-arabia": "Saudi Arabia",
  "united-arab-emirates":
    "United Arab Emirates",
  qatar: "Qatar",
  kuwait: "Kuwait",
  bahrain: "Bahrain",
  oman: "Oman",
  "south-africa": "South Africa",
  nigeria: "Nigeria",
  kenya: "Kenya",
  egypt: "Egypt",
  brazil: "Brazil",
  mexico: "Mexico",
  argentina: "Argentina",
  chile: "Chile",
  "new-zealand": "New Zealand",
};

export const dynamic =
  "force-dynamic";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const {
    country,
    city,
  } = await params;

  const countryName =
    COUNTRY_NAMES[country];

  return {
    title:
      `${city} Jobs in ${
        countryName ?? country
      } | Horizon Jobs`,

    description:
      `Find jobs in ${city}, ${
        countryName ?? country
      }.`,
  };
}

export default async function CityPage({
  params,
}: Props) {
  const {
    country,
    city,
  } = await params;

  const countryName =
    COUNTRY_NAMES[country];

  if (!countryName) {
    notFound();
  }

  const cities =
    await CityService.getCityCounts(
      countryName
    );

  const matchingCity =
    cities.find(
      (item) =>
        slugify(item.city) ===
        city
    );

  if (!matchingCity) {
    notFound();
  }

  const jobs =
    await JobService.getJobsByCountry(
      countryName
    );

  const cityJobs =
    jobs.filter(
      (job) =>
        slugify(job.city) ===
        city
    );

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            City Jobs
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Jobs in {matchingCity.city}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {countryName} ·{" "}
            {cityJobs.length} published{" "}
            {cityJobs.length === 1
              ? "job"
              : "jobs"}
          </p>
        </header>

        {cityJobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No Jobs Available
            </h2>

            <Link
              href={`/countries/${country}`}
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to {countryName}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cityJobs.map(
              (job) => {
                const CategoryIcon =
                  getCategoryIcon(
                    job.category
                  );

                return (
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
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          <CategoryIcon className="h-3.5 w-3.5" />
                          {job.category}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {job.workplaceType}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {job.employmentType}
                        </span>
                      </div>

                      {job.description && (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {job.description}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/jobs/${job.slug}`}
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