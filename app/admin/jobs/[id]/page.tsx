"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import TargetedReview from "../../components/TargetedReview";


type RecordData =
  Record<string, any>;


const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://127.0.0.1:8000";


function apiError(
  data: any,
  fallback: string,
) {

  const detail =
    data?.detail;

  if (
    typeof detail ===
    "string"
  ) {
    return detail;
  }

  if (
    Array.isArray(detail)
  ) {
    return detail
      .map((item) => {

        if (
          typeof item ===
          "string"
        ) {
          return item;
        }

        if (item?.msg) {
          return String(
            item.msg,
          );
        }

        return JSON.stringify(
          item,
        );
      })
      .join(" • ");
  }

  if (
    detail &&
    typeof detail ===
      "object"
  ) {
    return (
      detail.message ||
      detail.msg ||
      JSON.stringify(
        detail,
      )
    );
  }

  if (
    typeof data?.message ===
    "string"
  ) {
    return data.message;
  }

  return fallback;
}


function StatusBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone:
    | "green"
    | "amber"
    | "red"
    | "blue";
}) {

  const tones = {
    green:
      "border-emerald-200 bg-emerald-50 text-emerald-800",

    amber:
      "border-amber-200 bg-amber-50 text-amber-800",

    red:
      "border-red-200 bg-red-50 text-red-800",

    blue:
      "border-cyan-200 bg-cyan-50 text-cyan-800",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black ${tones[tone]}`}
    >
      {children}
    </span>
  );
}


function Score({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  const good =
    Number(value) >= 90;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        good
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >

      <div className="text-xs font-black uppercase tracking-wide text-neutral-500">
        {label}
      </div>

      <div
        className={`mt-1 text-3xl font-black ${
          good
            ? "text-emerald-800"
            : "text-red-800"
        }`}
      >
        {Number(
          value || 0,
        )}
      </div>

      <div className="text-xs font-semibold text-neutral-500">
        / 100
      </div>

    </div>
  );
}


export default function AdminJobDetailPage() {

  const params =
    useParams();

  const router =
    useRouter();

  const id =
    String(
      params?.id || "",
    );


  const [job, setJob] =
    useState<RecordData | null>(
      null,
    );

  const [rawJob, setRawJob] =
    useState<RecordData | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);


  const loadJob =
    useCallback(
      async () => {

        if (!id) {
          return;
        }

        setLoading(true);
        setError("");

        try {

          const response =
            await fetch(
              `${BACKEND}/api/review/${id}`,
              {
                cache:
                  "no-store",
              },
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              apiError(
                data,
                "Could not load job.",
              ),
            );
          }

          setJob(
            data.job ||
              null,
          );

          setRawJob(
            data.raw_job ||
              null,
          );

        } catch (
          err
        ) {

          setError(
            err instanceof Error
              ? err.message
              : "Could not load job.",
          );

        } finally {

          setLoading(
            false,
          );

        }

      },
      [id],
    );


  useEffect(() => {
    loadJob();
  }, [loadJob]);


  async function runAction(
    action:
      | "approve"
      | "reject"
      | "publish"
      | "unpublish",
  ) {

    if (!job) {
      return;
    }

    setActionLoading(
      true,
    );

    setError("");
    setMessage("");

    try {

      const response =
        await fetch(
          `${BACKEND}/api/review/${job.id}/${action}`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  reviewed_by:
                    "admin",

                  notes:
                    `Admin ${action} action from Job Review.`,
                },
              ),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          apiError(
            data,
            `${action} failed.`,
          ),
        );
      }

      setMessage(
        data.message ||
          `Job ${action} completed successfully.`,
      );

      await loadJob();

    } catch (
      err
    ) {

      setError(
        err instanceof Error
          ? err.message
          : `${action} failed.`,
      );

    } finally {

      setActionLoading(
        false,
      );

    }
  }


  const sourceDescription =
    rawJob?.description ||
    job?.source_description ||
    "";


  const rawPayload =
    rawJob?.raw_payload ||
    rawJob?.raw_data ||
    rawJob ||
    {};


  const allScoresPass =
    useMemo(
      () => {

        if (!job) {
          return false;
        }

        return [
          "quality_score",
          "originality_score",
          "seo_score",
          "content_value_score",
          "source_coverage_score",
          "policy_safety_score",
        ].every(
          (key) =>
            Number(
              job[key] || 0,
            ) >= 90,
        );
      },
      [job],
    );


  if (loading) {

    return (
      <div className="px-4 py-8 sm:px-6">

        <div className="mx-auto max-w-[1450px] rounded-3xl border border-neutral-200 bg-white p-12 text-center">

          <div className="text-lg font-black">
            Loading job review...
          </div>

        </div>

      </div>
    );
  }


  if (!job) {

    return (
      <div className="px-4 py-8 sm:px-6">

        <div className="mx-auto max-w-[1450px] rounded-3xl border border-red-200 bg-red-50 p-8">

          <div className="font-black text-red-900">
            {error ||
              "Job could not be found."}
          </div>

          <button
            type="button"
            onClick={
              loadJob
            }
            className="mt-4 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-black text-white"
          >
            Retry
          </button>

        </div>

      </div>
    );
  }


  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1450px] space-y-6">


        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="rounded-3xl border border-neutral-800 bg-[#111525] p-6 text-white shadow-xl">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/jobs",
              )
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10"
          >
            ← Back to Job Review
          </button>


          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

            <div>

              <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
                Horizon Jobs • Human Review
              </div>

              <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                {job.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">

                <StatusBadge
                  tone={
                    job.quality_status ===
                    "approved"
                      ? "green"
                      : "red"
                  }
                >
                  Quality:{" "}
                  {job.quality_status ||
                    "needs_review"}
                </StatusBadge>

                <StatusBadge
                  tone={
                    job.ad_eligibility_status ===
                    "eligible"
                      ? "green"
                      : "amber"
                  }
                >
                  Ad Eligibility:{" "}
                  {job.ad_eligibility_status ||
                    "needs_review"}
                </StatusBadge>

                <StatusBadge
                  tone={
                    job.publication_status ===
                    "published"
                      ? "green"
                      : "blue"
                  }
                >
                  Publication:{" "}
                  {job.publication_status ||
                    "draft"}
                </StatusBadge>

                <StatusBadge
                  tone={
                    job.manual_review_required
                      ? "amber"
                      : "green"
                  }
                >
                  {job.manual_review_required
                    ? "Human Review Required"
                    : "Human Review Complete"}
                </StatusBadge>

              </div>

            </div>


            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-5">

              <div className="text-xs font-black uppercase tracking-wide text-white/50">
                Internal AdSense Readiness
              </div>

              <div className="mt-1 text-5xl font-black text-cyan-300">
                {Number(
                  job.adsense_score ||
                    0,
                )}
              </div>

              <div className="mt-2 text-xs leading-5 text-white/60">
                Internal editorial metric only.
                It is not a Google approval prediction.
              </div>

            </div>

          </div>

        </section>


        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
            {error}
          </div>
        )}


        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            {message}
          </div>
        )}


        {/* ==================================================
            JOB FACTS
        ================================================== */}

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">

          <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
            Employment Information
          </div>

          <h2 className="mt-1 text-2xl font-black text-neutral-950">
            Job Facts
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {[
              [
                "Company",
                job.company_name,
              ],

              [
                "Category",
                job.category_label,
              ],

              [
                "Location",
                job.location_display,
              ],

              [
                "Contract",
                job.contract_type,
              ],

              [
                "Schedule",
                job.contract_time,
              ],

              [
                "Salary",
                job.salary_min ||
                job.salary_max
                  ? `${job.salary_min ?? ""}${job.salary_min && job.salary_max ? " – " : ""}${job.salary_max ?? ""}`
                  : "",
              ],

              [
                "Source",
                job.source,
              ],

              [
                "Processed",
                job.processed_at,
              ],

            ].map(
              ([
                label,
                value,
              ]) => (
                <div
                  key={String(
                    label,
                  )}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                >

                  <div className="text-xs font-black uppercase tracking-wide text-neutral-500">
                    {label}
                  </div>

                  <div className="mt-1 break-words text-sm font-semibold text-neutral-900">
                    {value || "—"}
                  </div>

                </div>
              ),
            )}

          </div>

        </section>


        {/* ==================================================
            ONE SCORE SECTION ONLY
        ================================================== */}

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                AI Editorial Evaluation
              </div>

              <h2 className="mt-1 text-2xl font-black text-neutral-950">
                Six Quality Scores
              </h2>

            </div>

            <StatusBadge
              tone={
                allScoresPass
                  ? "green"
                  : "red"
              }
            >
              {allScoresPass
                ? "All Six ≥ 90"
                : "Targeted Repair Needed"}
            </StatusBadge>

          </div>


          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

            <Score
              label="Quality"
              value={
                Number(
                  job.quality_score ||
                    0,
                )
              }
            />

            <Score
              label="Originality"
              value={
                Number(
                  job.originality_score ||
                    0,
                )
              }
            />

            <Score
              label="SEO"
              value={
                Number(
                  job.seo_score ||
                    0,
                )
              }
            />

            <Score
              label="Content Value"
              value={
                Number(
                  job.content_value_score ||
                    0,
                )
              }
            />

            <Score
              label="Source Coverage"
              value={
                Number(
                  job.source_coverage_score ||
                    0,
                )
              }
            />

            <Score
              label="Policy Safety"
              value={
                Number(
                  job.policy_safety_score ||
                    0,
                )
              }
            />

          </div>

        </section>


        {/* ==================================================
            TARGETED HUMAN REVIEW
        ================================================== */}

        <TargetedReview
          backendUrl={
            BACKEND
          }

          job={{
            id:
              job.id,

            title:
              job.title ||
              "",

            summary:
              job.summary ||
              "",

            detailed_description:
              job.detailed_description ||
              "",

            skills:
              Array.isArray(
                job.skills,
              )
                ? job.skills
                : [],

            source_description:
              sourceDescription,

            quality_score:
              Number(
                job.quality_score ||
                  0,
              ),

            originality_score:
              Number(
                job.originality_score ||
                  0,
              ),

            seo_score:
              Number(
                job.seo_score ||
                  0,
              ),

            content_value_score:
              Number(
                job.content_value_score ||
                  0,
              ),

            source_coverage_score:
              Number(
                job.source_coverage_score ||
                  0,
              ),

            policy_safety_score:
              Number(
                job.policy_safety_score ||
                  0,
              ),
          }}

          onRechecked={(
            data,
          ) => {

            setJob(
              data.job,
            );

            setMessage(
              "Targeted edit saved and all six scores have been recalculated.",
            );
          }}
        />


        {/* ==================================================
            COMPLETE ORIGINAL SOURCE
        ================================================== */}

        <section className="rounded-3xl border border-amber-300/30 bg-[#111525] p-6 text-white shadow-sm">

          <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
            Source / Provenance
          </div>

          <h2 className="mt-1 text-2xl font-black">
            Original Source Description
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Full stored source text used for editorial comparison.
            The page does not clamp, line-limit, or visually truncate this content.
          </p>


          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-black/20 p-6">

            <div className="whitespace-pre-wrap break-words text-[15px] leading-8 text-white/90">

              {sourceDescription ||
                "No original source description is stored."}

            </div>

          </div>


          <details className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">

            <summary className="cursor-pointer px-5 py-4 text-sm font-black">
              Technical source payload
            </summary>

            <pre className="max-h-[650px] overflow-auto border-t border-white/10 p-5 text-xs leading-6 text-white/70">
              {JSON.stringify(
                rawPayload,
                null,
                2,
              )}
            </pre>

          </details>


          {job.redirect_url && (
            <a
              href={
                job.redirect_url
              }
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black hover:bg-white/10"
            >
              Open Source Listing ↗
            </a>
          )}

        </section>


        {/* ==================================================
            FINAL ACTIONS
        ================================================== */}

        <section className="rounded-3xl border border-neutral-800 bg-[#111525] p-6 text-white shadow-xl">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-400">
                Final Human Decision
              </div>

              <h2 className="mt-1 text-xl font-black">
                Review first. Approve second. Publish last.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Human review remains the final publication decision.
              </p>

            </div>


            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  runAction(
                    "approve",
                  )
                }
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-40"
              >
                {actionLoading
                  ? "Working..."
                  : "Approve"}
              </button>


              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  runAction(
                    "reject",
                  )
                }
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-black text-white hover:bg-red-600 disabled:opacity-40"
              >
                {actionLoading
                  ? "Working..."
                  : "Reject"}
              </button>


              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  runAction(
                    "publish",
                  )
                }
                className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-neutral-950 hover:bg-cyan-400 disabled:opacity-40"
              >
                {actionLoading
                  ? "Working..."
                  : "Publish"}
              </button>


              {job.publication_status ===
                "published" && (
                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    runAction(
                      "unpublish",
                    )
                  }
                  className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10 disabled:opacity-40"
                >
                  {actionLoading
                    ? "Working..."
                    : "Unpublish"}
                </button>
              )}

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}
