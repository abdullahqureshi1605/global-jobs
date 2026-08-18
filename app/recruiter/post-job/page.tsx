"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, BriefcaseBusiness } from "lucide-react";

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recruiter, setRecruiter] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    company: "",
    country: "",
    city: "",
    category: "",
    employmentType: "Full-time",
    workplaceType: "On-site",
    experienceLevel: "Entry Level",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    description: "",
    requirements: "",
    applyUrl: "",
  });

  useEffect(() => {
    async function loadRecruiter() {
      try {
        const response = await fetch("/api/recruiter/me", { cache: "no-store" });
        if (!response.ok) {
          router.push("/recruiter/login");
          return;
        }
        const data = await response.json();
        setRecruiter(data.recruiter);
        setForm(prev => ({ ...prev, company: data.recruiter.company }));
      } catch {
        router.push("/recruiter/login");
      }
    }
    loadRecruiter();
  }, [router]);

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/recruiter/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          recruiterId: recruiter.id,
          requirements: form.requirements.split("\n").filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post job");
      }

      setSuccess("Job posted successfully!");
      setTimeout(() => router.push("/recruiter/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post job");
    } finally {
      setLoading(false);
    }
  }

  if (!recruiter) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <Link
            href="/recruiter/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-600 text-white">
              <BriefcaseBusiness className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Post a Job
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {recruiter.plan === "free"
                  ? `You have ${recruiter.jobsRemaining} free job posts remaining`
                  : "Unlimited job posts with your paid plan"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-sm text-emerald-700 dark:text-emerald-300">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Company *
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => updateField("company", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Country *
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="United States"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                City *
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="New York"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Category *
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Technology"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Employment Type
              </label>
              <select
                value={form.employmentType}
                onChange={(e) => updateField("employmentType", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Temporary</option>
                <option>Internship</option>
                <option>Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Workplace Type
              </label>
              <select
                value={form.workplaceType}
                onChange={(e) => updateField("workplaceType", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>On-site</option>
                <option>Hybrid</option>
                <option>Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Experience Level
              </label>
              <select
                value={form.experienceLevel}
                onChange={(e) => updateField("experienceLevel", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Entry Level</option>
                <option>Mid Level</option>
                <option>Senior</option>
                <option>Executive</option>
              </select>
            </div>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Min Salary
              </label>
              <input
                type="number"
                value={form.salaryMin}
                onChange={(e) => updateField("salaryMin", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Max Salary
              </label>
              <input
                type="number"
                value={form.salaryMax}
                onChange={(e) => updateField("salaryMax", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="80000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Currency
              </label>
              <input
                type="text"
                value={form.salaryCurrency}
                onChange={(e) => updateField("salaryCurrency", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="USD"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Job Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Requirements (one per line)
            </label>
            <textarea
              value={form.requirements}
              onChange={(e) => updateField("requirements", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              placeholder="5+ years of experience&#10;Bachelor's degree in Computer Science&#10;Strong communication skills"
            />
          </div>

          {/* Apply URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Application URL *
            </label>
            <input
              type="url"
              value={form.applyUrl}
              onChange={(e) => updateField("applyUrl", e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://your-company.com/apply"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
          >
            {loading ? "Posting..." : "Post Job"}
          </button>
        </form>
      </div>
    </main>
  );
}