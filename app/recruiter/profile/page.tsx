"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Globe,
  Save,
} from "lucide-react";

type Company = {
  id: string;
  name: string | null;
  industry: string | null;
  website: string | null;
  size_range: string | null;
  logo_url: string | null;
  about: string | null;
  verification_status: string | null;
};

export default function RecruiterProfilePage() {
  const [company, setCompany] =
    useState<Company | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          "/api/recruiter/profile",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load company profile."
          );
        }

        setCompany(data.company);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load company profile."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (!company) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/recruiter/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(company),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save company profile."
        );
      }

      setCompany(data.company);
      setMessage(
        "Company profile updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save company profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-8 w-64 rounded-lg bg-slate-200" />
          <div className="mt-6 h-80 rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  if (!company) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || "Company profile not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <section className="bg-[#071a35] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/recruiter/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/70 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <div className="mt-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-[#e4ad2f]">
                Recruiter Workspace
              </p>

              <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                Company Profile
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
                Keep your employer profile professional and up to date.
              </p>
            </div>

            <div className="hidden rounded-2xl bg-white/10 px-4 py-3 text-right sm:block">
              <p className="text-xs text-white/50">
                Verification
              </p>
              <p className="mt-1 text-sm font-black text-[#f2c85d]">
                {company.verification_status || "pending"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">
          {message && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={save}
            className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(7,26,53,.07)]"
          >
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071a35] text-[#e4ad2f]">
                  <Building2 size={23} />
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#071a35]">
                    Employer details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Information candidates will see about your company.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 sm:px-8">
              <Field label="Company name">
                <input
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#e4ad2f] focus:ring-4 focus:ring-[#e4ad2f]/10"
                  value={company.name || ""}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </Field>

              <Field label="Industry">
                <input
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#e4ad2f] focus:ring-4 focus:ring-[#e4ad2f]/10"
                  value={company.industry || ""}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      industry: e.target.value,
                    })
                  }
                  placeholder="Technology, Healthcare, Logistics..."
                />
              </Field>

              <Field label="Website">
                <div className="relative">
                  <Globe
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    className="h-14 w-full rounded-2xl border border-slate-200 px-4 pl-11 outline-none focus:border-[#e4ad2f] focus:ring-4 focus:ring-[#e4ad2f]/10"
                    value={company.website || ""}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        website: e.target.value,
                      })
                    }
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </Field>

              <Field label="Company size">
                <select
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-[#e4ad2f] focus:ring-4 focus:ring-[#e4ad2f]/10"
                  value={company.size_range || ""}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      size_range: e.target.value,
                    })
                  }
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201-500">201–500 employees</option>
                  <option value="501-1000">501–1,000 employees</option>
                  <option value="1001+">1,001+ employees</option>
                </select>
              </Field>

              <Field label="Logo URL">
                <input
                  className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-[#e4ad2f] focus:ring-4 focus:ring-[#e4ad2f]/10"
                  value={company.logo_url || ""}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      logo_url: e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </Field>

              <div />

              <Field
                label="About the company"
                full
              >
                <textarea
                  className="min-h-40 w-full resize-y rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-[#e4ad2f] focus:ring-4 focus:ring-[#e4ad2f]/10"
                  value={company.about || ""}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      about: e.target.value,
                    })
                  }
                  placeholder="Tell candidates about your company..."
                />
              </Field>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-5 sm:px-8">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#e4ad2f] px-6 text-sm font-black text-[#071a35] hover:bg-[#f2c85d] disabled:opacity-60"
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save company profile"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-2 block text-sm font-black text-[#071a35]">
        {label}
      </label>
      {children}
    </div>
  );
}
