import Link from "next/link";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Privacy Policy | Horizon Jobs",
  description:
    "Read the Horizon Jobs privacy policy and learn how website information and user interactions are handled.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-sm text-slate-500"
        >
          <Link href="/" className="hover:text-indigo-600">
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="font-medium text-slate-900 dark:text-white">
            Privacy Policy
          </span>
        </nav>

        <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10">

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Last updated: August 2026
          </p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-400">

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                1. Introduction
              </h2>

              <p>
                Horizon Jobs is a global job discovery platform that helps
                visitors find employment opportunities and career information.
                This policy explains how information may be handled when you
                use the website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                2. Information We May Receive
              </h2>

              <p>
                Information may be provided voluntarily when you contact us,
                submit a report, or communicate with our support team. Technical
                information may also be processed by hosting, analytics, security,
                or advertising services used by the website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                3. Cookies and Advertising
              </h2>

              <p>
                Horizon Jobs may use cookies or similar technologies for website
                functionality, analytics, security, and advertising. Where
                applicable, third-party advertising providers may use cookies
                or similar technologies subject to their own policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                4. External Websites
              </h2>

              <p>
                Job listings may link to external employer websites or other
                third-party sources. Once you leave Horizon Jobs, the privacy
                practices of that external website apply.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                5. Contact
              </h2>

              <p>
                For privacy-related questions, please contact Horizon Jobs
                through the contact page.
              </p>
            </section>

          </div>
        </article>
      </div>
    </main>
  );
}