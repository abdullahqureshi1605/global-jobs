"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  MapPin,
  Building2,
  ExternalLink,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  company?: string;
  description?: string;
  city?: string;
  country?: string;
  status?: string;
  employment_type?: string;
  workplace_type?: string;
  apply_url?: string;
};

export default function RecruiterJobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        const id = String(params.id || "");

        if (!id) {
          throw new Error("Job ID is missing");
        }

        const response = await fetch(
          `/api/recruiter/jobs?jobId=${encodeURIComponent(id)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          router.push("/recruiter/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load job"
          );
        }

        setJob(data.job);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load job"
        );
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [params.id, router]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        {loading && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            Loading job data...
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && job && (
          <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="border-b border-slate-200 p-8 dark:border-slate-800">
              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                  <BriefcaseBusiness className="h-7 w-7" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                    Recruiter Job
                  </p>

                  <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                    {job.title}
                  </h1>

                  {job.company && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                      <Building2 className="h-4 w-4" />
                      {job.company}
                    </div>
                  )}

                  {(job.city || job.country) && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      {[job.city, job.country]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-8 sm:grid-cols-3">
              <Info
                label="Status"
                value={job.status}
              />

              <Info
                label="Employment"
                value={job.employment_type}
              />

              <Info
                label="Workplace"
                value={job.workplace_type}
              />
            </div>

            <section className="px-8 pb-8">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Description
              </h2>

              <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                {job.description ||
                  "No description is stored for this job."}
              </div>
            </section>

            {job.apply_url && (
              <section className="border-t border-slate-200 p-8 dark:border-slate-800">
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  Open Application
                  <ExternalLink className="h-4 w-4" />
                </a>
              </section>
            )}
          </article>
        )}
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
        {value || "Not specified"}
      </p>
    </div>
  );
}