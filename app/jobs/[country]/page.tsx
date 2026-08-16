import type { Metadata } from "next";
import Link from "next/link";

import { CityService } from "@/services/cityService";
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

function resolveCountry(
  slug: string
) {
  return (
    COUNTRY_NAMES[slug] ??
    null
  );
}

export const dynamic =
  "force-dynamic";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { country } =
    await params;

  const countryName =
    resolveCountry(
      country
    );

  return {
    title: countryName
      ? `${countryName} Jobs | Horizon Jobs`
      : "Country Jobs | Horizon Jobs",

    description: countryName
      ? `Explore jobs by city in ${countryName}.`
      : "Explore jobs by country.",
  };
}

export default async function CountryJobsPage({
  params,
}: Props) {
  const { country } =
    await params;

  const countryName =
    resolveCountry(
      country
    );

  if (!countryName) {
    return (
      <main className="min-h-screen bg-slate-100 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Country Not Found
            </h1>

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

  const cityCounts =
    await CityService.getCityCounts(
      countryName
    );

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* COUNTRY HEADER */}
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Country Jobs
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Jobs in {countryName}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Browse available jobs by city.
          </p>
        </header>

        {/* CITY SECTION ONLY */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Cities with Jobs
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select a city to see its published opportunities.
            </p>
          </div>

          {cityCounts.length ===
          0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                No city jobs available
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                There are currently no published jobs in this country.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cityCounts.map(
                (item) => (
                  <Link
                    key={
                      item.city
                    }
                    href={`/jobs/${country}/${slugify(
                      item.city
                    )}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                          {item.city}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          {item.count}{" "}
                          {item.count === 1
                            ? "job"
                            : "jobs"}
                        </p>
                      </div>

                      <span className="text-lg text-indigo-500 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>

                    <div className="mt-6 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      View City Jobs
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}