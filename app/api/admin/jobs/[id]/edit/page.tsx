"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

interface JobForm {
  id: string;

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
}

const emptyForm: JobForm = {
  id: "",

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

function formatDate(value: unknown) {
  if (!value) {
    return "";
  }

  const stringValue =
    String(value);

  return stringValue.slice(0, 10);
}

function stringValue(value: unknown) {
  return value === null ||
    value === undefined
    ? ""
    : String(value);
}

function arrayToText(value: unknown) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value.join("\n");
}

export default function EditJobPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const router = useRouter();

  const [jobId, setJobId] =
    useState("");

  const [form, setForm] =
    useState<JobForm>(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadJob() {
      try {
        const { id } =
          await params;

        if (!active) {
          return;
        }

        setJobId(id);

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

        if (!active) {
          return;
        }

        setForm({
          id: stringValue(job.id),

          title:
            stringValue(
              job.title
            ),

          slug:
            stringValue(
              job.slug
            ),

          company:
            stringValue(
              job.company
            ),

          companyLogo:
            stringValue(
              job.company_logo
            ),

          country:
            stringValue(
              job.country
            ),

          countryCode:
            stringValue(
              job.country_code
            ),

          city:
            stringValue(
              job.city
            ),

          category:
            stringValue(
              job.category
            ),

          subcategory:
            stringValue(
              job.subcategory
            ),

          industry:
            stringValue(
              job.industry
            ),

          employmentType:
            stringValue(
              job.employment_type
            ) ||
            "Full-time",

          workplaceType:
            stringValue(
              job.workplace_type
            ) ||
            "On-site",

          experienceLevel:
            stringValue(
              job.experience_level
            ) ||
            "Entry Level",

          salaryMin:
            stringValue(
              job.salary_min
            ),

          salaryMax:
            stringValue(
              job.salary_max
            ),

          salaryCurrency:
            stringValue(
              job.salary_currency
            ),

          salaryPeriod:
            stringValue(
              job.salary_period
            ) ||
            "year",

          description:
            stringValue(
              job.description
            ),

          requirements:
            arrayToText(
              job.requirements
            ),

          responsibilities:
            arrayToText(
              job.responsibilities
            ),

          benefits:
            arrayToText(
              job.benefits
            ),

          sourceName:
            stringValue(
              job.source_name
            ),

          sourceUrl:
            stringValue(
              job.source_url
            ),

          applyUrl:
            stringValue(
              job.apply_url
            ),

          datePosted:
            formatDate(
              job.date_posted
            ),

          closingDate:
            formatDate(
              job.closing_date
            ),

          lastVerified:
            formatDate(
              job.last_verified
            ),

          verificationStatus:
            stringValue(
              job.verification_status
            ) ||
            "unverified",

          status:
            stringValue(
              job.status
            ) ||
            "draft",

          featured:
            Boolean(
              job.featured
            ),
        });

        setError("");
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load job."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadJob();

    return () => {
      active = false;
    };
  }, [params]);

  function updateField<
    K extends keyof JobForm
  >(
    field: K,
    value: JobForm[K]
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

    if (!jobId) {
      setError(
        "Job ID is missing."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...form,

        requirements:
          form.requirements
            .split("\n")
            .map(
              (item) =>
                item.trim()
            )
            .filter(Boolean),

        responsibilities:
          form.responsibilities
            .split("\n")
            .map(
              (item) =>
                item.trim()
            )
            .filter(Boolean),

        benefits:
          form.benefits
            .split("\n")
            .map(
              (item) =>
                item.trim()
            )
            .filter(Boolean),
      };

      const response =
        await fetch(
          `/api/admin/jobs/${encodeURIComponent(
            jobId
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

      setMessage(
        "Job updated successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/jobs"
        );
      }, 900);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update job."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading job...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !form.id) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-white p-8 dark:border-red-900 dark:bg-slate-900">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Unable to load job
            </h1>

            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/jobs"
                )
              }
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/jobs"
              )
            }
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 hover:underline dark:text-indigo-400"
          >
            ← Back to Jobs
          </button>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Job Management
              </p>

              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                Edit Job
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Update the complete job listing without creating a new record.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-slate-500 dark:text-slate-400">
                Status:
              </span>{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {form.status}
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Basic Information
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Job Title"
                required
                value={form.title}
                onChange={(value) =>
                  updateField(
                    "title",
                    value
                  )
                }
              />

              <Field
                label="Company"
                required
                value={form.company}
                onChange={(value) =>
                  updateField(
                    "company",
                    value
                  )
                }
              />

              <Field
                label="Country"
                required
                value={form.country}
                onChange={(value) =>
                  updateField(
                    "country",
                    value
                  )
                }
              />

              <Field
                label="Country Code"
                required
                value={form.countryCode}
                onChange={(value) =>
                  updateField(
                    "countryCode",
                    value
                  )
                }
              />

              <Field
                label="City"
                required
                value={form.city}
                onChange={(value) =>
                  updateField(
                    "city",
                    value
                  )
                }
              />

              <Field
                label="Company Logo URL"
                value={form.companyLogo}
                onChange={(value) =>
                  updateField(
                    "companyLogo",
                    value
                  )
                }
              />

              <Field
                label="Industry"
                value={form.industry}
                onChange={(value) =>
                  updateField(
                    "industry",
                    value
                  )
                }
              />

              <Field
                label="Category"
                required
                value={form.category}
                onChange={(value) =>
                  updateField(
                    "category",
                    value
                  )
                }
              />

              <Field
                label="Subcategory"
                value={form.subcategory}
                onChange={(value) =>
                  updateField(
                    "subcategory",
                    value
                  )
                }
              />

              <Field
                label="Slug"
                value={form.slug}
                onChange={(value) =>
                  updateField(
                    "slug",
                    value
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Employment Details
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              <SelectField
                label="Employment Type"
                value={
                  form.employmentType
                }
                onChange={(value) =>
                  updateField(
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
                  updateField(
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
                  updateField(
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

          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Compensation
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <Field
                label="Minimum Salary"
                type="number"
                value={form.salaryMin}
                onChange={(value) =>
                  updateField(
                    "salaryMin",
                    value
                  )
                }
              />

              <Field
                label="Maximum Salary"
                type="number"
                value={form.salaryMax}
                onChange={(value) =>
                  updateField(
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
                  updateField(
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
                  updateField(
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

          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Job Description
            </h2>

            <div className="mt-6">
              <TextAreaField
                label="Description"
                required
                rows={8}
                value={
                  form.description
                }
                onChange={(value) =>
                  updateField(
                    "description",
                    value
                  )
                }
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
              <TextAreaField
                label="Requirements"
                rows={8}
                value={
                  form.requirements
                }
                onChange={(value) =>
                  updateField(
                    "requirements",
                    value
                  )
                }
                placeholder="One requirement per line"
              />

              <TextAreaField
                label="Responsibilities"
                rows={8}
                value={
                  form.responsibilities
                }
                onChange={(value) =>
                  updateField(
                    "responsibilities",
                    value
                  )
                }
                placeholder="One responsibility per line"
              />

              <TextAreaField
                label="Benefits"
                rows={8}
                value={form.benefits}
                onChange={(value) =>
                  updateField(
                    "benefits",
                    value
                  )
                }
                placeholder="One benefit per line"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Source & Verification
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Source Name"
                required
                value={
                  form.sourceName
                }
                onChange={(value) =>
                  updateField(
                    "sourceName",
                    value
                  )
                }
              />

              <Field
                label="Source URL"
                required
                type="url"
                value={
                  form.sourceUrl
                }
                onChange={(value) =>
                  updateField(
                    "sourceUrl",
                    value
                  )
                }
              />

              <Field
                label="Application URL"
                required
                type="url"
                value={form.applyUrl}
                onChange={(value) =>
                  updateField(
                    "applyUrl",
                    value
                  )
                }
              />

              <SelectField
                label="Verification Status"
                value={
                  form.verificationStatus
                }
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
                value={
                  form.datePosted
                }
                onChange={(value) =>
                  updateField(
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
                  updateField(
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
                  updateField(
                    "lastVerified",
                    value
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Publishing
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) =>
                  updateField(
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

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-800/50">
                <input
                  id="featured"
                  type="checkbox"
                  checked={
                    form.featured
                  }
                  onChange={(event) =>
                    updateField(
                      "featured",
                      event.target
                        .checked
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />

                <label
                  htmlFor="featured"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Mark as featured job
                </label>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/jobs"
                )
              }
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving Changes..."
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
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
  placeholder?: string;
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
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 5,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  rows?: number;
  placeholder?: string;
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
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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