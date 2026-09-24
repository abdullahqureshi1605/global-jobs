import Link from "next/link";
import {
  BriefcaseBusiness,
  MapPin,
  Search,
} from "lucide-react";
import { getPublishedJobs, type Job } from "@/lib/jobs";
import PublicJobCard from "@/components/PublicJobCard";
import { createClient } from "@/lib/supabase-server";

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

const countryNames: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  PK: "Pakistan",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  IE: "Ireland",
  NZ: "New Zealand",
  IN: "India",
  PH: "Philippines",
  SG: "Singapore",
  JP: "Japan",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  MY: "Malaysia",
};

const currencies: Record<string, string> = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  PK: "PKR",
  AU: "AUD",
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
  MY: "MYR",
};

const cityCountryMap: Record<string, string> = {
  "liberty lake": "US",
  veradale: "US",
  "jersey city": "US",
  austin: "US",
  "new york": "US",
  seattle: "US",
  chicago: "US",
  houston: "US",
  dallas: "US",
  boston: "US",
  denver: "US",
  phoenix: "US",
  "los angeles": "US",
  "san francisco": "US",
  miami: "US",
  atlanta: "US",
  canberra: "AU",
  sydney: "AU",
  melbourne: "AU",
  toronto: "CA",
  vancouver: "CA",
  manchester: "GB",
  london: "GB",
  abbottabad: "PK",
  islamabad: "PK",
  lahore: "PK",
  karachi: "PK",
  munich: "DE",
  berlin: "DE",
  paris: "FR",
  dublin: "IE",
  delhi: "IN",
  mumbai: "IN",
};

const countryPatterns: Record<string, RegExp> = {
  US: /\b(united states|usa|new york|california|texas|florida|washington|chicago|austin|seattle|boston|denver|phoenix|atlanta|dallas|houston|los angeles|san francisco|miami|liberty lake|veradale|jersey city)\b/i,
  CA: /\b(canada|ontario|quebec|alberta|british columbia|toronto|vancouver|montreal|calgary|ottawa|edmonton|winnipeg)\b/i,
  AU: /\b(australia|new south wales|victoria|queensland|western australia|sydney|melbourne|brisbane|perth|adelaide|canberra)\b/i,
  GB: /\b(united kingdom|england|scotland|wales|london|manchester|birmingham|liverpool|leeds|glasgow|edinburgh)\b/i,
  PK: /\b(pakistan|islamabad|rawalpindi|lahore|karachi|peshawar|abbottabad|multan|quetta|faisalabad|sialkot)\b/i,
  DE: /\b(germany|berlin|munich|hamburg|frankfurt|cologne|stuttgart|dusseldorf)\b/i,
  FR: /\b(france|paris|lyon|marseille|toulouse|nice|bordeaux|lille)\b/i,
  IN: /\b(india|delhi|new delhi|mumbai|bangalore|bengaluru|hyderabad|chennai|pune|kolkata|ahmedabad)\b/i,
  MY: /\b(malaysia|kuala lumpur|penang|johor|selangor|putrajaya|malacca|ipoh)\b/i,
  PH: /\b(philippines|manila|cebu|davao)\b/i,
  SG: /\b(singapore)\b/i,
  AE: /\b(united arab emirates|uae|dubai|abu dhabi|sharjah)\b/i,
  SA: /\b(saudi arabia|riyadh|jeddah|dammam|mecca|medina)\b/i,
};

/*
 * These are the same 12 curated categories used by the homepage.
 * The filter values are stable keys so duplicate database categories
 * do not create duplicate filter options.
 */
const filterCategories = [
  {
    key: "it",
    name: "IT & Technology",
    match: /(^|[^a-z])(it|technology|software|computing|data|analytics|developer|programming)([^a-z]|$)/i,
  },
  {
    key: "healthcare",
    name: "Healthcare",
    match: /(health|healthcare|nursing|nurse|medical|pharma|doctor)/i,
  },
  {
    key: "logistics",
    name: "Logistics",
    match: /(logistics|warehouse|transport|delivery|supply chain)/i,
  },
  {
    key: "design",
    name: "Design & Creative",
    match: /(design|creative|graphic|ux|ui)/i,
  },
  {
    key: "finance",
    name: "Finance & Accounting",
    match: /(finance|account|accounting|banking|audit)/i,
  },
  {
    key: "trades",
    name: "Trades & Construction",
    match: /(trade|construction|electric|plumb|maintenance|building)/i,
  },
  {
    key: "customer",
    name: "Customer Service",
    match: /(customer|client service|call centre|call center)/i,
  },
  {
    key: "retail",
    name: "Retail",
    match: /(retail|store|shop|merchand)/i,
  },
  {
    key: "education",
    name: "Education",
    match: /(education|teaching|teacher|school|training|academic)/i,
  },
  {
    key: "marketing",
    name: "Marketing & Sales",
    match: /(marketing|sales|advertis|public relations|pr jobs)/i,
  },
  {
    key: "legal",
    name: "Legal",
    match: /(legal|lawyer|solicitor|attorney)/i,
  },
  {
    key: "hospitality",
    name: "Hospitality & Catering",
    match: /(hospitality|catering|restaurant|hotel|chef|cook)/i,
  },
] as const;

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .trim();
}

