"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";


type Job = {
  id: string;
  title: string;
  company_name?: string;
  location_display?: string;
  category_label?: string;

  quality_score?: number;
  originality_score?: number;
  seo_score?: number;
  content_value_score?: number;
  source_coverage_score?: number;
  policy_safety_score?: number;
  adsense_score?: number;

  quality_status?: string;
  ad_eligibility_status?: string;
  publication_status?: string;
  manual_review_required?: boolean;

  summary?: string;
  detailed_description?: string;
  processed_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
};


type Tab =
  | "needs_review"
  | "ready"
  | "rejected"
  | "published";


const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://127.0.0.1:8000";


function getErrorMessage(
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
    Array.isArray(
      detail,
    )
  ) {
    return detail
      .map(
        (item) =>
          item?.msg ||
          JSON.stringify(item),
      )
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


function ScoreBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  const good =
    Number(value || 0) >= 90;

  return (
    <div
      className={`rounded-xl border p-3 ${
        good
          ? "border-white/5 bg-[#151a2b]"
          : "border-red-300/30 bg-red-950/20"
      }`}
    >

      <div className="text-xs font-bold text-white/50">
        {label}
      </div>

      <div
        className={`mt-1 text-lg font-black ${
          good
            ? "text-white"
            : "text-red-300"
        }`}
      >
        {Number(
          value || 0,
        )}
        /100
      </div>

    </div>
  );
}


function passesGate(
  job: Job,
) {

  return [
    job.quality_score,
    job.originality_score,
    job.seo_score,
    job.content_value_score,
    job.source_coverage_score,
    job.policy_safety_score,
    job.adsense_score,
  ].every(
    (value) =>
      Number(
        value || 0,
      ) >= 90,
  );
}


function getBlockers(
  job: Job,
) {

  const checks = [
    [
      "Quality",
      job.quality_score,
    ],
    [
      "Originality",
      job.originality_score,
    ],
    [
      "SEO",
      job.seo_score,
    ],
    [
      "Content Value",
      job.content_value_score,
    ],
    [
      "Source Coverage",
      job.source_coverage_score,
    ],
    [
      "Policy Safety",
      job.policy_safety_score,
    ],
    [
      "Internal Readiness",
      job.adsense_score,
    ],
  ];

  return checks
    .filter(
      ([, value]) =>
        Number(
          value || 0,
        ) < 90,
    )
    .map(
      ([name, value]) =>
        `${name}: ${value || 0}`,
    );
}


