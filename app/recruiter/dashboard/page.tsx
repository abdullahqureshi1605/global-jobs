"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  Crown,
  LogOut,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";

interface Recruiter {
  id: string;
  email: string;
  name: string;
  company: string;
  plan: string;
  jobsPosted: number;
  jobsRemaining: number;
}

interface Job {
  id: string;
  title: string;
  company: string;
  country: string;
  city: string;
  status: string;
  created_at: string;
  views: number;
  applications: number;
}

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalApplications: 0,
    publishedJobs: 0,
    draftJobs: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Check if logged in
        const meResponse = await fetch("/api/recruiter/me", { cache: "no-store" });
        if (!meResponse.ok) {
          router.push("/recruiter/login");
          return;
        }

        const userData = await meResponse.json();
        setRecruiter(userData.recruiter);

        // Get jobs
        const jobsResponse = await fetch(`/api/recruiter/jobs?recruiterId=${userData.recruiter.id}`);
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData.jobs || []);

          // Calculate stats
          const published = jobsData.jobs?.filter((j: any) => j.status === "published") || [];
          const drafts = jobsData.jobs?.filter((j: any) => j.status === "draft") || [];

          setStats({
            totalViews: published.reduce((acc: number, j: any) => acc + (j.views || 0), 0),
            totalApplications: published.reduce((acc: number, j: any) => acc + (j.applications || 0), 0),
            publishedJobs: published.length,
            draftJobs: drafts.length,
          });
        }
      } catch {
        router.push("/recruiter/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/recruiter/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!recruiter) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-600 text-white">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {recruiter.company}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Welcome back, {recruiter.name}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                recruiter.plan === "paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {recruiter.plan === "paid" ? (
                  <span className="flex items-center gap-1"><Crown className="w-3 h-3" /> Paid</span>
                ) : (
                  `Free (${recruiter.jobsRemaining} jobs left)`
                )}
              </span>
              {recruiter.plan === "free" && (
                <Link
                  href="/recruiter/upgrade"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
                >
                  Upgrade to Paid
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500">Published Jobs</p>
            <p className="text-2xl font-extrabold text-indigo-600">{stats.publishedJobs}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500">Draft Jobs</p>
            <p className="text-2xl font-extrabold text-amber-600">{stats.draftJobs}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500">Total Views</p>
            <p className="text-2xl font-extrabold text-emerald-600">{stats.totalViews}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500">Applications</p>
            <p className="text-2xl font-extrabold text-purple-600">{stats.totalApplications}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/recruiter/post-job"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </Link>
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition"
          >
            <BriefcaseBusiness className="w-4 h-4" />
            Manage Jobs
          </Link>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Recent Jobs
          </h2>
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <BriefcaseBusiness className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="mt-4 text-slate-500">You haven't posted any jobs yet.</p>
              <Link
                href="/recruiter/post-job"
                className="inline-flex mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
              >
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{job.title}</h3>
                    <p className="text-sm text-slate-500">{job.city}, {job.country}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        job.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      👁️ {job.views || 0} views
                    </span>
                    <span className="text-sm text-slate-500">
                      📩 {job.applications || 0} apps
                    </span>
                    <Link
                      href={`/recruiter/jobs/${job.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}