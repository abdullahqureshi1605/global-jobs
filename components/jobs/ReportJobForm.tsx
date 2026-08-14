"use client";

import { useState } from "react";

export default function ReportJobForm() {
  const [jobUrl, setJobUrl] = useState("");
  const [reason, setReason] = useState("expired");
  const [details, setDetails] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        "/api/job-reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobUrl,
            reason,
            details,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.details ||
            result.error ||
            "Failed to submit report."
        );
      }

      setSubmitted(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit report."
      );
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 p-8 text-center">
        <h2 className="text-xl font-bold text-emerald-600">
          Report Submitted
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          Thank you for helping us keep job information accurate.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6"
    >

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-2">
          Job URL
        </label>

        <input
          type="url"
          required
          value={jobUrl}
          onChange={(event) =>
            setJobUrl(event.target.value)
          }
          placeholder="https://yourwebsite.com/jobs/..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Reason
        </label>

        <select
          value={reason}
          onChange={(event) =>
            setReason(event.target.value)
          }
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none"
        >
          <option value="expired">
            Job has expired or closed
          </option>

          <option value="broken_link">
            Broken application link
          </option>

          <option value="incorrect_info">
            Incorrect information
          </option>

          <option value="suspicious">
            Suspicious or misleading listing
          </option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Additional Details
        </label>

        <textarea
          rows={6}
          value={details}
          onChange={(event) =>
            setDetails(event.target.value)
          }
          placeholder="Tell us what needs to be corrected..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold"
      >
        {saving
          ? "Submitting..."
          : "Submit Report"}
      </button>

    </form>
  );
}