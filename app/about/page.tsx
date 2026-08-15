import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "About Horizon Jobs | Horizon Jobs",
  description:
    "Learn about Horizon Jobs, an independent global job discovery platform.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            About Horizon Jobs
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            About Horizon Jobs
          </h1>

          <div className="mt-8 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Our Purpose
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                Horizon Jobs is an independent global job discovery
                platform designed to organize employment opportunities and
                practical career resources into a clear and accessible
                experience for job seekers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Independent Job Discovery
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                Horizon Jobs is not a recruitment or staffing agency.
                Published opportunities point visitors toward the original
                employer or listing source where applications can normally
                be completed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Transparency
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                We aim to provide useful information about the source,
                workplace type, location, category, and verification status
                of published opportunities so visitors can make better
                decisions before applying.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Career Resources
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                Alongside job listings, Horizon Jobs provides practical
                career resources covering resumes, interviews, job searches,
                workplace skills, and international employment topics.
              </p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}