export default function JobsClient() {

  const router =
    useRouter();

  const searchParams =
    useSearchParams();


  const initialTab =
    (
      searchParams.get(
        "tab",
      ) as Tab
    ) ||
    "needs_review";


  const [
    activeTab,
    setActiveTab,
  ] =
    useState<Tab>(
      initialTab,
    );


  const [
    jobs,
    setJobs,
  ] = useState<Job[]>(
    [],
  );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    message,
    setMessage,
  ] =
    useState("");


  const [
    workingId,
    setWorkingId,
  ] =
    useState<string | null>(
      null,
    );


  const tabs = [
    {
      id:
        "needs_review" as Tab,
      label:
        "Needs Review",
    },
    {
      id:
        "ready" as Tab,
      label:
        "Ready to Publish",
    },
    {
      id:
        "rejected" as Tab,
      label:
        "Rejected",
    },
    {
      id:
        "published" as Tab,
      label:
        "Published",
    },
  ];


  const loadJobs =
    useCallback(
      async () => {

        setLoading(
          true,
        );

        setError("");
        setMessage("");

        try {

          let url =
            `${BACKEND}/api/review/queue?limit=200`;

          if (
            activeTab ===
            "needs_review"
          ) {

            url +=
              "&status=needs_review"
              + "&publication=draft";

          }

          if (
            activeTab ===
            "ready"
          ) {

            // The Ready tab deliberately uses
            // approved + draft. It does NOT depend
            // on manual_review_required because the
            // admin is already performing the final
            // human publication action here.

            url +=
              "&status=approved"
              + "&publication=draft";

          }

          if (
            activeTab ===
            "rejected"
          ) {

            url +=
              "&status=rejected";

          }

          if (
            activeTab ===
            "published"
          ) {

            url +=
              "&status=approved"
              + "&publication=published";

          }


          const response =
            await fetch(
              url,
              {
                cache:
                  "no-store",
              },
            );


          const data =
            await response.json();


          if (!response.ok) {
            throw new Error(
              getErrorMessage(
                data,
                "Could not load jobs.",
              ),
            );
          }


          const incoming =
            Array.isArray(
              data.jobs,
            )
              ? data.jobs
              : Array.isArray(
                  data,
                )
                ? data
                : [];


          // The backend already filters workflow state.
          // The extra local filtering below protects the UI
          // from accidental state mismatches.

          let filtered =
            incoming;


          if (
            activeTab ===
            "ready"
          ) {

            filtered =
              incoming.filter(
                (job: Job) =>
                  job.quality_status ===
                    "approved" &&
                  job.publication_status ===
                    "draft" &&
                  (
                    job.ad_eligibility_status ===
                      "eligible" ||
                    !job.ad_eligibility_status
                  ),
              );

          }


          if (
            activeTab ===
            "published"
          ) {

            filtered =
              incoming.filter(
                (job: Job) =>
                  job.publication_status ===
                  "published",
              );

          }


          setJobs(
            filtered,
          );

        } catch (
          err
        ) {

          setError(
            err instanceof Error
              ? err.message
              : "Could not load jobs.",
          );

          setJobs(
            [],
          );

        } finally {

          setLoading(
            false,
          );

        }

      },
      [
        activeTab,
      ],
    );


  useEffect(
    () => {
      loadJobs();
    },
    [loadJobs],
  );


  function chooseTab(
    tab: Tab,
  ) {

    setActiveTab(
      tab,
    );

    router.replace(
      `/admin/jobs?tab=${tab}`,
    );

  }


  async function publishJob(
    id: string,
  ) {

    setWorkingId(
      id,
    );

    setError("");
    setMessage("");

    try {

      const response =
        await fetch(
          `${BACKEND}/api/review/${id}/publish`,
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
                    "Final human publication action from Ready to Publish.",
                },
              ),
          },
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          getErrorMessage(
            data,
            "Publishing failed.",
          ),
        );

      }


      setMessage(
        "Job published successfully.",
      );


      await loadJobs();

    } catch (
      err
    ) {

      setError(
        err instanceof Error
          ? err.message
          : "Publishing failed.",
      );

    } finally {

      setWorkingId(
        null,
      );

    }
  }


  async function rejectJob(
    id: string,
  ) {

    setWorkingId(
      id,
    );

    setError("");
    setMessage("");

    try {

      const response =
        await fetch(
          `${BACKEND}/api/review/${id}/reject`,
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
                    "Rejected by admin from Job Review.",
                },
              ),
          },
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          getErrorMessage(
            data,
            "Reject failed.",
          ),
        );

      }


      setMessage(
        "Job rejected successfully.",
      );


      await loadJobs();

    } catch (
      err
    ) {

      setError(
        err instanceof Error
          ? err.message
          : "Reject failed.",
      );

    } finally {

      setWorkingId(
        null,
      );

    }
  }


  async function unpublishJob(
    id: string,
  ) {

    setWorkingId(
      id,
    );

    setError("");
    setMessage("");

    try {

      const response =
        await fetch(
          `${BACKEND}/api/review/${id}/unpublish`,
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
                    "Unpublished by admin.",
                },
              ),
          },
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          getErrorMessage(
            data,
            "Unpublish failed.",
          ),
        );

      }


      setMessage(
        "Job unpublished successfully.",
      );


      await loadJobs();

    } catch (
      err
    ) {

      setError(
        err instanceof Error
          ? err.message
          : "Unpublish failed.",
      );

    } finally {

      setWorkingId(
        null,
      );

    }
  }


  const readyCount =
    activeTab ===
    "ready"
      ? jobs.length
      : 0;


  const heading =
    {
      needs_review:
        "Jobs That Need Human Attention",

      ready:
        "Jobs Ready for Final Publication",

      rejected:
        "Rejected Jobs",

      published:
        "Published Jobs",
    }[
      activeTab
    ];


  const description =
    {
      needs_review:
        "Only jobs with editorial scores below the release gate appear here. Open the job, repair the targeted area, and recheck it.",

      ready:
        "These jobs have passed the internal editorial gate. Your Publish action is the final human publication decision.",

      rejected:
        "Jobs that were explicitly rejected by the administrator.",

      published:
        "Jobs currently published on the public site.",
    }[
      activeTab
    ];


  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1500px]">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div>

          <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
            Job Management
          </div>

          <h1 className="mt-2 text-4xl font-black text-white">
            Job Review
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
            Manage the real publication workflow. Jobs below the quality
            gate require targeted human repair. Jobs that pass the gate
            simply wait for final publication.
          </p>

        </div>


        {/* ==================================================
            TABS
        ================================================== */}

        <div className="mt-8 flex flex-wrap gap-2">

          {tabs.map(
            (tab) => (
              <button
                key={
                  tab.id
                }
                type="button"
                onClick={() =>
                  chooseTab(
                    tab.id,
                  )
                }
                className={`rounded-xl border px-5 py-3 text-sm font-black transition ${
                  activeTab ===
                  tab.id
                    ? "border-white bg-white text-neutral-950"
                    : "border-white/10 bg-[#101526] text-white/80 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ),
          )}

        </div>


        {/* ==================================================
            STATE MESSAGES
        ================================================== */}

        {activeTab ===
          "ready" && (
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">

            <div className="text-lg font-black text-emerald-300">
              Ready for publication
            </div>

            <div className="mt-1 text-sm leading-6 text-emerald-100/70">
              These jobs have already passed the internal gate.
              Click <strong>Publish</strong> to make them live.
              No second approval step is required.
            </div>

          </div>
        )}


        {activeTab ===
          "needs_review" && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-5">

            <div className="text-lg font-black text-red-300">
              Targeted human review
            </div>

            <div className="mt-1 text-sm leading-6 text-red-100/70">
              Only jobs with one or more internal scores below 90
              belong in this workflow.
            </div>

          </div>
        )}


        {error && (
          <div className="mt-6 rounded-2xl border border-red-300/20 bg-red-500/10 p-5 text-sm font-bold text-red-200">
            {error}
          </div>
        )}


        {message && (
          <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-5 text-sm font-bold text-emerald-200">
            {message}
          </div>
        )}


        {/* ==================================================
            SECTION TITLE
        ================================================== */}

        <div className="mt-8">

          <h2 className="text-2xl font-black text-white">
            {heading}
          </h2>

          <p className="mt-1 text-sm text-white/50">
            {description}
          </p>

        </div>


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-[#0f1425] p-10 text-center">

            <div className="text-sm font-bold text-white/70">
              Loading real jobs...
            </div>

          </div>
        )}


        {/* ==================================================
            EMPTY
        ================================================== */}

        {!loading &&
          jobs.length ===
            0 && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-[#0f1425] p-10 text-center">

              <div className="text-lg font-black text-white">
                No jobs in this workflow state
              </div>

              <div className="mt-2 text-sm text-white/50">
                The queue is currently empty.
              </div>

            </div>
          )}


        {/* ==================================================
            JOB CARDS
        ================================================== */}

        <div className="mt-6 space-y-5">

          {jobs.map(
            (job) => {

              const pass =
                passesGate(
                  job,
                );

              const blockers =
                getBlockers(
                  job,
                );

              const working =
                workingId ===
                job.id;


              return (
                <article
                  key={
                    job.id
                  }
                  className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f1425] shadow-xl"
                >

                  <div className="p-6">

                    {/* TOP */}
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

                      <div className="min-w-0">

                        <h3 className="text-2xl font-black text-white">
                          {job.title}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-2">

                          {job.company_name && (
                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/60">
                              {job.company_name}
                            </span>
                          )}

                          {job.location_display && (
                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/60">
                              {job.location_display}
                            </span>
                          )}

                          {job.category_label && (
                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/60">
                              {job.category_label}
                            </span>
                          )}

                        </div>

                      </div>


                      {/* ACTIONS */}

                      <div className="flex shrink-0 flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/jobs/${job.id}`,
                            )
                          }
                          className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10"
                        >
                          Open Review
                        </button>


                        {activeTab ===
                          "ready" && (
                          <button
                            type="button"
                            disabled={
                              working
                            }
                            onClick={() =>
                              publishJob(
                                job.id,
                              )
                            }
                            className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-neutral-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {working
                              ? "Publishing..."
                              : "Publish"}
                          </button>
                        )}


                        {activeTab ===
                          "needs_review" && (
                          <button
                            type="button"
                            disabled={
                              working
                            }
                            onClick={() =>
                              rejectJob(
                                job.id,
                              )
                            }
                            className="rounded-xl bg-red-500 px-5 py-3 text-sm font-black text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {working
                              ? "Working..."
                              : "Reject"}
                          </button>
                        )}


                        {activeTab ===
                          "published" && (
                          <button
                            type="button"
                            disabled={
                              working
                            }
                            onClick={() =>
                              unpublishJob(
                                job.id,
                              )
                            }
                            className="rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 hover:bg-red-500/20 disabled:opacity-40"
                          >
                            {working
                              ? "Working..."
                              : "Unpublish"}
                          </button>
                        )}

                      </div>

                    </div>


                    {/* GATE STATE */}

                    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">

                      <div>

                        <div className="text-xs font-black uppercase tracking-wide text-white/40">
                          Release Gate
                        </div>

                        <div className="mt-1 font-black text-white">
                          {pass
                            ? "Passed — ready for publication"
                            : "Blocked — human repair required"}
                        </div>

                      </div>


                      <div
                        className={`rounded-full px-4 py-2 text-xs font-black ${
                          pass
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {pass
                          ? "ALL REQUIRED SCORES ≥ 90"
                          : "ONE OR MORE SCORES BELOW 90"}
                      </div>

                    </div>


                    {/* SIX SCORES */}

                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">

                      <ScoreBox
                        label="Quality"
                        value={
                          Number(
                            job.quality_score ||
                              0,
                          )
                        }
                      />

                      <ScoreBox
                        label="Originality"
                        value={
                          Number(
                            job.originality_score ||
                              0,
                          )
                        }
                      />

                      <ScoreBox
                        label="SEO"
                        value={
                          Number(
                            job.seo_score ||
                              0,
                          )
                        }
                      />

                      <ScoreBox
                        label="Content Value"
                        value={
                          Number(
                            job.content_value_score ||
                              0,
                          )
                        }
                      />

                      <ScoreBox
                        label="Source Coverage"
                        value={
                          Number(
                            job.source_coverage_score ||
                              0,
                          )
                        }
                      />

                      <ScoreBox
                        label="Policy Safety"
                        value={
                          Number(
                            job.policy_safety_score ||
                              0,
                          )
                        }
                      />

                      <ScoreBox
                        label="Internal Readiness"
                        value={
                          Number(
                            job.adsense_score ||
                              0,
                          )
                        }
                      />

                    </div>


                    {/* BLOCKERS */}

                    {!pass &&
                      blockers.length >
                        0 && (
                        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">

                          <div className="text-xs font-black uppercase tracking-wide text-red-300">
                            Blocking areas
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">

                            {blockers.map(
                              (
                                blocker,
                              ) => (
                                <span
                                  key={
                                    blocker
                                  }
                                  className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-black text-red-200"
                                >
                                  {blocker}
                                </span>
                              ),
                            )}

                          </div>

                        </div>
                      )}


                    {/* SUMMARY */}

                    {job.summary && (
                      <div className="mt-5">

                        <div className="text-xs font-black uppercase tracking-wide text-white/40">
                          Summary
                        </div>

                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-white/75">
                          {job.summary}
                        </p>

                      </div>
                    )}

                  </div>

                </article>
              );
            },
          )}

        </div>

      </div>

    </div>
  );
}
