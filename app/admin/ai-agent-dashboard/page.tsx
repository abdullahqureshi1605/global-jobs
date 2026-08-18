"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bot,
  Building2,
  CheckCircle2,
  FileText,
  Megaphone,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Loader2,
} from "lucide-react";

interface Recommendation {
  department: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  action: string;
  params: any;
  needsApproval: boolean;
  executing?: boolean;
  executed?: boolean;
  result?: any;
}

interface AgentData {
  success: boolean;
  department: string;
  data: {
    leads?: any[];
    social?: any[];
    content?: any[];
    deals?: any[];
    revenue?: any[];
    tasks?: any[];
    approvals?: any[];
    jobs?: any[];
    resources?: any[];
  };
  recommendations: Recommendation[];
}

const departmentIcons = {
  marketing: Megaphone,
  finance: TrendingUp,
  administration: Building2,
  production: FileText,
  system: Bot,
};

const departmentColors = {
  marketing: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
  finance: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  administration: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  production: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
  system: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",
};

const priorityColors = {
  high: "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
  medium: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  low: "text-slate-600 bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800",
};

export default function AIAgentDashboardPage() {
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [department, setDepartment] = useState("all");
  const [executing, setExecuting] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/ai-agent?department=${department}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to load data");
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load AI agent");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [department]);

  async function executeAction(rec: Recommendation, index: number) {
    if (!rec.action || rec.action === "none") return;

    setExecuting(rec.action);

    try {
      const response = await fetch("/api/admin/ai-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: rec.action,
          data: rec.params,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to execute action");
      }

      // Update the recommendation with result
      setData((prev) => {
        if (!prev) return prev;
        const newRecs = [...prev.recommendations];
        newRecs[index] = {
          ...newRecs[index],
          executed: true,
          executing: false,
          result: result.result,
        };
        return { ...prev, recommendations: newRecs };
      });

      // Reload data after 2 seconds to show updates
      setTimeout(() => loadData(), 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute action");
      setData((prev) => {
        if (!prev) return prev;
        const newRecs = [...prev.recommendations];
        newRecs[index] = {
          ...newRecs[index],
          executing: false,
        };
        return { ...prev, recommendations: newRecs };
      });
    } finally {
      setExecuting(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-700 dark:text-red-400">
            <AlertCircle className="w-6 h-6 inline mr-2" />
            {error}
            <button
              onClick={() => setError("")}
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-500">No data available</div>
        </div>
      </main>
    );
  }

  const departments = [
    { id: "all", label: "All Departments" },
    { id: "marketing", label: "Marketing" },
    { id: "finance", label: "Finance" },
    { id: "administration", label: "Administration" },
    { id: "production", label: "Production" },
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                AI Department Agents
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                AI-powered actions. Click "Execute" to run, or "Approve" for actions needing permission.
              </p>
            </div>
          </div>
        </div>

        {/* Department Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setDepartment(dept.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                department === dept.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* Recommendations with Action Buttons */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Recommendations & Actions
          </h2>

          <div className="space-y-4">
            {data.recommendations.map((rec, index) => {
              const Icon = departmentIcons[rec.department as keyof typeof departmentIcons] || Bot;
              const colorClass = departmentColors[rec.department as keyof typeof departmentColors] || departmentColors.system;
              const priorityClass = priorityColors[rec.priority as keyof typeof priorityColors] || priorityColors.low;

              return (
                <div
                  key={index}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-sm ${priorityClass}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {rec.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${priorityClass}`}>
                          {rec.priority}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">
                          {rec.department}
                        </span>
                        {rec.needsApproval && (
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
                            Needs Approval
                          </span>
                        )}
                        {rec.executed && (
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                            ✅ Done
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {rec.description}
                      </p>

                      {/* Action Buttons */}
                      {rec.action !== "none" && !rec.executed && (
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            onClick={() => executeAction(rec, index)}
                            disabled={executing === rec.action}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition ${
                              rec.needsApproval
                                ? "bg-amber-600 hover:bg-amber-500"
                                : "bg-indigo-600 hover:bg-indigo-500"
                            } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                          >
                            {executing === rec.action ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Executing...
                              </>
                            ) : rec.needsApproval ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Approve & Execute
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Execute
                              </>
                            )}
                          </button>

                          {rec.needsApproval && !rec.executed && (
                            <button
                              className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                              <X className="w-4 h-4 inline mr-1" />
                              Skip
                            </button>
                          )}
                        </div>
                      )}

                      {/* Result Message */}
                      {rec.executed && rec.result && (
                        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
                          ✅ {rec.result.message || "Action completed successfully!"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Refresh Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Data"}
          </button>
        </div>

      </div>
    </main>
  );
}