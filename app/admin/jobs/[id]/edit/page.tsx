"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

type JobForm = {
  title: string;
  slug: string;
  company: string;
  companyLogo: string;
  country: string;
  countryCode: string;
  city: string;
  category: string;
  subcategory: string;
  industry: string;
  employmentType: string;
  workplaceType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryPeriod: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  sourceName: string;
  sourceUrl: string;
  applyUrl: string;
  datePosted: string;
  closingDate: string;
  lastVerified: string;
  verificationStatus: string;
  status: string;
  featured: boolean;
};

const initialForm: JobForm = {
  title: "",
  slug: "",
  company: "",
  companyLogo: "",
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
};

function text(value: unknown) {
  return value === null ||
    value === undefined
    ? ""
    : String(value);
}

function dateOnly(value: unknown) {
  return text(value).slice(0, 10);
}

function listToText(value: unknown) {
  return Array.isArray(value)
    ? value.join("\n")
    : text(value);
}

export default function EditJobPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const id = params?.id;

  const [form, setForm] =
    useState<JobForm>(
      initialForm
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadJob() {
      try {
        const response =
          await fetch(
            `/api/admin/jobs/${encodeURIComponent(
              id
            )}`,
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to load job."
          );
        }

        const job =
          result.job;

        setForm({
          title: text(job.title),
          slug: text(job.slug),
          company: text(job.company),
          companyLogo: text(
            job.companyLogo ??
              job.company_logo
          ),
          country: text(job.country),
          countryCode: text(
            job.countryCode ??
              job.country_code
          ),
          city: text(job.city),
          category: text(job.category),
          subcategory: text(
            job.subcategory
          ),
          industry: text(
            job.industry
          ),
          employmentType: text(
            job.employmentType ??
              job.employment_type
          ) || "Full-time",
          workplaceType: text(
            job.workplaceType ??
              job.workplace_type
          ) || "On-site",
          experienceLevel: text(
            job.experienceLevel ??
              job.experience_level
          ) || "Entry Level",
          salaryMin: text(
            job.salaryMin ??
              job.salary_min
          ),
          salaryMax: text(
            job.salaryMax ??
              job.salary_max
          ),
          salaryCurrency: text(
            job.salaryCurrency ??
              job.salary_currency
          ),
          salaryPeriod: text(
            job.salaryPeriod ??
              job.salary_period
          ) || "year",
          description: text(
            job.description
          ),
          requirements:
            listToText(
              job.requirements
            ),
          responsibilities:
            listToText(
              job.responsibilities
            ),
          benefits: listToText(
            job.benefits
          ),
          sourceName: text(
            job.sourceName ??
              job.source_name
          ),
          sourceUrl: text(
            job.sourceUrl ??
              job.source_url
          ),
          applyUrl: text(
            job.applyUrl ??
              job.apply_url
          ),
          datePosted: dateOnly(
            job.datePosted ??
              job.date_posted
          ),
          closingDate: dateOnly(
            job.closingDate ??
              job.closing_date
          ),
          lastVerified: dateOnly(
            job.lastVerified ??
              job.last_verified
          ),
          verificationStatus: text(
            job.verificationStatus ??
              job.verification_status
          ) || "unverified",
          status:
            text(job.status) ||
            "draft",
          featured: Boolean(
            job.featured
          ),
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load job."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadJob();
  }, [id]);

  function update(
    key: keyof JobForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveJob(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError(
        "Job ID is missing."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,

        requirements:
          form.requirements
            .split("\n")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean),

        responsibilities:
          form.responsibilities
            .split("\n")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean),

        benefits:
          form.benefits
            .split("\n")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean),
      };

      const response =
        await fetch(
          `/api/admin/jobs/${encodeURIComponent(
            id
          )}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              payload
            ),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to update job."
        );
      }

      setSuccess(
        "Job updated successfully."
      );

      setForm((current) => ({
        ...current,
        status:
          result.job?.status ??
          current.status,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update job."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 text-center dark:bg-slate-900">
          Loading job...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/jobs"
            )
          }
          className="mb-6 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to Jobs
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Job Management
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
            Edit Job
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Update this existing job without creating a duplicate record.
          </p>
        </div>

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={saveJob}
          className="space-y-8"
        >
          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Basic Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                label="Job Title"
                value={form.title}
                onChange={(value) =>
                  update(
                    "title",
                    value
                  )
                }
                required
              />

              <Field
                label="Company"
                value={form.company}
                onChange={(value) =>
                  update(
                    "company",
                    value
                  )
                }
                required
              />

              <Field
                label="Country"
                value={form.country}
                onChange={(value) =>
                  update(
                    "country",
                    value
                  )
                }
                required
              />

              <Field
                label="Country Code"
                value={
                  form.countryCode
                }
                onChange={(value) =>
                  update(
                    "countryCode",
                    value
                  )
                }
                required
              />

              <Field
                label="City"
                value={form.city}
                onChange={(value) =>
                  update(
                    "city",
                    value
                  )
                }
                required
              />

              <Field
                label="Category"
                value={form.category}
                onChange={(value) =>
                  update(
                    "category",
                    value
                  )
                }
                required
              />

              <Field
                label="Subcategory"
                value={
                  form.subcategory
                }
                onChange={(value) =>
                  update(
                    "subcategory",
                    value
                  )
                }
              />

              <Field
                label="Industry"
                value={form.industry}
                onChange={(value) =>
                  update(
                    "industry",
                    value
                  )
                }
              />

              <Field
                label="Company Logo URL"
                value={
                  form.companyLogo
                }
                onChange={(value) =>
                  update(
                    "companyLogo",
                    value
                  )
                }
              />

              <Field
                label="Slug"
                value={form.slug}
                onChange={(value) =>
                  update(
                    "slug",
                    value
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Employment
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <SelectField
                label="Employment Type"
                value={
                  form.employmentType
                }
                onChange={(value) =>
                  update(
                    "employmentType",
                    value
                  )
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
                value={
                  form.workplaceType
                }
                onChange={(value) =>
                  update(
                    "workplaceType",
                    value
                  )
                }
                options={[
                  "Remote",
                  "Hybrid",
                  "On-site",
                ]}
              />

              <SelectField
                label="Experience Level"
                value={
                  form.experienceLevel
                }
                onChange={(value) =>
                  update(
                    "experienceLevel",
                    value
                  )
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

          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Compensation
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-4">
              <Field
                label="Minimum Salary"
                type="number"
                value={
                  form.salaryMin
                }
                onChange={(value) =>
                  update(
                    "salaryMin",
                    value
                  )
                }
              />

              <Field
                label="Maximum Salary"
                type="number"
                value={
                  form.salaryMax
                }
                onChange={(value) =>
                  update(
                    "salaryMax",
                    value
                  )
                }
              />

              <Field
                label="Currency"
                value={
                  form.salaryCurrency
                }
                onChange={(value) =>
                  update(
                    "salaryCurrency",
                    value
                  )
                }
              />

              <SelectField
                label="Salary Period"
                value={
                  form.salaryPeriod
                }
                onChange={(value) =>
                  update(
                    "salaryPeriod",
                    value
                  )
                }
                options={[
                  "hour",
                  "month",
                  "year",
                ]}
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Job Content
            </h2>

            <div className="mt-6 space-y-5">
              <TextArea
                label="Description"
                value={
                  form.description
                }
                onChange={(value) =>
                  update(
                    "description",
                    value
                  )
                }
                rows={9}
                required
              />

              <TextArea
                label="Requirements"
                value={
                  form.requirements
                }
                onChange={(value) =>
                  update(
                    "requirements",
                    value
                  )
                }
                rows={6}
              />

              <TextArea
                label="Responsibilities"
                value={
                  form.responsibilities
                }
                onChange={(value) =>
                  update(
                    "responsibilities",
                    value
                  )
                }
                rows={6}
              />

              <TextArea
                label="Benefits"
                value={
                  form.benefits
                }
                onChange={(value) =>
                  update(
                    "benefits",
                    value
                  )
                }
                rows={6}
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Source & Verification
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                label="Source Name"
                value={
                  form.sourceName
                }
                onChange={(value) =>
                  update(
                    "sourceName",
                    value
                  )
                }
                required
              />

              <Field
                label="Source URL"
                type="url"
                value={
                  form.sourceUrl
                }
                onChange={(value) =>
                  update(
                    "sourceUrl",
                    value
                  )
                }
                required
              />

              <Field
                label="Apply URL"
                type="url"
                value={
                  form.applyUrl
                }
                onChange={(value) =>
                  update(
                    "applyUrl",
                    value
                  )
                }
                required
              />

              <SelectField
                label="Verification Status"
                value={
                  form.verificationStatus
                }
                onChange={(value) =>
                  update(
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
                value={
                  form.datePosted
                }
                onChange={(value) =>
                  update(
                    "datePosted",
                    value
                  )
                }
              />

              <Field
                label="Closing Date"
                type="date"
                value={
                  form.closingDate
                }
                onChange={(value) =>
                  update(
                    "closingDate",
                    value
                  )
                }
              />

              <Field
                label="Last Verified"
                type="date"
                value={
                  form.lastVerified
                }
                onChange={(value) =>
                  update(
                    "lastVerified",
                    value
                  )
                }
              />

              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) =>
                  update(
                    "status",
                    value
                  )
                }
                options={[
                  "draft",
                  "published",
                  "archived",
                ]}
              />
            </div>

            <label className="mt-6 flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={
                  form.featured
                }
                onChange={(event) =>
                  update(
                    "featured",
                    event.target.checked
                  )
                }
              />

              Featured job
            </label>
          </section>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/jobs"
                )
              }
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
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
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  rows: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <textarea
        rows={rows}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
  onChange: (
    value: string
  ) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </div>
  );
}