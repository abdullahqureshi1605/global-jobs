"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookmarkCheck,
  BriefcaseBusiness,
  Trash2,
} from "lucide-react";
import { Job } from "@/types/job";
import { slugify } from "@/lib/utils/slug";

export default function SavedJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadSavedJobs() {
      try {
        // Check if logged in
        const meResponse = await fetch("/api/auth/me", { cache: "no-store" });
        if (!meResponse.ok) {
          setIsLoggedIn(false);
          setLoading(false);
          router.push("/login?returnUrl=/saved");
          return;
        }
        setIsLoggedIn(true);

        // Get saved jobs
        const response = await fetch("/api/user/saved-jobs");
        if (response.ok) {
          const data = await response.json();
          setJobs(data.savedJobs || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    loadSavedJobs();
  }, [router]);

  async function removeJob(jobId: string) {
    try {
      const response = await fetch(`/api/user/saved-jobs?jobId=${jobId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setJobs(jobs.filter((job) => job.id !== jobId));
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="bg-slate-900 rounded-3xl p-8 mt-6">
              <div className="h-10 w-56 bg-slate-700 rounded" />
              <div className="h-4 w-80 bg-slate-700 rounded mt-4" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect
  }

  if (jobs.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 sm:p-14 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <BookmarkCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-5">
              No Saved Jobs Yet
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
              When you find a job you want to keep, click the bookmark icon on the job card.
            </p>
            <Link
              href="/jobs"
              className="inline-flex mt-6 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
            >
              Find Jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                Your Shortlist
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">
                Saved Jobs
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-300 mt-5 max-w-2xl">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} saved
          </p>
        </header>

        <div className="space-y-4">
          {jobs.map((job) => {
            const jobUrl =
              job.slug ||
              slugify(`${job.title}-${job.company}`);

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/jobs/${jobUrl}`}
                      className="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {job.title}
                    </Link>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                      {job.company}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {job.city}, {job.country}
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
                      href={`/jobs/${jobUrl}`}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
                    >
                      View Job
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeJob(job.id)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800"
                      aria-label="Remove saved job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}