"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  MapPin,
  Wallet,
} from "lucide-react";

import { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
  onSelect?: (
    job: Job
  ) => void;
}

const STORAGE_KEY =
  "horizon_saved_jobs";

function getSavedIds(): string[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed.map(String)
      : [];
  } catch {
    return [];
  }
}

export default function JobCard({
  job,
  onSelect,
}: JobCardProps) {
  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    const savedIds =
      getSavedIds();

    setSaved(
      savedIds.includes(
        String(job.id)
      )
    );
  }, [job.id]);

  function toggleSaved(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.stopPropagation();

    const savedIds =
      getSavedIds();

    const jobId =
      String(job.id);

    let nextIds: string[];

    if (
      savedIds.includes(
        jobId
      )
    ) {
      nextIds =
        savedIds.filter(
          (id) =>
            id !== jobId
        );
    } else {
      nextIds = [
        ...savedIds,
        jobId,
      ];
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        nextIds
      )
    );

    setSaved(
      nextIds.includes(
        jobId
      )
    );
  }

  function selectJob() {
    onSelect?.(job);
  }

  return (
    <article
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-200 cursor-pointer"
      onClick={selectJob}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          selectJob();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${job.title} at ${job.company}`}
    >

      <div className="flex flex-col h-full">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-start gap-3 min-w-0">

            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-slate-500" />
            </div>

            <div className="min-w-0">

              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {job.title}
              </h3>

              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                {job.company}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              toggleSaved
            }
            aria-label={
              saved
                ? "Remove saved job"
                : "Save job"
            }
            title={
              saved
                ? "Remove saved job"
                : "Save job"
            }
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            {saved ? (
              <BookmarkCheck className="w-5 h-5 text-indigo-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-slate-400" />
            )}
          </button>

        </div>

        <div className="flex flex-wrap gap-2 mt-5">

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">

            <MapPin className="w-3.5 h-3.5" />

            {job.workplaceType
              .toLowerCase() ===
            "remote"
              ? "Remote"
              : `${job.city}, ${job.country}`}

          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">

            <Briefcase className="w-3.5 h-3.5" />

            {job.employmentType}

          </span>

          {job.experienceLevel && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
              {job.experienceLevel}
            </span>
          )}

        </div>

        {(job.salaryMin ||
          job.salaryMax) && (
          <div className="flex items-center gap-2 mt-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">

            <Wallet className="w-4 h-4" />

            <span>

              {job.salaryCurrency
                || ""}{" "}

              {job.salaryMin
                ? job.salaryMin.toLocaleString()
                : ""}

              {job.salaryMin &&
              job.salaryMax
                ? " – "
                : ""}

              {job.salaryMax
                ? job.salaryMax.toLocaleString()
                : ""}

              {job.salaryPeriod
                ? ` / ${job.salaryPeriod}`
                : ""}

            </span>

          </div>
        )}

        {job.verificationStatus ===
          "verified" && (
          <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-blue-600 dark:text-blue-400">

            <CheckCircle2 className="w-4 h-4" />

            Verified Source

          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">

          <div className="text-xs text-slate-500">
            Posted{" "}
            {job.datePosted}
          </div>

          <span className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white text-sm font-semibold">
            View Job →
          </span>

        </div>

      </div>

    </article>
  );
}