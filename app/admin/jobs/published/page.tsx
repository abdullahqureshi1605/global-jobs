"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  company_name: string | null;
  location_display: string | null;
  publication_status: string;
  published_at: string | null;
};

export default function PublishedJobsPage() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    if (!backend) {
      setMessage("Backend URL is not configured.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${backend}/api/review/queue?status=approved&publication=published&limit=100`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "ok") {
        throw new Error(
          data.detail || "Unable to load published jobs."
        );
      }

      setJobs(data.jobs || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load published jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unpublish = async (id: string) => {
    if (!backend) return;

    try {
      const response = await fetch(
        `${backend}/api/review/${id}/unpublish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewed_by: "admin",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "ok") {
        throw new Error(
          data.detail || "Unable to unpublish job."
        );
      }

      setMessage("Job unpublished.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to unpublish job."
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/jobs"
          className="text-sm font-bold text-cyan-300"
        >
          ← Back to Job Review
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-emerald-400">
          PUBLICATION
        </div>

        <h1 className="mt-2 text-3xl font-black">
          Published Jobs
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          These jobs are live on the public jobs pipeline.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-slate-400">
          Loading published jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-slate-400">
          No published jobs.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <Link
                  href={`/admin/jobs/${job.id}`}
                  className="text-lg font-black hover:text-cyan-300"
                >
                  {job.title}
                </Link>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                  {job.company_name && (
                    <span>{job.company_name}</span>
                  )}
                  {job.location_display && (
                    <span>• {job.location_display}</span>
                  )}
                  {job.published_at && (
                    <span>
                      • Published{" "}
                      {new Date(job.published_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => unpublish(job.id)}
                className="rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-black text-red-300"
              >
                Unpublish
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
