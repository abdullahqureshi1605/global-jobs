"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  MailOpen,
  Send,
  Users,
} from "lucide-react";

export default function EmailDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  // Email form states
  const [emailType, setEmailType] = useState("job_alert");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/email?type=all", {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to load data");
      }
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load email data");
    } finally {
      setLoading(false);
    }
  }

  async function sendEmail() {
    setSending(true);
    setResult(null);
    setError("");

    try {
      let payload = {};

      switch (emailType) {
        case "recruiter_outreach":
          payload = { to, name, company, customMessage: content };
          break;
        case "job_alert":
          try {
            const jobs = JSON.parse(content);
            payload = { to, name, jobs, frequency: "daily" };
          } catch {
            throw new Error("Job alert content must be valid JSON. Example: [{\"title\":\"Job\",\"company\":\"Company\",\"country\":\"USA\",\"city\":\"NYC\",\"applyUrl\":\"https://...\"}]");
          }
          break;
        case "newsletter":
          payload = { to: to.split(",").map(e => e.trim()), subject, content };
          break;
        case "send_email":
          payload = { to, subject, html: content };
          break;
        default:
          throw new Error("Unknown email type");
      }

      const response = await fetch("/api/admin/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: emailType, data: payload }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email");
      }

      setResult(result.result);

      // Clear form on success
      if (emailType !== "job_alert") {
        setTo("");
        setSubject("");
        setContent("");
        setName("");
        setCompany("");
      }

      setTimeout(() => loadData(), 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Email Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Send recruiter outreach, job alerts, and newsletters
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
            Email sent successfully! {result.count && `(${result.count} emails)`}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-indigo-600" />
              Send Email
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Type
                </label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none"
                >
                  <option value="job_alert">Job Alert (Newsletter)</option>
                  <option value="recruiter_outreach">Recruiter Outreach</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="send_email">Custom Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  To
                </label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder={emailType === "newsletter" ? "email1@example.com, email2@example.com" : "email@example.com"}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {emailType === "recruiter_outreach" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Recruiter Name"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company Name"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              {emailType !== "job_alert" && emailType !== "newsletter" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email Subject"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Content / Message
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={emailType === "job_alert" ? 'JSON array of jobs: [{"title":"Job","company":"Company","country":"USA","city":"NYC","applyUrl":"https://..."}]' : "Enter your message here..."}
                  rows={8}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                />
              </div>

              <button
                onClick={sendEmail}
                disabled={sending || !to || !content}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                {sending ? (
                  <>
                    <MailOpen className="w-4 h-4 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Mail className="w-4 h-4 text-blue-600" />
                Email Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Pending</span>
                  <span className="font-semibold">{data?.totals?.pending || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Sent</span>
                  <span className="font-semibold">{data?.totals?.sent || 0}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-sm text-slate-500">Total</span>
                  <span className="font-semibold">{(data?.totals?.pending || 0) + (data?.totals?.sent || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-emerald-600" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setEmailType("job_alert");
                    const sampleJobs = JSON.stringify([
                      { title: "Software Engineer", company: "TechCorp", country: "USA", city: "New York", applyUrl: "https://horizonjobs.online/jobs/1" },
                      { title: "Marketing Lead", company: "MarketPro", country: "UK", city: "London", applyUrl: "https://horizonjobs.online/jobs/2" },
                    ], null, 2);
                    setContent(sampleJobs);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition"
                >
                  📧 Prepare Job Alert
                </button>
                <button
                  onClick={() => {
                    setEmailType("recruiter_outreach");
                    setContent("We're looking to connect with recruiters in your industry. Let's collaborate!");
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition"
                >
                  📧 Prepare Recruiter Outreach
                </button>
                <button
                  onClick={() => loadData()}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition"
                >
                  🔄 Refresh Stats
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sent Emails */}
        <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <MailOpen className="w-4 h-4 text-cyan-600" />
            Recent Sent Emails
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {data?.sentEmails?.slice(0, 10).map((email: any) => (
              <div key={email.id} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-sm">
                <span className="truncate">{email.subject}</span>
                <span className="text-xs text-slate-400">{email.to_email}</span>
              </div>
            ))}
            {(!data?.sentEmails || data.sentEmails.length === 0) && (
              <div className="text-sm text-slate-400">No sent emails yet</div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}