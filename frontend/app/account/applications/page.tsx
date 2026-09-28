"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  FileText,
  Loader2,
} from "lucide-react";

type Application = {
  id: string;
  job_id: string;
  status: string | null;
  fit_score: number | null;
  applied_at: string | null;
};

export default function ApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/applications", {
      cache: "no-store",
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load applications."
          );
        }

        setApplications(
          Array.isArray(data?.applications)
            ? data.applications
            : []
        );
      })
      .catch((error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load applications."
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
          My Applications
        </h2>

        <p className="mt-2 text-[13px] text-slate-500">
          Track the jobs you have applied for.
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
      ) : applications.length ? (
        <div className="overflow-hidden rounded-[2px] border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {applications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-[#071a35] text-[#f2b51d]">
                    <FileText size={19} />
                  </span>

                  <div>
                    <h3 className="font-black text-[#071a35]">
                      Job #
                      {String(
                        application.job_id
                      ).slice(0, 8)}
                    </h3>

                    <p className="mt-1 text-[13px] text-slate-400">
                      Applied{" "}
                      {application.applied_at
                        ? new Date(
                            application.applied_at
                          ).toLocaleDateString()
                        : "recently"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {application.fit_score !==
                    null && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                      {application.fit_score}%
                      {" "}match
                    </span>
                  )}

                  <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold capitalize text-slate-600">
                    {(
                      application.status ||
                      "pending"
                    ).replaceAll("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[2px] border border-slate-200 bg-white px-6 py-20 text-center">
          <FileText
            size={46}
            className="mx-auto text-slate-200"
          />

          <h3 className="mt-5 text-[13px] font-black text-[#071a35]">
            No applications yet
          </h3>

          <p className="mt-2 text-[13px] text-slate-500">
            When you apply to a published job, it
            will appear here.
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


