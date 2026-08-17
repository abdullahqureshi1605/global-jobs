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

interface ResourceForm {
  title: string;
  slug: string;
  category: string;

  description: string;
  content: string;

  author: string;
  authorRole: string;

  publishedDate: string;
  updatedDate: string;
  readTime: string;

  featured: boolean;
  status: string;

  seoTitle: string;
  seoDescription: string;
}

const initialForm: ResourceForm = {
  title: "",
  slug: "",
  category: "",

  description: "",
  content: "",

  author: "",
  authorRole: "",

  publishedDate: "",
  updatedDate: "",
  readTime: "",

  featured: false,
  status: "draft",

  seoTitle: "",
  seoDescription: "",
};

function formatDate(value: unknown) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

async function readJsonResponse(
  response: Response
) {
  const text =
    await response.text();

  if (!text.trim()) {
    throw new Error(
      `Server returned an empty response (${response.status}).`
    );
  }

  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned invalid JSON (${response.status}).`
    );
  }

  return data;
}

export default function EditResourcePage() {
  const router =
    useRouter();

  const params =
    useParams<{
      id: string;
    }>();

  const id =
    params?.id;

  const [form, setForm] =
    useState<ResourceForm>(
      initialForm
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (!id) {
      setError(
        "Resource ID is missing."
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadResource() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/admin/resources/${encodeURIComponent(
              id
            )}`,
            {
              method: "GET",
              cache: "no-store",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await readJsonResponse(
            response
          );

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to load career resource."
          );
        }

        if (
          !data?.success ||
          !data?.resource
        ) {
          throw new Error(
            data?.error ||
              "Career resource data was not returned."
          );
        }

        const resource =
          data.resource;

        if (cancelled) {
          return;
        }

        setForm({
          title:
            resource.title ?? "",

          slug:
            resource.slug ?? "",

          category:
            resource.category ?? "",

          description:
            resource.description ??
            "",

          content:
            resource.content ??
            "",

          author:
            resource.author ?? "",

          authorRole:
            resource.author_role ??
            resource.authorRole ??
            "",

          publishedDate:
            formatDate(
              resource.published_date ??
                resource.publishedDate
            ),

          updatedDate:
            formatDate(
              resource.updated_date ??
                resource.updatedDate
            ),

          readTime:
            resource.read_time ??
            resource.readTime ??
            "",

          featured:
            Boolean(
              resource.featured
            ),

          status:
            resource.status ??
            "draft",

          seoTitle:
            resource.seo_title ??
            resource.seoTitle ??
            "",

          seoDescription:
            resource.seo_description ??
            resource.seoDescription ??
            "",
        });
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load career resource."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResource();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function updateField(
    field: keyof ResourceForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError(
        "Resource ID is missing."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response =
        await fetch(
          `/api/admin/resources/${encodeURIComponent(
            id
          )}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body: JSON.stringify(
              form
            ),
          }
        );

      const data =
        await readJsonResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to update career resource."
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error ||
            "Career resource update failed."
        );
      }

      setMessage(
        "Career resource updated successfully."
      );

      window.setTimeout(
        () => {
          router.push(
            "/admin/resources"
          );
          router.refresh();
        },
        600
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update career resource."
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
            Loading career resource...
          </p>
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
                "/admin/resources"
              )
            }
            className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Back to Resources
          </button>

          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
            Edit Career Resource
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Update the existing article or career guide.
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
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold text-slate-950 dark:text-white">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Title"
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
                label="Slug"
                value={form.slug}
                onChange={(value) =>
                  updateField(
                    "slug",
                    value
                  )
                }
              />

              <Field
                label="Author"
                required
                value={form.author}
                onChange={(value) =>
                  updateField(
                    "author",
                    value
                  )
                }
              />

              <Field
                label="Author Role"
                value={
                  form.authorRole
                }
                onChange={(value) =>
                  updateField(
                    "authorRole",
                    value
                  )
                }
              />

              <Field
                label="Read Time"
                required
                placeholder="6 min read"
                value={
                  form.readTime
                }
                onChange={(value) =>
                  updateField(
                    "readTime",
                    value
                  )
                }
              />

              <Field
                label="Published Date"
                required
                type="date"
                value={
                  form.publishedDate
                }
                onChange={(value) =>
                  updateField(
                    "publishedDate",
                    value
                  )
                }
              />

              <Field
                label="Updated Date"
                type="date"
                value={
                  form.updatedDate
                }
                onChange={(value) =>
                  updateField(
                    "updatedDate",
                    value
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold text-slate-950 dark:text-white">
              Resource Content
            </h2>

            <div className="space-y-5">
              <TextArea
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
                rows={5}
              />

              <TextArea
                label="Content"
                required
                value={form.content}
                onChange={(value) =>
                  updateField(
                    "content",
                    value
                  )
                }
                rows={18}
                help="Use Markdown headings such as ## and ### for article structure."
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold text-slate-950 dark:text-white">
              SEO
            </h2>

            <div className="space-y-5">
              <Field
                label="SEO Title"
                value={
                  form.seoTitle
                }
                onChange={(value) =>
                  updateField(
                    "seoTitle",
                    value
                  )
                }
              />

              <TextArea
                label="SEO Description"
                value={
                  form.seoDescription
                }
                onChange={(value) =>
                  updateField(
                    "seoDescription",
                    value
                  )
                }
                rows={4}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold text-slate-950 dark:text-white">
              Publishing
            </h2>

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
                "published",
                "draft",
                "archived",
              ]}
            />

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

              Featured Resource
            </label>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/resources"
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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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

function TextArea({
  label,
  value,
  onChange,
  required = false,
  help,
  rows = 6,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  required?: boolean;
  help?: string;
  rows?: number;
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
        <span className="mb-2 block text-xs text-slate-500 dark:text-slate-400">
          {help}
        </span>
      )}

      <textarea
        value={value}
        required={required}
        rows={rows}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );
}