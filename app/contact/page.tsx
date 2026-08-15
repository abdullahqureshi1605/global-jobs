import type { Metadata } from "next";

import BackButton from "@/components/navigation/BackButton";

export const metadata: Metadata = {
  title: "Contact Horizon Jobs",
  description:
    "Contact Horizon Jobs for questions, partnerships, corrections, and general platform enquiries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton
            label="Back"
            fallbackHref="/"
          />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Horizon Jobs
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            Contact Horizon Jobs
          </h1>

          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
            For general questions, listing corrections, partnership
            enquiries, or issues with information displayed on the platform,
            contact the Horizon Jobs team.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-900 dark:text-white">
                General Enquiries
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Questions about the platform, jobs, resources, or website
                functionality.
              </p>

              <a
                href="mailto:globaljobs@gmail.com"
                className="mt-4 inline-flex font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                globaljobs@gmail.com
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-900 dark:text-white">
                Job Corrections
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Let us know when a listing appears outdated, incorrect,
                duplicated, or no longer available.
              </p>

              <a
                href="/jobs"
                className="mt-4 inline-flex font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Browse Job Listings
              </a>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-6 dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Important
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
              Horizon Jobs is an independent job discovery platform. We do
              not act as a recruitment agency and do not accept applications
              on behalf of employers. Applications are completed through the
              original employer or listing source.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}