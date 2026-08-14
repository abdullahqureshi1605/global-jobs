"use client";

import {
  AlertTriangle,
  Home,
  RefreshCcw,
} from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  return (
    <main className="min-h-[70vh] flex items-center bg-slate-100 dark:bg-slate-950 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-950 p-8 sm:p-12 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-wider text-red-600 mt-6">
            Something went wrong
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
            We couldn't load this page
          </h1>

          <p className="text-sm text-slate-500 leading-7 max-w-xl mx-auto mt-4">
            There may be a temporary connection problem or an issue
            loading the requested information.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">

            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>

            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold"
            >
              <Home className="w-4 h-4" />
              Go Home
            </a>

          </div>

        </div>

      </div>
    </main>
  );
}