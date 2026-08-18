"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

interface PendingData {
  totals: {
    jobs: number;
    resources: number;
    social: number;
    recruiters: number;
  };
  pendingJobs: any[];
  pendingResources: any[];
  pendingSocial: any[];
  pendingRecruiters: any[];
}

export default function AutomationDashboardPage() {
  const [data, setData] = useState<PendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [task, setTask] = useState("full_automation_cycle");

  async function loadData() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/automation?type=pending", {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to load data");
      }
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load automation status");
    } finally {
      setLoading(false);
    }
  }

  async function runAutomation() {
    setRunning(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("/api/admin/automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to run automation");
      }

      setResult(result.result);

      // Reload data after 3 seconds
      setTimeout(() => loadData(), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run automation");
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const tasks = [
    {
      id: "full_automation_cycle",
      label: "Full Automation Cycle",
      description: "Extract recruiters, research keywords, fetch jobs, create social posts",
      icon: Rocket,
    },
    {
      id: "extract_recruiters",
      label: "Extract Recruiters",
      description: "Find and save recruiters from all sources",
      icon: Users,
    },
    {
      id: "keyword_research",
      label: "Keyword Research",
      description: "Find trending keywords for SEO",
      icon: TrendingUp,
    },
    {
      id: "fetch_affiliate_jobs",
      label: "Fetch Affiliate Jobs",
      description: "Get jobs from affiliate platforms",
      icon: FileText,
    },
    {
      id: "prepare_social_post",
      label: "Prepare Social Post",
      description: "Create Canva-ready social posts",
      icon: Sparkles,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            ← Admin Dashboard
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Automation Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Run full automation cycles. Everything prepared for your approval.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-400 flex items-center justify-between">
            <span><AlertCircle className="w-5 h-5 inline mr-2" /> {error}</span>
            <button onClick={() => setError("")} className="text-sm underline">Dismiss</button>
          </div>
        )}

        {result && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 inline mr-2" />
            {result.message || "Automation completed successfully!"}
            {result.summary && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>📊 Recruiters: {result.summary.recruitersExtracted || 0}</div>
                <div>🔑 Keywords: {result.summary.keywordsFound || 0}</div>
                <div>💼 Jobs: {result.summary.jobsFetched || 0}</div>
                <div>📱 Posts: {result.summary.socialPostsCreated || 0}</div>
              </div>
            )}
          </div>
        )}

        {/* Pending Counts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded mt-2" />
              </div>
            ))
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <p className="text-sm text-slate-500">Pending Jobs</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.totals.jobs || 0}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <p className="text-sm text-slate-500">Pending Resources</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.totals.resources || 0}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <p className="text-sm text-slate-500">Pending Social</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.totals.social || 0}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <p className="text-sm text-slate-500">New Recruiters</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.totals.recruiters || 0}</p>
              </div>
            </>
          )}
        </div>

        {/* Run Automation */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-indigo-600" />
            Run Automation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {tasks.map((t) => (
              <button
                key={t.id}
                onClick={() => setTask(t.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  task === t.id
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300"
                    : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <t.icon className="w-4 h-4" />
                  <span className="font-semibold text-sm">{t.label}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{t.description}</p>
              </button>
            ))}
          </div>

          <button
            onClick={runAutomation}
            disabled={running}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running Automation...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run {tasks.find(t => t.id === task)?.label || "Automation"}
              </>
            )}
          </button>
        </section>

        {/* Pending Items */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Draft Jobs ({data?.pendingJobs?.length || 0})
            </h3>
            <div className="mt-3 max-h-48 overflow-y-auto space-y-2 text-sm">
              {data?.pendingJobs?.slice(0, 5).map((job) => (
                <div key={job.id} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="truncate">{job.title}</span>
                  <span className="text-xs text-slate-400">{job.company}</span>
                </div>
              ))}
              {(!data?.pendingJobs || data.pendingJobs.length === 0) && (
                <div className="text-sm text-slate-400">No draft jobs</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Social Posts ({data?.pendingSocial?.length || 0})
            </h3>
            <div className="mt-3 max-h-48 overflow-y-auto space-y-2 text-sm">
              {data?.pendingSocial?.slice(0, 5).map((post) => (
                <div key={post.id} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="truncate">{post.title}</span>
                  <span className="text-xs text-slate-400">{post.platform}</span>
                </div>
              ))}
              {(!data?.pendingSocial || data.pendingSocial.length === 0) && (
                <div className="text-sm text-slate-400">No draft social posts</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              New Recruiters ({data?.pendingRecruiters?.length || 0})
            </h3>
            <div className="mt-3 max-h-48 overflow-y-auto space-y-2 text-sm">
              {data?.pendingRecruiters?.slice(0, 5).map((rec) => (
                <div key={rec.id} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="truncate">{rec.company || rec.lead_name}</span>
                  <span className="text-xs text-slate-400">{rec.source}</span>
                </div>
              ))}
              {(!data?.pendingRecruiters || data.pendingRecruiters.length === 0) && (
                <div className="text-sm text-slate-400">No new recruiters</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              Draft Resources ({data?.pendingResources?.length || 0})
            </h3>
            <div className="mt-3 max-h-48 overflow-y-auto space-y-2 text-sm">
              {data?.pendingResources?.slice(0, 5).map((res) => (
                <div key={res.id} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="truncate">{res.title}</span>
                  <span className="text-xs text-slate-400">{res.category}</span>
                </div>
              ))}
              {(!data?.pendingResources || data.pendingResources.length === 0) && (
                <div className="text-sm text-slate-400">No draft resources</div>
              )}
            </div>
          </div>
        </section>

        {/* Refresh */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

      </div>
    </main>
  );
}