"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Finding = {
  id?: string;
  score_name: string;
  score: number;
  field:
    | "summary"
    | "detailed_description"
    | "skills";
  phrase: string;
  problem: string;
  suggested_replacement: string;
};

type Scores = {
  quality_score: number;
  originality_score: number;
  seo_score: number;
  content_value_score: number;
  source_coverage_score: number;
  policy_safety_score: number;
};

type Job = {
  id: string;
  title: string;
  summary: string;
  detailed_description: string;
  skills: string[];
  source_description?: string;
} & Scores;

type Props = {
  backendUrl: string;
  job: Job;
  onRechecked?: (data: {
    job: Job;
    findings: Finding[];
  }) => void;
};

const scoreLabels: Record<
  keyof Scores,
  string
> = {
  quality_score: "Quality",
  originality_score: "Originality",
  seo_score: "SEO",
  content_value_score: "Content Value",
  source_coverage_score:
    "Source Coverage",
  policy_safety_score:
    "Policy Safety",
};

function apiError(
  data: any,
  fallback: string,
) {
  const detail = data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item?.msg) {
          return String(item.msg);
        }

        return JSON.stringify(item);
      })
      .join(" • ");
  }

  if (
    detail &&
    typeof detail === "object"
  ) {
    return (
      detail.message ||
      detail.msg ||
      JSON.stringify(detail)
    );
  }

  if (
    typeof data?.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

function renderHighlighted(
  text: string,
  findings: Finding[],
  onFinding: (
    finding: Finding,
  ) => void,
): ReactNode {

  if (!text) {
    return (
      <span className="text-neutral-400">
        No content available.
      </span>
    );
  }

  const matches = findings
    .map((finding) => {
      const position =
        text.indexOf(
          finding.phrase,
        );

      if (position < 0) {
        return null;
      }

      return {
        start: position,
        end:
          position +
          finding.phrase.length,
        finding,
      };
    })
    .filter(
      Boolean,
    ) as Array<{
    start: number;
    end: number;
    finding: Finding;
  }>;

  matches.sort(
    (a, b) =>
      a.start - b.start,
  );

  if (!matches.length) {
    return text;
  }

  const output: ReactNode[] = [];
  let cursor = 0;

  matches.forEach(
    (
      match,
      index,
    ) => {

      if (
        match.start <
        cursor
      ) {
        return;
      }

      if (
        match.start >
        cursor
      ) {
        output.push(
          <span
            key={
              `normal-${index}`
            }
          >
            {text.slice(
              cursor,
              match.start,
            )}
          </span>,
        );
      }

      output.push(
        <button
          key={
            `weak-${index}`
          }
          type="button"
          onClick={() =>
            onFinding(
              match.finding,
            )
          }
          className="inline cursor-pointer rounded-sm bg-red-50 px-0.5 text-red-950 underline decoration-red-600 decoration-2 underline-offset-[5px] hover:bg-red-100"
          title="Click to edit this exact weak area"
        >
          {text.slice(
            match.start,
            match.end,
          )}
        </button>,
      );

      cursor =
        match.end;
    },
  );

  if (
    cursor <
    text.length
  ) {
    output.push(
      <span key="last">
        {text.slice(
          cursor,
        )}
      </span>,
    );
  }

  return output;
}

export default function TargetedReview({
  backendUrl,
  job,
  onRechecked,
}: Props) {

  const [summary, setSummary] =
    useState(
      job.summary || "",
    );

  const [
    detailedDescription,
    setDetailedDescription,
  ] = useState(
    job.detailed_description ||
      "",
  );

  const [
    skills,
    setSkills,
  ] = useState<string[]>(
    Array.isArray(
      job.skills,
    )
      ? job.skills
      : [],
  );

  const [
    findings,
    setFindings,
  ] = useState<Finding[]>(
    [],
  );

  const [
    activeFinding,
    setActiveFinding,
  ] =
    useState<Finding | null>(
      null,
    );

  const [
    replacement,
    setReplacement,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    dirty,
    setDirty,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const scores = useMemo(
    () => ({
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
    }),
    [
      job.quality_score,
      job.originality_score,
      job.seo_score,
      job.content_value_score,
      job.source_coverage_score,
      job.policy_safety_score,
    ],
  );

  const weakScores =
    useMemo(
      () =>
        (
          Object.entries(
            scores,
          ) as Array<
            [
              keyof Scores,
              number,
            ]
          >
        ).filter(
          ([, value]) =>
            value < 90,
        ),
      [scores],
    );

  useEffect(() => {
    setSummary(
      job.summary || "",
    );

    setDetailedDescription(
      job.detailed_description ||
        "",
    );

    setSkills(
      Array.isArray(
        job.skills,
      )
        ? job.skills
        : [],
    );

    setFindings([]);
    setActiveFinding(null);
    setReplacement("");
    setDirty(false);
    setMessage("");
  }, [
    job.id,
    job.summary,
    job.detailed_description,
    JSON.stringify(
      job.skills,
    ),
    job.quality_score,
    job.originality_score,
    job.seo_score,
    job.content_value_score,
    job.source_coverage_score,
    job.policy_safety_score,
  ]);

  async function findWeakAreas() {

    setLoading(true);
    setMessage("");

    try {

      const response =
        await fetch(
          `${backendUrl}/api/review/targeted-analysis`,
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
                  title:
                    job.title,

                  summary,

                  detailed_description:
                    detailedDescription,

                  skills,

                  quality_score:
                    scores.quality_score,

                  originality_score:
                    scores.originality_score,

                  seo_score:
                    scores.seo_score,

                  content_value_score:
                    scores.content_value_score,

                  source_coverage_score:
                    scores.source_coverage_score,

                  policy_safety_score:
                    scores.policy_safety_score,

                  source_description:
                    job.source_description ||
                    "",
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
            "Could not analyze weak areas.",
          ),
        );
      }

      const next =
        Array.isArray(
          data.findings,
        )
          ? data.findings
          : [];

      setFindings(next);

      if (
        next.length
      ) {
        setMessage(
          `${next.length} exact weak text area(s) found. Red-underlined text is clickable.`,
        );
      } else if (
        weakScores.length
      ) {
        setMessage(
          "A weak score exists, but Gemini could not safely map it to an exact sentence. No content was changed.",
        );
      } else {
        setMessage(
          "All six scores are already at least 90.",
        );
      }

    } catch (
      error
    ) {

      setMessage(
        error instanceof Error
          ? error.message
          : "Targeted analysis failed.",
      );

    } finally {

      setLoading(false);

    }
  }

  function openFinding(
    finding: Finding,
  ) {
    setActiveFinding(
      finding,
    );

    setReplacement(
      finding.suggested_replacement ||
        "",
    );
  }

  function applyFix() {

    if (
      !activeFinding
    ) {
      return;
    }

    const phrase =
      activeFinding.phrase;

    if (!phrase) {
      return;
    }

    if (
      activeFinding.field ===
      "summary"
    ) {
      setSummary(
        (current) =>
          current.replace(
            phrase,
            replacement,
          ),
      );
    }

    if (
      activeFinding.field ===
      "detailed_description"
    ) {
      setDetailedDescription(
        (current) =>
          current.replace(
            phrase,
            replacement,
          ),
      );
    }

    if (
      activeFinding.field ===
      "skills"
    ) {
      setSkills(
        (current) =>
          current.map(
            (skill) =>
              skill.includes(
                phrase,
              )
                ? skill.replace(
                    phrase,
                    replacement,
                  )
                : skill,
          ),
      );
    }

    setFindings(
      (current) =>
        current.filter(
          (item) =>
            !(
              item.field ===
                activeFinding.field &&
              item.phrase ===
                activeFinding.phrase
            ),
        ),
    );

    setActiveFinding(null);
    setReplacement("");
    setDirty(true);

    setMessage(
      "Only this targeted area was changed. Save & Recheck to permanently save and rescore it.",
    );
  }

  async function saveAndRecheck() {

    if (!dirty) {
      setMessage(
        "There are no unsaved targeted changes.",
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {

      const response =
        await fetch(
          `${backendUrl}/api/review/${job.id}/targeted-recheck`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  summary,
                  detailed_description:
                    detailedDescription,
                  skills,
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
            "Could not save and recheck.",
          ),
        );
      }

      setDirty(false);

      setFindings(
        Array.isArray(
          data.findings,
        )
          ? data.findings
          : [],
      );

      onRechecked?.({
        job:
          data.job,
        findings:
          Array.isArray(
            data.findings,
          )
            ? data.findings
            : [],
      });

      const currentScores =
        [
          data.job?.quality_score,
          data.job?.originality_score,
          data.job?.seo_score,
          data.job?.content_value_score,
          data.job?.source_coverage_score,
          data.job?.policy_safety_score,
        ].map(
          Number,
        );

      if (
        currentScores.every(
          (value) =>
            value >= 90,
        )
      ) {
        setMessage(
          "All six scores now pass 90. Human approval is still required before publication.",
        );
      } else {
        setMessage(
          "Saved and rescored. Remaining weak areas are highlighted in red.",
        );
      }

    } catch (
      error
    ) {

      setMessage(
        error instanceof Error
          ? error.message
          : "Save and recheck failed.",
      );

    } finally {

      setSaving(false);

    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-6">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
              Targeted Human Review
            </div>

            <h2 className="mt-1 text-2xl font-black text-neutral-950">
              Find & Fix Only Weak Areas
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
              Good content remains untouched. Click a red-underlined sentence
              to edit only that specific problem.
            </p>

          </div>

          <button
            type="button"
            onClick={
              findWeakAreas
            }
            disabled={
              loading
            }
            className="shrink-0 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-black text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Finding Weak Areas..."
              : "Find Weak Areas"}
          </button>

        </div>

      </div>


      <div className="px-6 py-6">

        {/* WEAK SCORE SUMMARY ONLY */}
        {weakScores.length >
        0 ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="font-black text-red-900">
              Targeted attention required
            </div>

            <div className="mt-3 flex flex-wrap gap-2">

              {weakScores.map(
                ([
                  key,
                  value,
                ]) => (
                  <span
                    key={key}
                    className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-black text-red-800"
                  >
                    {
                      scoreLabels[
                        key
                      ]
                    }
                    : {value}/100
                  </span>
                ),
              )}

            </div>

          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">

            <div className="font-black">
              All six scores are at least 90.
            </div>

            <div className="mt-1 text-sm">
              No targeted content repair is currently required.
            </div>

          </div>
        )}


        {message && (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm font-semibold text-neutral-700">
            {message}
          </div>
        )}


        {/* SUMMARY */}
        <div className="mt-8">

          <div className="mb-2 flex items-center justify-between gap-4">

            <h3 className="text-lg font-black text-neutral-950">
              Summary
            </h3>

            <span className="text-xs font-bold text-red-600">
              Red underline = targeted weak text
            </span>

          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-[15px] leading-8 whitespace-pre-wrap break-words text-neutral-800">

            {renderHighlighted(
              summary,
              findings.filter(
                (item) =>
                  item.field ===
                  "summary",
              ),
              openFinding,
            )}

          </div>

        </div>


        {/* DETAILED DESCRIPTION */}
        <div className="mt-8">

          <h3 className="mb-2 text-lg font-black text-neutral-950">
            Detailed Job Description
          </h3>

          <div className="min-h-[180px] rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-[15px] leading-8 whitespace-pre-wrap break-words text-neutral-800">

            {renderHighlighted(
              detailedDescription,
              findings.filter(
                (item) =>
                  item.field ===
                  "detailed_description",
              ),
              openFinding,
            )}

          </div>

        </div>


        {/* SKILLS */}
        {skills.length >
        0 && (
          <div className="mt-8">

            <h3 className="mb-3 text-lg font-black text-neutral-950">
              Skills
            </h3>

            <div className="flex flex-wrap gap-2">

              {skills.map(
                (
                  skill,
                  index,
                ) => (
                  <div
                    key={`${skill}-${index}`}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-700"
                  >
                    {renderHighlighted(
                      skill,
                      findings.filter(
                        (item) =>
                          item.field ===
                          "skills",
                      ),
                      openFinding,
                    )}
                  </div>
                ),
              )}

            </div>

          </div>
        )}


        {/* TARGETED ISSUES */}
        {findings.length >
        0 && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/60 p-5">

            <div className="font-black text-red-950">
              Targeted Issues
            </div>

            <p className="mt-1 text-sm text-red-800">
              These are the exact areas that need attention. Nothing else needs to be rewritten.
            </p>

            <div className="mt-4 space-y-3">

              {findings.map(
                (
                  finding,
                  index,
                ) => (
                  <button
                    key={
                      finding.id ||
                      `${finding.field}-${index}`
                    }
                    type="button"
                    onClick={() =>
                      openFinding(
                        finding,
                      )
                    }
                    className="block w-full rounded-xl border border-red-200 bg-white p-4 text-left transition hover:border-red-400 hover:bg-red-50"
                  >

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="font-black text-red-900">
                        {
                          scoreLabels[
                            finding.score_name as keyof Scores
                          ] ||
                          finding.score_name
                        }
                      </span>

                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-black text-red-800">
                        {finding.score}/100
                      </span>

                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-600">
                        {finding.field}
                      </span>

                    </div>

                    <div className="mt-2 text-sm font-semibold text-neutral-900">
                      “{finding.phrase}”
                    </div>

                    <div className="mt-1 text-sm leading-6 text-neutral-600">
                      {finding.problem}
                    </div>

                  </button>
                ),
              )}

            </div>

          </div>
        )}


        {/* TARGETED EDITOR */}
        {activeFinding && (
          <div className="mt-8 rounded-3xl border-2 border-red-300 bg-red-50 p-6">

            <div className="text-xs font-black uppercase tracking-[0.18em] text-red-700">
              Targeted Edit
            </div>

            <h3 className="mt-1 text-xl font-black text-red-950">
              {
                scoreLabels[
                  activeFinding.score_name as keyof Scores
                ] ||
                activeFinding.score_name
              }
              {" "}
              — {activeFinding.score}/100
            </h3>

            <div className="mt-5">

              <div className="text-xs font-black uppercase tracking-wide text-neutral-500">
                Exact Existing Text
              </div>

              <div className="mt-2 rounded-xl border border-red-200 bg-white p-4 text-sm leading-7 text-neutral-800">
                {activeFinding.phrase}
              </div>

            </div>

            <div className="mt-4">

              <div className="text-xs font-black uppercase tracking-wide text-neutral-500">
                Why This Area Is Weak
              </div>

              <div className="mt-2 text-sm leading-6 text-neutral-700">
                {
                  activeFinding.problem ||
                  "This exact area was identified as the targeted improvement."
                }
              </div>

            </div>

            <div className="mt-4">

              <div className="text-xs font-black uppercase tracking-wide text-neutral-500">
                Replacement
              </div>

              <textarea
                value={
                  replacement
                }
                onChange={(
                  event,
                ) =>
                  setReplacement(
                    event.target
                      .value,
                  )
                }
                rows={5}
                className="mt-2 w-full rounded-xl border border-neutral-300 bg-white p-4 text-sm leading-7 text-neutral-900 outline-none focus:border-neutral-950"
              />

            </div>

            <div className="mt-4 flex flex-wrap gap-3">

              <button
                type="button"
                onClick={
                  applyFix
                }
                className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-black text-white hover:bg-neutral-800"
              >
                Apply Only This Fix
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveFinding(
                    null,
                  );

                  setReplacement(
                    "",
                  );
                }}
                className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-black text-neutral-800 hover:bg-neutral-100"
              >
                Cancel
              </button>

            </div>

          </div>
        )}


        {/* SAVE */}
        <div className="mt-8 border-t border-neutral-200 pt-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="text-sm font-black text-neutral-900">
                Targeted changes only
              </div>

              <div className="mt-1 text-xs text-neutral-500">
                Good content is not regenerated.
              </div>

            </div>

            <button
              type="button"
              onClick={
                saveAndRecheck
              }
              disabled={
                !dirty ||
                saving
              }
              className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-black text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving
                ? "Saving & Rescoring..."
                : "Save & Recheck Scores"}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}
