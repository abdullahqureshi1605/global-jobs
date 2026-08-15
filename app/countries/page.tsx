import type { Metadata } from "next";
import Link from "next/link";

import { MapPin } from "lucide-react";

import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";
import { countryCodeToFlag } from "@/lib/utils/countryFlag";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title:
    "Jobs by Country | Horizon Jobs",
  description:
    "Explore published global job opportunities by country.",
};

export default async function CountriesPage() {
  const countryMap =
    await JobService.getPublishedCountryCounts();

  const countries =
    Array.from(
      countryMap.entries()
    ).sort(
      (a, b) => b[1] - a[1]
    );

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Global Markets
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Jobs by Country
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            Explore published opportunities by country.
          </p>
        </header>

        {countries.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            No countries are available yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {countries.map(
              ([country, count]) => {
                /*
                 * The job-service count currently returns:
                 * country -> number of jobs.
                 *
                 * For the flag itself, use the country-name
                 * mapping below until countryCode is included
                 * in the aggregate query.
                 */
                const flag =
                  countryFlagFromName(
                    country
                  );

                return (
                  <Link
                    key={country}
                    href={`/jobs/${slugify(
                      country
                    )}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-4xl">
                        {flag}
                      </span>

                      <MapPin className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                      {country}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
        )}
      </div>
    </main>
  );
}

function countryFlagFromName(
  country: string
) {
  const countries: Record<
    string,
    string
  > = {
    "United States": "US",
    "United Kingdom": "GB",
    Canada: "CA",
    Australia: "AU",
    Germany: "DE",
    France: "FR",
    Netherlands: "NL",
    Ireland: "IE",
    Spain: "ES",
    Italy: "IT",
    Portugal: "PT",
    Switzerland: "CH",
    Austria: "AT",
    Belgium: "BE",
    Sweden: "SE",
    Norway: "NO",
    Denmark: "DK",
    Finland: "FI",
    Poland: "PL",
    "Czech Republic": "CZ",
    India: "IN",
    Pakistan: "PK",
    Bangladesh: "BD",
    "Sri Lanka": "LK",
    Nepal: "NP",
    China: "CN",
    Japan: "JP",
    "South Korea": "KR",
    Singapore: "SG",
    Malaysia: "MY",
    Indonesia: "ID",
    Thailand: "TH",
    Philippines: "PH",
    "Saudi Arabia": "SA",
    UAE: "AE",
    "United Arab Emirates": "AE",
    Qatar: "QA",
    Kuwait: "KW",
    Bahrain: "BH",
    Oman: "OM",
    "South Africa": "ZA",
    Nigeria: "NG",
    Kenya: "KE",
    Egypt: "EG",
    Brazil: "BR",
    Mexico: "MX",
    Argentina: "AR",
    Chile: "CL",
    "New Zealand": "NZ",
  };

  return countryCodeToFlag(
    countries[country]
  );
}