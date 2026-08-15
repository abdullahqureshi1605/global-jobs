import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { JobService } from "@/services/jobService";
import { slugify } from "@/lib/utils/slug";

export const revalidate = 30;

export const metadata = {
  title: "Find Jobs | Horizon Jobs",
  description:
    "Search global job opportunities by keyword, location, category, workplace type, employment type, and experience level.",
};

type SearchParams = {
  q?: string;
  location?: string;
  category?: string;
  workplace?: string;
  employment?: string;
  experience?: string;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value)
    ? value[0] || ""
    : value || "";
}

function safeSearchValue(value: string) {
  return value
    .replace(/[,%()]/g, " ")
    .replace(/\\/g, " ")
    .trim()
    .slice(0, 100);
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const q = getValue(params.q).trim();
  const location = getValue(params.location).trim();
  const category = getValue(params.category).trim();
  const workplace = getValue(params.workplace).trim();
  const employment = getValue(params.employment).trim();
  const experience = getValue(params.experience).trim();

  let query = supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("date_posted", {
      ascending: false,
    })
    .limit(60);

  if (q) {
    const value = safeSearchValue(q);

    if (value) {
      query = query.or(
        `title.ilike.%${value}%,company.ilike.%${value}%,description.ilike.%${value}%`
      );
    }
  }

  if (location) {
    const value = safeSearchValue(location);

    if (value) {
      query = query.or(
        `country.ilike.%${value}%,city.ilike.%${value}%`
      );
    }
  }

  if (category) {
    query = query.ilike(
      "category",
      `%${safeSearchValue(category)}%`
    );
  }

  if (workplace) {
    query = query.ilike(
      "workplace_type",
      `%${safeSearchValue(workplace)}%`
    );
  }

  if (employment) {
    query = query.ilike(
      "employment_type",
      `%${safeSearchValue(employment)}%`
    );
  }

  if (experience) {
    query = query.ilike(
      "experience_level",
      `%${safeSearchValue(experience)}%`
    );
  }

  const [
    jobsResult,
    categoryCounts,
  ] = await Promise.all([
    query,
    JobService.getPublishedCategoryCounts(),
  ]);

  if (jobsResult.error) {
    throw new Error(
      `Failed to load jobs: ${jobsResult.error.message}`
    );
  }

  const jobs = jobsResult.data ?? [];

  const categoryOptions = Array.from(
    categoryCounts.keys()
  ).sort();

  const hasFilters =
    Boolean(
      q ||
        location ||
        category ||
        workplace ||
        employment ||
        experience
    );

  return (
    <main className="min-h-screen bg-slate-100 py-8 dark:bg-slate-950 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Global Employment
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Find Your Opportunity
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Search current published jobs by keyword, location,
            category, workplace, employment type, and experience.
          </p>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* SIDEBAR */}
          <aside className="w-full shrink-0 lg:w-80">
            <form
              action="/jobs"
              method="get"
              className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Search & Filters
                </h2>

                <Link
                  href="/jobs"
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Clear
                </Link>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="q"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Keyword
                  </label>

                  <input
                    id="q"
                    name="q"
                    defaultValue={q}
                    placeholder="Job title, company..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Location
                  </label>

                  <input
                    id="location"
                    name="location"
                    defaultValue={location}
                    placeholder="Country or city..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Category
                  </label>

                  <select
                    id="category"
                    name="category"
                    defaultValue={category}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">
                      All categories
                    </option>

                    {categoryOptions.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="workplace"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Workplace
                  </label>

                  <select
                    id="workplace"
                    name="workplace"
                    defaultValue={workplace}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">
                      Any workplace
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

                <div>
                  <label
                    htmlFor="employment"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Employment
                  </label>

                  <select
                    id="employment"
                    name="employment"
                    defaultValue={employment}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">
                      Any employment
                    </option>
                    <option value="Full-time">
                      Full-time
                    </option>
                    <option value="Part-time">
                      Part-time
                    </option>
                    <option value="Contract">
                      Contract
                    </option>
                    <option value="Temporary">
                      Temporary
                    </option>
                    <option value="Internship">
                      Internship
                    </option>
                    <option value="Freelance">
                      Freelance
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="experience"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Experience
                  </label>

                  <select
                    id="experience"
                    name="experience"
                    defaultValue={experience}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">
                      Any experience
                    </option>
                    <option value="Entry Level">
                      Entry Level
                    </option>
                    <option value="Mid Level">
                      Mid Level
                    </option>
                    <option value="Senior">
                      Senior
                    </option>
                    <option value="Executive">
                      Executive
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </aside>

          {/* RESULTS */}
          <section className="min-w-0 flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {hasFilters
                  ? "Filtered Job Results"
                  : "Latest Opportunities"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {jobs.length} published{" "}
                {jobs.length === 1 ? "job" : "jobs"} found.
              </p>
            </div>

            {jobs.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="text-4xl">🔎</div>

                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                  No jobs found
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Try changing your search or removing some filters.
                </p>

                <Link
                  href="/jobs"
                  className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {jobs.map((job) => (
                  <article
                    key={job.id}
                    className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex-1">
                      {job.featured && (
                        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          Featured
                        </span>
                      )}

                      <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {job.company}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {job.city}, {job.country}
                        </span>

                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          {job.category}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {job.workplace_type}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {job.employment_type}
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {job.description}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Link
                        href={`/jobs/${slugify(
                          job.country
                        )}/${slugify(
                          job.city
                        )}/${job.slug}`}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
                      >
                        View Job
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}