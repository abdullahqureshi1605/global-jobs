"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

interface ResourceForm {
  id: string;

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
  id: "",

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

function stringValue(
  value: unknown
): string {
  return value === null ||
    value === undefined
    ? ""
    : String(value);
}

function dateOnly(
  value: unknown
): string {
  const text =
    stringValue(value);

  return text
    ? text.slice(0, 10)
    : "";
}

export default function EditResourcePage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const router = useRouter();

  const [resourceId, setResourceId] =
    useState("");

  const [form, setForm] =
    useState<ResourceForm>(
      initialForm
    );

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

    async function loadResource() {
      try {
        const { id } =
          await params;

        if (!active) {
          return;
        }

        setResourceId(id);

        const response =
          await fetch(
            `/api/admin/resources/${encodeURIComponent(
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
              "Failed to load resource."
          );
        }

        const resource =
          result.resource;

        if (!active) {
          return;
        }

        setForm({
          id:
            stringValue(
              resource.id
            ),

          title:
            stringValue(
              resource.title
            ),

          slug:
            stringValue(
              resource.slug
            ),

          category:
            stringValue(
              resource.category
            ),

          description:
            stringValue(
              resource.description
            ),

          content:
            stringValue(
              resource.content
            ),

          author:
            stringValue(
              resource.author
            ),

          authorRole:
            stringValue(
              resource.author_role
            ),

          publishedDate:
            dateOnly(
              resource.published_date
            ),

          updatedDate:
            dateOnly(
              resource.updated_date
            ),

          readTime:
            stringValue(
              resource.read_time
            ),

          featured:
            Boolean(
              resource.featured
            ),

          status:
            stringValue(
              resource.status
            ) || "draft",

          seoTitle:
            stringValue(
              resource.seo_title
            ),

          seoDescription:
            stringValue(
              resource.seo_description
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
            : "Failed to load resource."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadResource();

    return () => {
      active = false;
    };
  }, [params]);

  function updateField<
    K extends keyof ResourceForm
  >(
    field: K,
    value: ResourceForm[K]
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

    if (!resourceId) {
      setError(
        "Resource ID is missing."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/resources/${encodeURIComponent(
            resourceId
          )}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              form
            ),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to update resource."
        );
      }

      setMessage(
        "Resource updated successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/resources"
        );
      }, 900);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update resource."
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
              Loading resource...
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
              Unable to load resource
            </h1>

            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/resources"
                )
              }
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Back to Resources
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
                "/admin/resources"
              )
            }
            className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Back to Resources
          </button>

          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Resource Management
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Edit Career Resource
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Edit the complete resource without creating a duplicate article.
          </p>
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
                value={
                  form.readTime
                }
                onChange={(value) =>
                  updateField(
                    "readTime",
                    value
                  )
                }
                placeholder="5 min read"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Article Content
            </h2>

            <div className="mt-6 space-y-5">
              <TextArea
                label="Short Description"
                required
                rows={5}
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

              <TextArea
                label="Full Content"
                required
                rows={18}
                value={form.content}
                onChange={(value) =>
                  updateField(
                    "content",
                    value
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Publication
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Published Date"
                type="date"
                required
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

              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-800 dark:bg-slate-800/50">
                <input
                  id="featured"
                  type="checkbox"
                  checked={
                    form.featured
                  }
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
                  className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Featured resource
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              SEO
            </h2>

            <div className="mt-6 space-y-5">
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
                rows={5}
                value={
                  form.seoDescription
                }
                onChange={(value) =>
                  updateField(
                    "seoDescription",
                    value
                  )
                }
              />
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/resources"
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
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
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