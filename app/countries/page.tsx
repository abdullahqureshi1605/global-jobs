import type { Metadata } from "next";
import Link from "next/link";

import { MapPin } from "lucide-react";

import { TaxonomyService } from "@/services/taxonomyService";
import { slugify } from "@/lib/utils/slug";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title:
    "Jobs by Country | Horizon Jobs",

  description:
    "Explore global job opportunities by country.",
};

function countryFlag(
  country: string,
  code?: string
) {
  const iso =
    (code || "")
      .trim()
      .toUpperCase();

  if (iso.length === 2) {
    return String.fromCodePoint(
      ...iso
        .split("")
        .map(
          (char) =>
            127397 +
            char.charCodeAt(0)
        )
    );
  }

  const fallback: Record<
    string,
    string
  > = {
    Australia: "AU",
    Canada: "CA",
    Pakistan: "PK",
    India: "IN",
    Germany: "DE",
    France: "FR",
    "United States": "US",
    "United Kingdom": "GB",
    "United Arab Emirates": "AE",
  };

  const fallbackCode =
    fallback[country];

  if (!fallbackCode) {
    return "🌍";
  }

  return String.fromCodePoint(
    ...fallbackCode
      .split("")
      .map(
        (char) =>
          127397 +
          char.charCodeAt(0)
      )
  );
}

export default async function CountriesPage() {
  const countries =
    await TaxonomyService.getCountryCounts();

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Global Markets
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            Jobs by Country
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Select a country to explore cities with available jobs.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {countries.map(
            (country) => (
              <Link
                key={country.country}
                href={`/countries/${slugify(
                  country.country
                )}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-5xl leading-none"
                    role="img"
                    aria-label={`${country.country} flag`}
                  >
                    {countryFlag(
                      country.country,
                      country.countryCode
                    )}
                  </span>

                  <MapPin className="h-5 w-5 text-slate-400 group-hover:text-indigo-500" />
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                  {country.country}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {country.count} published{" "}
                  {country.count === 1
                    ? "job"
                    : "jobs"}
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  View Cities →
                </span>
              </Link>
            )
          )}
        </div>
      </div>
    </main>
  );
}