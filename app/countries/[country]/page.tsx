import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  const { country } =
    await params;

  const name =
    COUNTRY_NAMES[country];

  return {
    title: name
      ? `${name} Jobs | Horizon Jobs`
      : "Country Jobs | Horizon Jobs",

    description: name
      ? `Find jobs in ${name} by city.`
      : "Explore jobs by country.",
  };
}

export default async function CountryPage({
  params,
}: Props) {
  const { country } =
    await params;

  const countryName =
    COUNTRY_NAMES[country];

  if (!countryName) {
    notFound();
  }

  const cities =
    await CityService.getCityCounts(
      countryName
    );

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Country Jobs
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Jobs in {countryName}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Select a city to see available jobs.
          </p>
        </header>

        {cities.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No Cities Available
            </h2>

            <Link
              href="/countries"
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Browse Countries
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cities.map(
              (city) => (
                <Link
                  key={city.city}
                  href={`/countries/${country}/${slugify(
                    city.city
                  )}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {city.city}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {city.count}{" "}
                    {city.count === 1
                      ? "job"
                      : "jobs"}
                  </p>

                  <span className="mt-5 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    View City Jobs →
                  </span>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}