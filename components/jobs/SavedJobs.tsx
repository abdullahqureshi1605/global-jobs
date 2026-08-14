"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookmarkCheck,
  BriefcaseBusiness,
  Trash2,
} from "lucide-react";

import { Job } from "@/types/job";
import { slugify } from "@/lib/utils/slug";

const STORAGE_KEY =
  "horizon_saved_jobs";

interface SavedJobsProps {
  jobs: Job[];
}

function getSavedIds(): string[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function getJobUrl(job: Job) {
  const country =
    slugify(job.country);

  const category =
    slugify(job.category);

  const slug =
    job.slug ||
    slugify(
      `${job.title}-${job.company}`
    );

  return `/jobs/${country}/${category}/${slug}`;
}

export default function SavedJobs({
  jobs,
}: SavedJobsProps) {
  const [savedIds, setSavedIds] =
    useState<string[]>([]);

  useEffect(() => {
    setSavedIds(
      getSavedIds()
    );
  }, []);

  const savedJobs = jobs.filter(
    (job) =>
      savedIds.includes(
        String(job.id)
      )
  );

  function removeJob(id: string) {
    const nextIds =
      savedIds.filter(
        (savedId) =>
          savedId !== id
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextIds)
    );

    setSavedIds(nextIds);
  }

  function clearAll() {
    localStorage.removeItem(
      STORAGE_KEY
    );

    setSavedIds([]);
  }

  if (savedJobs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 sm:p-14 text-center">

        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
          <BookmarkCheck className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-5">
          No Saved Jobs Yet
        </h2>

        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
          When you find a job you want to keep,
          click the bookmark icon on the job card.
          Your saved jobs will appear here.
        </p>

        <Link
          href="/jobs"
          className="inline-flex mt-6 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
        >
          Find Jobs
        </Link>

      </div>
    );
  }

  return (
    <div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {savedJobs.length}{" "}
            {savedJobs.length === 1
              ? "Saved Job"
              : "Saved Jobs"}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Jobs saved on this device.
          </p>
        </div>

        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>

      </div>

      {/* Saved Jobs */}
      <div className="space-y-4">

        {savedJobs.map(
          (job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
            >

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                <div>

                  <Link
                    href={getJobUrl(job)}
                    className="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {job.title}
                  </Link>

                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                    {job.company}
                  </p>

                  <p className="text-xs text-slate-500 mt-2">
                    {job.city},{" "}
                    {job.country}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">

                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      {job.category}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      {job.workplaceType}
                    </span>

                  </div>

                </div>

                <div className="flex items-center gap-2 shrink-0">

                  <Link
                    href={getJobUrl(job)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
                  >
                    View Job
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      removeJob(
                        String(job.id)
                      )
                    }
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800"
                    aria-label="Remove saved job"
                    title="Remove saved job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}