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

type ResourceForm = {
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
};

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

function text(value: unknown) {
  return value === null ||
    value === undefined
    ? ""
    : String(value);
}

function dateOnly(value: unknown) {
  return text(value).slice(0, 10);
}

export default function EditResourcePage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const id = params?.id;

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

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (!id) return;

    async function loadResource() {
      try {
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

        setForm({
          title: text(
            resource.title
          ),
          slug: text(
            resource.slug
          ),
          category: text(
            resource.category
          ),
          description: text(
            resource.description
          ),
          content: text(
            resource.content
          ),
          author: text(
            resource.author
          ),
          authorRole: text(
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
          readTime: text(
            resource.read_time
          ),
          featured: Boolean(
            resource.featured
          ),
          status:
            text(
              resource.status
            ) || "draft",
          seoTitle: text(
            resource.seo_title
          ),
          seoDescription: text(
            resource.seo_description
          ),
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load resource."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadResource();
  }, [id]);

  function update(
    key: keyof ResourceForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveResource(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError(
        "Resource ID is missing."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/resources/${encodeURIComponent(
            id
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

      setSuccess(
        "Career resource updated successfully."
      );

      if (result.resource) {
        setForm((current) => ({
          ...current,
          status:
            result.resource.status ??
            current.status,
        }));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update resource."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 text-center dark:bg-slate-900">
          Loading resource...
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
              "/admin/resources"
            )
          }
          className="mb-6 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to Resources
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Resource Management
          </p>

          <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
            Edit Career Resource
          </h1>
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
          onSubmit={saveResource}
          className="space-y-8"
        >
          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Basic Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                label="Title"
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
                label="Slug"
                value={form.slug}
                onChange={(value) =>
                  update(
                    "slug",
                    value
                  )
                }
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
                label="Author"
                value={form.author}
                onChange={(value) =>
                  update(
                    "author",
                    value
                  )
                }
                required
              />

              <Field
                label="Author Role"
                value={
                  form.authorRole
                }
                onChange={(value) =>
                  update(
                    "authorRole",
                    value
                  )
                }
              />

              <Field
                label="Read Time"
                value={
                  form.readTime
                }
                onChange={(value) =>
                  update(
                    "readTime",
                    value
                  )
                }
                required
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Article Content
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
                rows={5}
                required
              />

              <TextArea
                label="Content"
                value={form.content}
                onChange={(value) =>
                  update(
                    "content",
                    value
                  )
                }
                rows={20}
                required
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Publishing
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                label="Published Date"
                type="date"
                value={
                  form.publishedDate
                }
                onChange={(value) =>
                  update(
                    "publishedDate",
                    value
                  )
                }
                required
              />

              <Field
                label="Updated Date"
                type="date"
                value={
                  form.updatedDate
                }
                onChange={(value) =>
                  update(
                    "updatedDate",
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

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-800">
                <input
                  type="checkbox"
                  checked={
                    form.featured
                  }
                  onChange={(event) =>
                    update(
                      "featured",
                      event.target
                        .checked
                    )
                  }
                />

                <span className="text-sm font-semibold">
                  Featured resource
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
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
                  update(
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
                  update(
                    "seoDescription",
                    value
                  )
                }
                rows={5}
              />
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/resources"
                )
              }
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
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
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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