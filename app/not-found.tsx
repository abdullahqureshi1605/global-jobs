import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Home,
  Search,
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center bg-slate-100 dark:bg-slate-950 py-16">

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BriefcaseBusiness className="w-8 h-8" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-6">
            Page Not Found
          </p>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-2">
            We couldn't find that page
          </h1>

          <p className="text-sm sm:text-base text-slate-500 leading-7 max-w-xl mx-auto mt-4">
            The page may have been removed, the link may be outdated,
            or the address may have been entered incorrectly.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>

            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Search className="w-4 h-4" />
              Find Jobs
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}