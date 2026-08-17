"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useParams, useRouter } from "next/navigation";

interface JobForm {
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

  verificationStatus:
    "unverified",

  status: "draft",

  featured: false,
};

function arrayToText(
  value: unknown
) {
  return Array.isArray(value)
    ? value.join("\n")
    : "";
}

function dateValue(
  value: unknown
) {
  if (!value) {
    return "";
  }

  return String(value).slice(
    0,
    10
  );
}

export default function EditJobPage() {
  const router =
    useRouter();

  const params =
    useParams<{
      id: string;
    }>();

  const id =
    params?.id;

  const [form, setForm] =
    useState<JobForm>(
      initialForm
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    async function loadJob() {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            `/api/admin/jobs/${id}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        const raw =
          await response.text();

        let result: any =
          null;

        if (raw.trim()) {
          if (
            contentType.includes(
              "application/json"
            )
          ) {
            result =
              JSON.parse(raw);
          } else {
            throw new Error(
              `Server returned ${response.status} with a non-JSON response.`
            );
          }
        }

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Failed to load job."
          );
        }

        const job =
          result?.job;

        if (!job) {
          throw new Error(
            "Job data was not returned by the server."
          );
        }

        if (cancelled) {
          return;
        }

        setForm({
          title:
            job.title ?? "",

          slug:
            job.slug ?? "",

          company:
            job.company ?? "",

          companyLogo:
            job.company_logo ??
            job.companyLogo ??
            "",

          country:
            job.country ?? "",

          countryCode:
            job.country_code ??
            job.countryCode ??
            "",

          city:
            job.city ?? "",

          category:
            job.category ?? "",

          subcategory:
            job.subcategory ??
            "",

          industry:
            job.industry ?? "",

          employmentType:
            job.employment_type ??
            job.employmentType ??
            "Full-time",

          workplaceType:
            job.workplace_type ??
            job.workplaceType ??
            "On-site",

          experienceLevel:
            job.experience_level ??
            job.experienceLevel ??
            "Entry Level",

          salaryMin:
            job.salary_min !=
              null
              ? String(
                  job.salary_min
                )
              : "",

          salaryMax:
            job.salary_max !=
              null
              ? String(
                  job.salary_max
                )
              : "",

          salaryCurrency:
            job.salary_currency ??
            job.salaryCurrency ??
            "",

          salaryPeriod:
            job.salary_period ??
            job.salaryPeriod ??
            "year",

          description:
            job.description ??
            "",

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
            job.source_name ??
            job.sourceName ??
            "",

          sourceUrl:
            job.source_url ??
            job.sourceUrl ??
            "",

          applyUrl:
            job.apply_url ??
            job.applyUrl ??
            "",

          datePosted:
            dateValue(
              job.date_posted ??
                job.datePosted
            ),

          closingDate:
            dateValue(
              job.closing_date ??
                job.closingDate
            ),

          lastVerified:
            dateValue(
              job.last_verified ??
                job.lastVerified
            ),

          verificationStatus:
            job.verification_status ??
            job.verificationStatus ??
            "unverified",

          status:
            job.status ??
            "draft",

          featured:
            Boolean(
              job.featured
            ),
        });
      } catch (
        loadError
      ) {
        if (
          cancelled
        ) {
          return;
        }

        setError(
          loadError instanceof
            Error
            ? loadError.message
            : "Failed to load job."
        );
      } finally {
        if (
          !cancelled
        ) {
          setLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function updateField(
    field: keyof JobForm,
    value:
      | string
      | boolean
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

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
          `/api/admin/jobs/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              payload
            ),
          }
        );

      const raw =
        await response.text();

      let result: any =
        null;

      if (raw.trim()) {
        try {
          result =
            JSON.parse(raw);
        } catch {
          throw new Error(
            `Server returned ${response.status} with invalid JSON.`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Failed to update job."
        );
      }

      setMessage(
        "Job updated successfully."
      );

      setTimeout(
        () =>
          router.push(
            "/admin/jobs"
          ),
        700
      );
    } catch (
      saveError
    ) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "Failed to update job."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">
            Loading job...
          </p>
        </div>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">
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

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/jobs"
              )
            }
            className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Back to Jobs
          </button>

          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
            Edit Job
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Update the existing job listing.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-8"
        >
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold text-slate-950 dark:text-white">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Job Title"
                required
                value={
                  form.title
                }
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
                value={
                  form.company
                }
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
                value={
                  form.country
                }
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
                placeholder="pk"
                value={
                  form.countryCode
                }
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
                value={
                  form.city
                }
                onChange={(value) =>
                  updateField(
                    "city",
                    value
                  )
                }
              />

              <Field
                label="Category"
                required
                value={
                  form.category
                }
                onChange={(value) =>
                  updateField(
                    "category",
                    value
                  )
                }
              />

              <Field
                label="Subcategory"
                value={
                  form.subcategory
                }
                onChange={(value) =>
                  updateField(
                    "subcategory",
                    value
                  )
                }
              />

              <Field
                label="Industry"
                value={
                  form.industry
                }
                onChange={(value) =>
                  updateField(
                    "industry",
                    value
                  )
                }
              />

              <Field
                label="Slug"
                value={
                  form.slug
                }
                onChange={(value) =>
                  updateField(
                    "slug",
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
                  updateField(
                    "companyLogo",
                    value
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold text-slate-950 dark:text-white">
              Job Classification
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
                  "On-site",
                  "Hybrid",
                  "Remote",
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

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold text-slate-950 dark:text-white">
              Salary
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
              <Field
                label="Minimum"
                type="number"
                value={
                  form.salaryMin
                }
                onChange={(value) =>
                  updateField(
                    "salaryMin",
                    value
                  )
                }
              />

              <Field
                label="Maximum"
                type="number"
                value={
                  form.salaryMax
                }
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
                label="Period"
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

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold text-slate-950 dark:text-white">
              Job Content
            </h2>

            <div className="space-y-5">
              <TextAreaField
                label="Description"
                required
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

              <TextAreaField
                label="Responsibilities"
                help="One item per line."
                value={
                  form.responsibilities
                }
                onChange={(value) =>
                  updateField(
                    "responsibilities",
                    value
                  )
                }
              />

              <TextAreaField
                label="Requirements"
                help="One item per line."
                value={
                  form.requirements
                }
                onChange={(value) =>
                  updateField(
                    "requirements",
                    value
                  )
                }
              />

              <TextAreaField
                label="Benefits"
                help="One item per line."
                value={
                  form.benefits
                }
                onChange={(value) =>
                  updateField(
                    "benefits",
                    value
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold text-slate-950 dark:text-white">
              Source & Application
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Source Name"
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
                label="Apply URL"
                required
                value={
                  form.applyUrl
                }
                onChange={(value) =>
                  updateField(
                    "applyUrl",
                    value
                  )
                }
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

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold text-slate-950 dark:text-white">
              Publishing
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

              <SelectField
                label="Status"
                value={
                  form.status
                }
                onChange={(value) =>
                  updateField(
                    "status",
                    value
                  )
                }
                options={[
                  "published",
                  "draft",
                  "archived",
                ]}
              />
            </div>

            <label className="mt-5 flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
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
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />

              Featured Job
            </label>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/jobs"
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
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
  required = false,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950"
      />
    </label>
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
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  required = false,
  help,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  required?: boolean;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {help && (
        <span className="mb-2 block text-xs text-slate-500">
          {help}
        </span>
      )}

      <textarea
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        rows={6}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );
}