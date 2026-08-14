import Link from "next/link";
import {
  Mail,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export const metadata = {
  title: "Contact Horizon Jobs",
  description:
    "Contact Horizon Jobs for questions, corrections, job reports, and platform-related enquiries.",
};

const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ||
  "https://wa.me/";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="space-y-4 mb-8">
          <BackButton label="Back" />

          <Breadcrumbs
            items={[
              {
                label: "Home",
                href: "/",
              },
              {
                label: "Contact",
              },
            ]}
          />
        </div>

        <header className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
            Contact Horizon Jobs
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
            How can we help?
          </h1>

          <p className="text-slate-300 text-sm leading-7 mt-4 max-w-2xl">
            Use the options below for general questions, corrections,
            technical issues, or job-related reports.
          </p>

        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-500/50 hover:shadow-lg transition-all"
          >
            <MessageCircle className="w-6 h-6 text-indigo-600" />

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-4">
              WhatsApp
            </h2>

            <p className="text-sm text-slate-500 mt-2 leading-6">
              Contact the Horizon Jobs support channel directly.
            </p>

            <span className="inline-block mt-4 text-sm font-semibold text-indigo-600">
              Open WhatsApp →
            </span>
          </a>

          <a
            href="mailto:contact@yourdomain.com"
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-500/50 hover:shadow-lg transition-all"
          >
            <Mail className="w-6 h-6 text-indigo-600" />

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-4">
              Email
            </h2>

            <p className="text-sm text-slate-500 mt-2 leading-6">
              Send a general platform enquiry by email.
            </p>

            <span className="inline-block mt-4 text-sm font-semibold text-indigo-600">
              Send Email →
            </span>
          </a>

        </div>

        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-10 mb-8">

          <div className="flex gap-4">

            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Reporting a job?
              </h2>

              <p className="text-sm text-slate-500 leading-6 mt-2">
                For an expired, broken, misleading, or suspicious listing,
                please use our dedicated report form so the issue can be
                reviewed efficiently.
              </p>

              <Link
                href="/report-job"
                className="inline-flex mt-4 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
              >
                Report a Job
              </Link>
            </div>

          </div>

        </section>

        <section className="text-sm text-slate-500 leading-7">

          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            Please do not send sensitive information
          </h2>

          <p>
            Do not send passwords, payment-card details, identity documents,
            or other sensitive personal information through general support
            channels.
          </p>

        </section>

      </div>
    </main>
  );
}