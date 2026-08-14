"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewJobPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    company: "",
    country: "",
    countryCode: "",
    city: "",
    category: "",
    subcategory: "",
    industry: "",

    employmentType: "Full-time",
    workplaceType: "On-site",
    experienceLevel: "Entry Level",

    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "",
    salaryPeriod: "year",

    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",

    sourceName: "",
    sourceUrl: "",
    applyUrl: "",

    datePosted: "",
    closingDate: "",
    lastVerified: "",

    verificationStatus: "unverified",
    status: "draft",
    featured: false,
  });

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(
    field: string,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setSaving(true);

    try {
      const payload = {
        ...form,

        requirements: form.requirements
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),

        responsibilities: form.responsibilities
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),

        benefits: form.benefits
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const response = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      let result: {
        success?: boolean;
        error?: string;
        details?: string;
      } = {};

      try {
        result = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.details ||
            result.error ||
            `Server error (${response.status}).`
        );
      }

      setMessage("Job saved successfully.");

      setTimeout(() => {
        router.push("/admin/jobs");
      }, 1000);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save job."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin/jobs")}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to Jobs
          </button>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-3">
            Add New Job
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Add a job once and save it directly to the Horizon Jobs database.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm ${
              message === "Job saved successfully."
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Basic Information */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Job Title"
                required
                value={form.title}
                onChange={(value) =>
                  updateField("title", value)
                }
              />

              <Field
                label="Company"
                required
                value={form.company}
                onChange={(value) =>
                  updateField("company", value)
                }
              />

              <Field
                label="Country"
                required
                value={form.country}
                onChange={(value) =>
                  updateField("country", value)
                }
              />

              <Field
                label="Country Code"
                required
                placeholder="us"
                value={form.countryCode}
                onChange={(value) =>
                  updateField("countryCode", value)
                }
              />

              <Field
                label="City"
                required
                value={form.city}
                onChange={(value) =>
                  updateField("city", value)
                }
              />

              <Field
                label="Industry"
                value={form.industry}
                onChange={(value) =>
                  updateField("industry", value)
                }
              />

              <Field
                label="Category"
                required
                value={form.category}
                onChange={(value) =>
                  updateField("category", value)
                }
              />

              <Field
                label="Subcategory"
                value={form.subcategory}
                onChange={(value) =>
                  updateField("subcategory", value)
                }
              />
            </div>
          </section>

          {/* Employment */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Employment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <SelectField
                label="Employment Type"
                value={form.employmentType}
                onChange={(value) =>
                  updateField("employmentType", value)
                }
                options={[
                  "Full-time",
                  "Part-time",
                  "Contract",
                  "Temporary",
                  "Internship",
                  "Freelance",
                ]}
              />

              <SelectField
                label="Workplace Type"
                value={form.workplaceType}
                onChange={(value) =>
                  updateField("workplaceType", value)
                }
                options={[
                  "Remote",
                  "Hybrid",
                  "On-site",
                ]}
              />

              <SelectField
                label="Experience Level"
                value={form.experienceLevel}
                onChange={(value) =>
                  updateField("experienceLevel", value)
                }
                options={[
                  "Entry Level",
                  "Mid Level",
                  "Senior",
                  "Executive",
                ]}
              />
            </div>
          </section>

          {/* Compensation */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Compensation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <Field
                label="Minimum Salary"
                type="number"
                value={form.salaryMin}
                onChange={(value) =>
                  updateField("salaryMin", value)
                }
              />

              <Field
                label="Maximum Salary"
                type="number"
                value={form.salaryMax}
                onChange={(value) =>
                  updateField("salaryMax", value)
                }
              />

              <Field
                label="Currency"
                placeholder="USD"
                value={form.salaryCurrency}
                onChange={(value) =>
                  updateField("salaryCurrency", value)
                }
              />

              <SelectField
                label="Salary Period"
                value={form.salaryPeriod}
                onChange={(value) =>
                  updateField("salaryPeriod", value)
                }
                options={[
                  "hour",
                  "month",
                  "year",
                ]}
              />
            </div>
          </section>

          {/* Job Content */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Job Content
            </h2>

            <div className="space-y-5">
              <TextAreaField
                label="Description"
                required
                value={form.description}
                onChange={(value) =>
                  updateField("description", value)
                }
              />

              <TextAreaField
                label="Requirements"
                placeholder="Enter one requirement per line"
                value={form.requirements}
                onChange={(value) =>
                  updateField("requirements", value)
                }
              />

              <TextAreaField
                label="Responsibilities"
                placeholder="Enter one responsibility per line"
                value={form.responsibilities}
                onChange={(value) =>
                  updateField("responsibilities", value)
                }
              />

              <TextAreaField
                label="Benefits"
                placeholder="Enter one benefit per line"
                value={form.benefits}
                onChange={(value) =>
                  updateField("benefits", value)
                }
              />
            </div>
          </section>

          {/* Source & Verification */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Source & Verification
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Source Name"
                required
                value={form.sourceName}
                onChange={(value) =>
                  updateField("sourceName", value)
                }
              />

              <Field
                label="Source URL"
                required
                type="url"
                value={form.sourceUrl}
                onChange={(value) =>
                  updateField("sourceUrl", value)
                }
              />

              <Field
                label="Application URL"
                required
                type="url"
                value={form.applyUrl}
                onChange={(value) =>
                  updateField("applyUrl", value)
                }
              />

              <SelectField
                label="Verification Status"
                value={form.verificationStatus}
                onChange={(value) =>
                  updateField(
                    "verificationStatus",
                    value
                  )
                }
                options={[
                  "verified",
                  "reviewed",
                  "unverified",
                ]}
              />

              <Field
                label="Date Posted"
                type="date"
                value={form.datePosted}
                onChange={(value) =>
                  updateField("datePosted", value)
                }
              />

              <Field
                label="Closing Date"
                type="date"
                value={form.closingDate}
                onChange={(value) =>
                  updateField("closingDate", value)
                }
              />

              <Field
                label="Last Verified"
                type="date"
                value={form.lastVerified}
                onChange={(value) =>
                  updateField("lastVerified", value)
                }
              />
            </div>
          </section>

          {/* Publishing */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Publishing
            </h2>

            <div className="flex items-center gap-3">
              <input
                id="featured"
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  updateField(
                    "featured",
                    event.target.checked
                  )
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />

              <label
                htmlFor="featured"
                className="text-sm text-slate-700 dark:text-slate-300"
              >
                Mark as featured job
              </label>
            </div>

            <div className="mt-6 max-w-xs">
              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) =>
                  updateField("status", value)
                }
                options={[
                  "draft",
                  "published",
                  "archived",
                ]}
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/jobs")
              }
              className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold"
            >
              {saving ? "Saving..." : "Save Job"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      <textarea
        required={required}
        value={value}
        placeholder={placeholder}
        rows={6}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
      />
    </div>
  );
}