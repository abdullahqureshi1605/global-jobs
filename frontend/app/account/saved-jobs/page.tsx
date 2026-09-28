"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Loader2,
  Star,
} from "lucide-react";

type SavedJob = {
  id: string;
  job_id: string;
  created_at: string | null;
};

export default function SavedJobsPage() {
  const [items, setItems] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/saved-jobs", {
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load saved jobs."
          );
        }

        setItems(
          Array.isArray(data?.savedJobs)
            ? data.savedJobs
            : []
        );
      })
      .catch((error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load saved jobs."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full px-5 py-5 lg:px-8 lg:py-6">

      <div className="mb-7">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b88410]">
          Candidate Workspace
        </p>

        <h2 className="mt-2 text-[13px] font-black text-[#071a35]">
          Saved Jobs
        </h2>

        <p className="mt-2 text-[13px] text-slate-500">
          Jobs you saved for later.
        </p>
      </div>


      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-[2px] border border-slate-200 bg-white">
          <Loader2
            className="animate-spin text-[#b88410]"
            size={28}
          />
        </div>
      ) : error ? (
        <div className="rounded-[2px] border border-rose-200 bg-rose-50 px-5 py-4 text-[13px] font-semibold text-rose-700">
          {error}
        </div>
      ) : items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">

          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[2px] border border-slate-200 bg-white p-4"
            >

              <div className="flex items-start gap-4">

                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] bg-[#fff4cf] text-[#b88410]">
                  <Star size={21} />
                </span>

                <div className="min-w-0">
                  <h3 className="font-black text-[#071a35]">
                    Saved Job
                  </h3>

                  <p className="mt-1 break-all text-[13px] text-slate-500">
                    Job ID: {item.job_id}
                  </p>

                  <p className="mt-2 text-[11px] text-slate-400">
                    Saved{" "}
                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleDateString()
                      : ""}
                  </p>
                </div>

              </div>

            </div>
          ))}

        </div>
      ) : (
        <div className="rounded-[2px] border border-slate-200 bg-white px-6 py-20 text-center">

          <Star
            size={46}
            className="mx-auto text-slate-200"
          />

          <h3 className="mt-5 text-[13px] font-black text-[#071a35]">
            No saved jobs yet
          </h3>

          <p className="mt-2 text-[13px] text-slate-500">
            Save interesting opportunities and come back to them later.
          </p>

          <Link
            href="/jobs"
            className="mt-5 inline-flex items-center gap-2 rounded-[2px] bg-[#3E7BFA] px-5 py-3 text-[13px] font-black text-white"
          >
            Browse Jobs
            <ArrowRight size={17} />
          </Link>

        </div>
      )}

    </div>
  );
}


