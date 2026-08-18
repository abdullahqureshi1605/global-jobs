"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Flag,
  Users,
  Zap,
} from "lucide-react";

interface ControlCenterData {
  timestamp: string;
  company: {
    totalJobs: number;
    publishedJobs: number;
    draftJobs: number;
    totalReports: number;
    todayEvents: number;
  };
  marketing: {
    totalLeads: number;
    hotLeads: number;
    qualifiedLeads: number;
  };
  administration: {
    totalTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    pendingApprovals: number;
  };
  production: {
    jobsPublishedThisMonth: number;
    jobsAddedThisMonth: number;
  };
  automation: {
    todayAutomations: number;
    failedAutomations: number;
    successRate: number;
  };
}

export default function ControlCenterPage() {
  const [data, setData] = useState<ControlCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/admin/control-center", {
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to load data");
        }
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load control center");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded mt-2" />
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

  const stats = [
    {
      label: "Total Jobs",
      value: data.company.totalJobs,
      icon: BriefcaseBusiness,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      label: "Published Jobs",
      value: data.company.publishedJobs,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Leads",
      value: data.marketing.totalLeads,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Pending Tasks",
      value: data.administration.pendingTasks,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Pending Approvals",
      value: data.administration.pendingApprovals,
      icon: Flag,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "Automation Success",
      value: `${data.automation.successRate}%`,
      icon: Zap,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "Today Events",
      value: data.company.todayEvents,
      icon: Activity,
      color: "text-cyan-600",
      bg: "bg-cyan-50 dark:bg-cyan-950/30",
    },
    {
      label: "Job Reports",
      value: data.company.totalReports,
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
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
            <div className="p-3 rounded-xl bg-indigo-600 text-white">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Control Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Real-time business health and KPIs
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs text-slate-400">Today</span>
              </div>
              <p className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BriefcaseBusiness className="w-5 h-5 text-indigo-600" />
              Company Health
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Total Jobs</span>
                <span className="font-semibold">{data.company.totalJobs}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Published</span>
                <span className="font-semibold text-emerald-600">{data.company.publishedJobs}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Drafts</span>
                <span className="font-semibold text-amber-600">{data.company.draftJobs}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-slate-500">Job Reports</span>
                <span className="font-semibold text-orange-600">{data.company.totalReports}</span>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Marketing
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Total Leads</span>
                <span className="font-semibold">{data.marketing.totalLeads}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Hot Leads</span>
                <span className="font-semibold text-red-600">{data.marketing.hotLeads}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-slate-500">Qualified</span>
                <span className="font-semibold text-emerald-600">{data.marketing.qualifiedLeads}</span>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Administration
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Total Tasks</span>
                <span className="font-semibold">{data.administration.totalTasks}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Pending</span>
                <span className="font-semibold text-amber-600">{data.administration.pendingTasks}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Overdue</span>
                <span className="font-semibold text-red-600">{data.administration.overdueTasks}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-slate-500">Pending Approvals</span>
                <span className="font-semibold text-purple-600">{data.administration.pendingApprovals}</span>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Automation
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Today's Automations</span>
                <span className="font-semibold">{data.automation.todayAutomations}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Failed</span>
                <span className="font-semibold text-red-600">{data.automation.failedAutomations}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-slate-500">Success Rate</span>
                <span className="font-semibold text-emerald-600">{data.automation.successRate}%</span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 text-xs text-slate-400 text-right">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </div>

      </div>
    </main>
  );
}