function getJobCountryCode(job: Job) {
  const relatedCode = String(
    one(job.countries)?.code || ""
  ).toUpperCase();

  if (relatedCode) {
    return relatedCode;
  }

  const city = String(job.city || "")
    .trim()
    .toLowerCase();

  if (cityCountryMap[city]) {
    return cityCountryMap[city];
  }

  for (const [code, pattern] of Object.entries(countryPatterns)) {
    if (pattern.test(String(job.city || ""))) {
      return code;
    }
  }

  return "";
}

function jobMatchesCategory(
  job: Job,
  key: string
) {
  const category = one(job.categories);

  const value = [
    category?.name || "",
    category?.slug || "",
  ].join(" ");

  const definition = filterCategories.find(
    (item) => item.key === key
  );

  return definition
    ? definition.match.test(value)
    : false;
}

function money(job: Job) {
  if (
    job.salary_min == null &&
    job.salary_max == null
  ) {
    return "Salary not specified";
  }

  const code = getJobCountryCode(job);

  const currencyCode =
    job.currency ||
    currencies[code] ||
    "";

  const currency = currencyCode
    ? ` ${currencyCode}`
    : "";

  const min =
    job.salary_min != null
      ? Math.trunc(job.salary_min).toLocaleString("en-US")
      : null;

  const max =
    job.salary_max != null
      ? Math.trunc(job.salary_max).toLocaleString("en-US")
      : null;

  if (min != null && max != null) {
    return `${min} – ${max}${currency}`;
  }

  return min != null
    ? `${min}+${currency}`
    : `Up to ${max}${currency}`;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
}) {
  const p = await searchParams;

  const search =
    typeof p.search === "string"
      ? p.search
      : "";

  const location =
    typeof p.location === "string"
      ? p.location
      : "";

  const category =
    typeof p.category === "string"
      ? p.category
      : "";

  const country =
    typeof p.country === "string"
      ? p.country.toUpperCase()
      : "";

  const workMode =
    typeof p.workMode === "string"
      ? p.workMode
      : "";

  const supabase = await createClient();

  const countryResult =
    await supabase
      .from("countries")
      .select("id,name,code")
      .order("name");

  /*
   * De-duplicate countries by country code.
   */
  const countryMap = new Map<
    string,
    { id: string; name: string; code: string }
  >();

  for (const item of countryResult.data || []) {
    const code = String(
      item.code || ""
    ).toUpperCase();

    if (
      code &&
      !countryMap.has(code)
    ) {
      countryMap.set(code, {
        id: item.id,
        name: item.name,
        code,
      });
    }
  }

  const countries = Array.from(
    countryMap.values()
  ).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  let jobs: Job[] = [];
  let failed = false;

  try {
    jobs = await getPublishedJobs(
      search,
      location,
      2000,
      ""
    );
  } catch {
    failed = true;
  }

  const normalizedWorkMode =
    normalize(workMode);

  const filteredJobs = jobs.filter(
    (job) => {
      if (category) {
        if (
          !jobMatchesCategory(
            job,
            category
          )
        ) {
          return false;
        }
      }

      if (country) {
        if (
          getJobCountryCode(job) !==
          country
        ) {
          return false;
        }
      }

      if (normalizedWorkMode) {
        const jobMode = normalize(
          String(job.work_mode || "")
        );

        if (
          jobMode !==
          normalizedWorkMode
        ) {
          return false;
        }
      }

      return true;
    }
  );

  const hasFilters = Boolean(
    search ||
      location ||
      category ||
      country ||
      workMode
  );

  return (
    <main className="horizon-page bg-[#F6F8FB]">

      {/* COMPACT SEARCH HEADER */}
      <section className="bg-[#071a35] text-white">
        <div className="horizon-container py-6 md:py-7">

          <p className="horizon-eyebrow">
            Horizon Jobs marketplace
          </p>

          <h1 className="mt-2 font-serif text-[30px] font-semibold leading-tight sm:text-[34px]">
            Find your next opportunity
          </h1>

          <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-white/65">
            Search published opportunities from the Horizon Jobs database.
          </p>

          <form
            action="/jobs"
            className="mt-4 grid gap-1.5 rounded-[10px] border border-white/10 bg-white p-1.5 md:grid-cols-[1fr_1fr_auto]"
          >
            <label className="flex items-center gap-2 rounded-md border border-[#E3E8EF] bg-white px-3">
              <Search
                size={16}
                className="shrink-0 text-[#8CA0B8]"
              />

              <input
                name="search"
                defaultValue={search}
                className="h-10 min-w-0 w-full bg-transparent text-[13px] text-[#0B1526] outline-none"
                placeholder="Job title, company or keyword"
              />
            </label>

            <label className="flex items-center gap-2 rounded-md border border-[#E3E8EF] bg-white px-3">
              <MapPin
                size={16}
                className="shrink-0 text-[#8CA0B8]"
              />

              <input
                name="location"
                defaultValue={location}
                className="h-10 min-w-0 w-full bg-transparent text-[13px] text-[#0B1526] outline-none"
                placeholder="City or country"
              />
            </label>

            <button
              type="submit"
              className="h-10 rounded-md bg-[#3E7BFA] px-6 text-[13px] font-bold text-white transition hover:bg-[#F0BA3D]"
            >
              Search jobs
            </button>
          </form>

        </div>
      </section>

      {/* RESULTS — NO EXTRA HEADING OR RESULTS BAR */}
      <section className="horizon-container py-4 md:py-5">

        {failed ? (

          <div className="horizon-card border-red-200 bg-red-50 p-7">
            <h3 className="font-bold text-red-900">
              Jobs could not be loaded
            </h3>

            <p className="mt-2 text-[13px] leading-5 text-red-700">
              The database connection is unavailable. No fake jobs are shown.
            </p>
          </div>

        ) : (

          <div className="grid gap-4 lg:grid-cols-[225px_minmax(0,1fr)]">

            {/* FILTERS */}
            <aside className="h-fit rounded-xl border border-[#E3E8EF] bg-white p-4">

              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#0B1526]">
                  Filters
                </h3>

                {hasFilters && (
                  <Link
                    href="/jobs"
                    className="text-[11px] font-bold text-[#2563EB]"
                  >
                    Clear
                  </Link>
                )}
              </div>

              <form
                action="/jobs"
                className="mt-4 space-y-4"
              >

                <input
                  type="hidden"
                  name="search"
                  value={search}
                />

                <input
                  type="hidden"
                  name="location"
                  value={location}
                />

                {/* 12 CURATED CATEGORIES */}
                <div>
                  <label className="mb-2 block text-[12px] font-bold text-[#0B1526]">
                    Category
                  </label>

                  <select
                    name="category"
                    defaultValue={category}
                    className="h-9 w-full rounded-lg border border-[#D5DDE8] bg-white px-2.5 text-[12px] text-[#45617F] outline-none focus:border-[#3E7BFA]"
                  >
                    <option value="">
                      All categories
                    </option>

                    {filterCategories.map(
                      (item) => (
                        <option
                          key={item.key}
                          value={item.key}
                        >
                          {item.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* UNIQUE COUNTRIES */}
                <div>
                  <label className="mb-2 block text-[12px] font-bold text-[#0B1526]">
                    Country
                  </label>

                  <select
                    name="country"
                    defaultValue={country}
                    className="h-9 w-full rounded-lg border border-[#D5DDE8] bg-white px-2.5 text-[12px] text-[#45617F] outline-none focus:border-[#3E7BFA]"
                  >
                    <option value="">
                      All countries
                    </option>

                    {countries.map(
                      (item) => (
                        <option
                          key={item.code}
                          value={item.code}
                        >
                          {item.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* EXACTLY THREE WORK MODES */}
                <div>
                  <label className="mb-2 block text-[12px] font-bold text-[#0B1526]">
                    Work mode
                  </label>

                  <select
                    name="workMode"
                    defaultValue={workMode}
                    className="h-9 w-full rounded-lg border border-[#D5DDE8] bg-white px-2.5 text-[12px] text-[#45617F] outline-none focus:border-[#3E7BFA]"
                  >
                    <option value="">
                      All work modes
                    </option>

                    <option value="Remote">
                      Remote
                    </option>

                    <option value="Hybrid">
                      Hybrid
                    </option>

                    <option value="On-site">
                      On-site
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="h-9 w-full rounded-lg bg-[#0B1526] text-[12px] font-bold text-white transition hover:bg-[#162A48]"
                >
                  Apply filters
                </button>

              </form>

              <div className="mt-4 border-t border-[#E3E8EF] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#7890AA]">
                    Results
                  </span>

                  <span className="text-[13px] font-bold text-[#0B1526]">
                    {filteredJobs.length}
                  </span>
                </div>
              </div>

            </aside>

            {/* JOB CARDS */}
            <div className="min-w-0">

              {filteredJobs.length === 0 ? (

                <div className="horizon-card p-10 text-center">
                  <BriefcaseBusiness
                    className="mx-auto text-[#B8C4D5]"
                    size={38}
                  />

                  <h3 className="mt-4 text-[17px] font-bold text-[#0B1526]">
                    No published jobs found
                  </h3>

                  <p className="mt-2 text-[13px] text-[#7890AA]">
                    Try changing your search or filters.
                  </p>

                  <Link
                    href="/jobs"
                    className="mt-4 inline-flex text-[13px] font-bold text-[#2563EB]"
                  >
                    View all jobs
                  </Link>
                </div>

              ) : (

                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredJobs.map(
                    (job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                      />
                    )
                  )}
                </div>

              )}

            </div>

          </div>

        )}

      </section>
    </main>
  );
}

function JobCard({job}:{job:Job}) {
  return <PublicJobCard job={job} />;
}

