"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ResourceForm {
  title: string;
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

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export default function NewResourcePage() {
  const router = useRouter();

  const [form, setForm] = useState<ResourceForm>({
    title: "",
    category: "",
    description: "",
    content: "",
    author: "Horizon Jobs Editorial Team",
    authorRole: "Career Resources",
    publishedDate: "",
    updatedDate: "",
    readTime: "",
    featured: false,
    status: "draft",
    seoTitle: "",
    seoDescription: "",
  });

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof ResourceForm>(
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

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        ...form,
      };

      const response = await fetch(
        "/api/admin/resources",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();

      let result: {
        error?: string;
        details?: string;
      } = {};

      try {
        result = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        throw new Error(
          `Invalid server response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.details ||
            result.error ||
            `Server error (${response.status}).`
        );
      }

      setMessage("Resource saved successfully.");

      setTimeout(() => {
        router.push("/admin/resources");
      }, 1000);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to save resource."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <button
          type="button"
          onClick={() =>
            router.push("/admin/resources")
          }
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to Resources
        </button>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
          Add New Career Resource
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Create a career guide or article and save it to the Horizon Jobs database.
        </p>

        {message && (
          <div className="my-6 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 p-4 text-sm">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >

          {/* Main Content */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Resource Content
            </h2>

            <Field
              label="Title"
              required
              value={form.title}
              onChange={(value) =>
                updateField("title", value)
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

            <TextArea
              label="Description"
              required
              value={form.description}
              onChange={(value) =>
                updateField("description", value)
              }
            />

            <TextArea
              label="Content"
              required
              value={form.content}
              onChange={(value) =>
                updateField("content", value)
              }
              rows={14}
              placeholder="Write your article content here..."
            />
          </section>

          {/* Author / SEO */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Author & SEO
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <Field
                label="Author"
                required
                value={form.author}
                onChange={(value) =>
                  updateField("author", value)
                }
              />

              <Field
                label="Author Role"
                value={form.authorRole}
                onChange={(value) =>
                  updateField(
                    "authorRole",
                    value
                  )
                }
              />

              <Field
                label="Published Date"
                type="date"
                required
                value={form.publishedDate}
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
                value={form.updatedDate}
                onChange={(value) =>
                  updateField(
                    "updatedDate",
                    value
                  )
                }
              />

              <Field
                label="Read Time"
                placeholder="6 min read"
                required
                value={form.readTime}
                onChange={(value) =>
                  updateField(
                    "readTime",
                    value
                  )
                }
              />

              <Field
                label="SEO Title"
                value={form.seoTitle}
                onChange={(value) =>
                  updateField(
                    "seoTitle",
                    value
                  )
                }
              />
            </div>

            <TextArea
              label="SEO Description"
              value={form.seoDescription}
              onChange={(value) =>
                updateField(
                  "seoDescription",
                  value
                )
              }
            />
          </section>

          {/* Publishing */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
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
                Featured resource
              </label>
            </div>

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
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/resources")
              }
              className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold"
            >
              {saving
                ? "Saving..."
                : "Save Resource"}
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
}: FieldProps) {
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

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 6,
}: TextAreaProps) {
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
        rows={rows}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: SelectFieldProps) {
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