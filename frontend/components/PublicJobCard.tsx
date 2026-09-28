"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Job } from "@/lib/jobs";

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function getCountryCode(job: Job): string | null {
  const country = one(job.countries);
  if (country?.code) return country.code.toUpperCase();

  const location = String(
    job.city || country?.name || ""
  ).trim().toLowerCase();

  const cityMap: Record<string, string> = {
    "liberty lake": "US",
    "veradale": "US",
    "jersey city": "US",
    "austin": "US",
    "new york": "US",
    "seattle": "US",
    "chicago": "US",
    "houston": "US",
    "dallas": "US",
    "boston": "US",
    "denver": "US",
    "phoenix": "US",
    "los angeles": "US",
    "san francisco": "US",
    "miami": "US",
    "atlanta": "US",
    "canberra": "AU",
    "sydney": "AU",
    "melbourne": "AU",
    "toronto": "CA",
    "vancouver": "CA",
    "manchester": "GB",
    "london": "GB",
    "abbottabad": "PK",
    "islamabad": "PK",
    "lahore": "PK",
    "karachi": "PK",
    "munich": "DE",
    "berlin": "DE",
    "paris": "FR",
    "dublin": "IE",
    "delhi": "IN",
    "mumbai": "IN",
  };

  const firstPart = location.split(",")[0].trim();

  if (cityMap[firstPart]) {
    return cityMap[firstPart];
  }

  const statePattern =
    /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/i;

  if (statePattern.test(location)) {
    return "US";
  }

  const patterns: Array<[RegExp, string]> = [
    [/\b(united states|usa|u\.s\.a\.|u\.s\.)\b/i, "US"],
    [/\b(canada)\b/i, "CA"],
    [/\b(australia)\b/i, "AU"],
    [/\b(united kingdom|uk)\b/i, "GB"],
    [/\b(pakistan)\b/i, "PK"],
    [/\b(germany)\b/i, "DE"],
    [/\b(france)\b/i, "FR"],
    [/\b(ireland)\b/i, "IE"],
    [/\b(india)\b/i, "IN"],
    [/\b(philippines)\b/i, "PH"],
    [/\b(singapore)\b/i, "SG"],
    [/\b(japan)\b/i, "JP"],
    [/\b(united arab emirates|uae)\b/i, "AE"],
    [/\b(saudi arabia|ksa)\b/i, "SA"],
  ];

  for (const [pattern, code] of patterns) {
    if (pattern.test(location)) return code;
  }

  return null;
}

function getCurrency(code: string | null, job: Job): string {
  if (job.currency) return job.currency;

  const currencies: Record<string, string> = {
    US: "USD",
    CA: "CAD",
    GB: "GBP",
    AU: "AUD",
    PK: "PKR",
    DE: "EUR",
    FR: "EUR",
    IE: "EUR",
    NZ: "NZD",
    IN: "INR",
    PH: "PHP",
    SG: "SGD",
    JP: "JPY",
    AE: "AED",
    SA: "SAR",
  };

  return code ? currencies[code] || "" : "";
}

function formatSalary(job: Job, countryCode: string | null): string {
  if (job.salary_min == null && job.salary_max == null) {
    return "Salary not specified";
  }

  const currency = getCurrency(countryCode, job);

  const clean = (value: number) =>
    Math.trunc(value).toLocaleString("en-US");

  if (job.salary_min != null && job.salary_max != null) {
    return `${clean(job.salary_min)} – ${clean(job.salary_max)}${currency ? ` ${currency}` : ""}`;
  }

  if (job.salary_min != null) {
    return `${clean(job.salary_min)}+${currency ? ` ${currency}` : ""}`;
  }

  return `Up to ${clean(job.salary_max!)}${currency ? ` ${currency}` : ""}`;
}

function getWorkMode(job: Job): string {
  const text = `${job.title || ""} ${job.summary || ""} ${job.description || ""}`.toLowerCase();

  if (job.work_mode) {
    const value = job.work_mode.toLowerCase();

    if (value.includes("remote")) return "Remote";
    if (value.includes("hybrid")) return "Hybrid";

    return "On-site";
  }

  if (text.includes("hybrid")) return "Hybrid";
  if (text.includes("remote") || text.includes("work from home")) {
    return "Remote";
  }

  return "On-site";
}

export default function PublicJobCard({
  job,
  href,
  countryCode: suppliedCountryCode,
}: {
  job: Job;
  href?: string;
  countryCode?: string | null;
}) {
  const company = one(job.companies);
  const category = one(job.categories);

  const countryCode =
    suppliedCountryCode?.toUpperCase() ||
    getCountryCode(job);

  const location =
    String(job.city || one(job.countries)?.name || "").trim() ||
    "Location not specified";

  const workMode = getWorkMode(job);

  return (
    <Link
      href={href || `/jobs/${job.slug}`}
      className="public-job-card group block w-full max-w-full min-w-0 overflow-hidden border border-[#E3E8EF] bg-white p-4 shadow-none transition-[border-color] duration-150 hover:border-[#3E7BFA] sm:p-[18px]"
    >
      <div className="flex min-w-0 gap-3">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#162A48] leading-none">
          {countryCode ? (
            <span
              className={`fi fi-${countryCode.toLowerCase()}`}
              aria-label={countryCode}
            />
          ) : (
            <span className="text-[15px] text-white">🌐</span>
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <h3 className="break-words text-[15px] font-bold leading-5 text-[#0B1526] sm:text-[16px]">
            {job.title}
          </h3>

          <p className="mt-0.5 truncate text-[12px] text-[#45617F] sm:text-[13px]">
            {company?.name || "Employer"}
          </p>

          <div className="mt-2.5 flex min-w-0 flex-wrap gap-1.5">
            {category?.name && (
              <span className="max-w-full truncate rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
                {category.name}
              </span>
            )}

            <span className="shrink-0 rounded-full bg-[#F0F2F5] px-2.5 py-1 text-[11px] font-semibold text-[#45617F]">
              {workMode}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex min-w-0 items-center justify-between gap-2 border-t border-[#E3E8EF] pt-3 sm:mt-3.5 sm:pt-3.5">
        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[11px] text-[#45617F] sm:text-[12px]">
          <MapPin size={14} className="shrink-0 text-[#7890AA]" />
          <span className="min-w-0 truncate">{location}</span>
        </span>

        <span className="max-w-[48%] shrink-0 break-words text-right text-[12px] font-semibold leading-4 text-[#0B1526] sm:max-w-none sm:text-[13px]">
          {formatSalary(job, countryCode)}
        </span>
      </div>
    </Link>
  );
}
