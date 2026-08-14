"use client";

import {
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

export default function JobsError({
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  return (
    <main className="min-h-[60vh] flex items-center bg-slate-100 dark:bg-slate-950 py-16">
      <div className="max-w-2xl mx-auto px-4 w-full">

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-950 p-8 text-center">

          <AlertCircle className="w-10 h-10 mx-auto text-red-500" />

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-5">
            We couldn't load the jobs
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Please try again. If the problem continues, the issue may be
            temporary.
          </p>

          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>

        </div>

      </div>
    </main>
  );
}