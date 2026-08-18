"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Edit,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Users,
  X,
} from "lucide-react";

interface EmailPlan {
  id: string;
  type: string;
  recipient: {
    email: string;
    name?: string;
    company?: string;
  };
  subject: string;
  content: string;
  scheduledDate: string;
  priority: number;
  status: string;
  followUpCount: number;
  maxFollowUps: number;
}

interface EmailList {
  id: string;
  name: string;
  source: string;
  emails: string[];
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  createdAt: string;
}

export default function EmailAutomationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [selectedListId, setSelectedListId] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSubject, setEditSubject] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/email-automation?type=all", {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to load data");
      }
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load email automation");
    } finally {
      setLoading(false);
    }
  }

  async function runAction(action: string, payload?: any) {
    setRunning(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/admin/email-automation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, data: payload }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to run ${action}`);
      }

      setResult(result.result);
      await loadData();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run action");
    } finally {
      setRunning(false);
    }
  }

  async function approveEmail(planId: string) {
    await runAction("approve", { planId });
  }

  async function rejectEmail(planId: string) {
    await runAction("reject", { planId });
  }

  async function modifyEmail(planId: string) {
    await runAction("modify", {
      planId,
      updates: {
        subject: editSubject,
        content: editContent,
      },
    });
    setEditingPlanId(null);
  }

  async function approveAll() {
    if (!selectedListId) {
      setError("Please select an email list first");
      return;
    }
    if (!confirm(`Approve all emails in this list?`)) return;
    await runAction("approve_all", { listId: selectedListId });
  }

  async function rejectAll() {
    if (!selectedListId) {
      setError("Please select an email list first");
      return;
    }
    if (!confirm(`Reject all emails in this list?`)) return;
    await runAction("reject_all", { listId: selectedListId });
  }

  async function sendApprovedEmails() {
    if (!confirm("Send all approved emails now?")) return;
    await runAction("send_approved", { limit: 20 });
  }

  async function extractEmails() {
    if (!confirm("Extract emails from all users? This may take a moment.")) return;
    await runAction("extract_emails");
  }

  async function createPlan() {
    if (!selectedListId) {
      setError("Please select an email list first");
      return;
    }
    await runAction("create_plan", { listId: selectedListId });
  }

  useEffect(() => {
    loadData();
  }, []);

  const pendingEmails = data?.pendingEmails || [];
  const emailLists = data?.emailLists || [];

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
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Email Automation Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                AI manages everything. You just approve/reject.
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
            {typeof result === "object" && result.message ? result.message : "Action completed!"}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-400">Pending Approval</p>
            <p className="text-2xl font-extrabold text-amber-600">{data?.totals?.pending || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-400">Email Lists</p>
            <p className="text-2xl font-extrabold text-indigo-600">{data?.totals?.lists || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-400">Total Emails</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.totals?.totalEmails || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-400">Approved</p>
            <p className="text-2xl font-extrabold text-emerald-600">
              {emailLists.reduce((acc: number, list: any) => acc + (list.approved || 0), 0)}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={extractEmails}
            disabled={running}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            Extract Emails
          </button>
          <button
            onClick={sendApprovedEmails}
            disabled={running}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Send Approved
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Email List Selector */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select List:</span>
          <select
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm outline-none"
          >
            <option value="">-- Select Email List --</option>
            {emailLists.map((list: EmailList) => (
              <option key={list.id} value={list.id}>
                {list.name} ({list.total} emails, {list.pending} pending)
              </option>
            ))}
          </select>
          <button
            onClick={createPlan}
            disabled={running || !selectedListId}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            Create Plan
          </button>
          <button
            onClick={approveAll}
            disabled={running || !selectedListId}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Approve All
          </button>
          <button
            onClick={rejectAll}
            disabled={running || !selectedListId}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Reject All
          </button>
        </div>

        {/* Pending Emails List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Pending Emails ({pendingEmails.length})
          </h2>

          {pendingEmails.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
              <p className="text-slate-500">No pending emails. Extract emails or create a plan.</p>
            </div>
          ) : (
            pendingEmails.map((plan: EmailPlan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        plan.priority <= 2
                          ? "bg-red-100 text-red-700"
                          : plan.priority <= 3
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        Priority {plan.priority}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        {plan.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        Follow-up {plan.followUpCount}/{plan.maxFollowUps}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white mt-2">
                      {plan.subject}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      To: {plan.recipient.email}
                      {plan.recipient.name && ` (${plan.recipient.name})`}
                      {plan.recipient.company && ` • ${plan.recipient.company}`}
                    </p>

                    {editingPlanId === plan.id ? (
                      <div className="mt-3 space-y-2">
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm outline-none"
                          placeholder="Subject"
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={4}
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm outline-none"
                          placeholder="Content"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => modifyEmail(plan.id)}
                            disabled={running}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingPlanId(null)}
                            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => approveEmail(plan.id)}
                          disabled={running}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => rejectEmail(plan.id)}
                          disabled={running}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setEditingPlanId(plan.id);
                            setEditSubject(plan.subject);
                            setEditContent(plan.content);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Modify
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}