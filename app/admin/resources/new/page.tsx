"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewResourcePage() {
  const router = useRouter();

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [publish, setPublish] =
    useState(false);

  const [form, setForm] =
    useState({
      title: "",
      category: "Career Guide",
      content: "",
      publishedDate:
        new Date()
          .toISOString()
          .slice(0, 10),
    });

  function update(
    name: string,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/admin/resources",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              ...form,
              publish,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.details ||
            data?.error ||
            "Article creation failed."
        );
      }

      router.push(
        "/admin/resources"
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Article creation failed."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">

      <div className="mx-auto max-w-5xl">

        <div className="mb-6">

          <Link
            href="/admin/resources"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Career Resources
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Create Career Article
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Create useful, original career content.
            Articles remain drafts unless you explicitly
            choose to publish them.
          </p>

        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <form
          onSubmit={submit}
          className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >

          <div>
            <label className="mb-2 block text-sm font-medium">
              Title
            </label>

            <input
              required
              value={form.title}
              onChange={(e) =>
                update(
                  "title",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <input
              required
              value={form.category}
              onChange={(e) =>
                update(
                  "category",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Article Content
            </label>

            <textarea
              required
              minLength={300}
              rows={22}
              value={form.content}
              onChange={(e) =>
                update(
                  "content",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-7 outline-none focus:border-cyan-500"
              placeholder="Write genuinely useful original career guidance here..."
            />

            <p className="mt-2 text-xs text-slate-500">
              Minimum 300 characters. Do not use
              copied, scraped, or low-value content.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Publish Date
              </label>

              <input
                type="date"
                value={
                  form.publishedDate
                }
                onChange={(e) =>
                  update(
                    "publishedDate",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-end">

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3">

                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(e) =>
                    setPublish(
                      e.target.checked
                    )
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium">
                  Publish immediately
                </span>

              </label>

            </div>

          </div>

          <div className="flex justify-end gap-3">

            <Link
              href="/admin/resources"
              className="rounded-xl border border-slate-700 px-5 py-3 font-medium hover:bg-slate-800"
            >
              Cancel
            </Link>

            <button
              disabled={saving}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Create Article"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}