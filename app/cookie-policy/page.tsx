import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export const metadata = {
  title: "Cookie Policy | Horizon Jobs",
  description:
    "Learn how Horizon Jobs may use cookies and similar technologies.",
};

export default function CookiePolicyPage() {
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
                label: "Cookie Policy",
              },
            ]}
          />
        </div>

        <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-10">

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Cookie Policy
          </h1>

          <p className="text-sm text-slate-500 mt-3">
            Last updated: August 14, 2026
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none mt-8">

            <h2>What Are Cookies?</h2>

            <p>
              Cookies are small files that websites can store on a user's
              device. They can help websites remember information and
              understand how visitors use a service.
            </p>

            <h2>How We May Use Cookies</h2>

            <p>
              Horizon Jobs may use cookies or similar technologies for
              essential functionality, preferences, security, analytics,
              performance measurement, and advertising.
            </p>

            <h2>Advertising Cookies</h2>

            <p>
              If advertising services are enabled, third-party providers may
              use cookies or similar technologies to deliver and measure
              advertisements, subject to their own policies and applicable
              consent requirements.
            </p>

            <h2>Your Choices</h2>

            <p>
              Depending on your location and browser, you may be able to
              control or delete cookies through browser settings or available
              consent controls.
            </p>

            <h2>Changes</h2>

            <p>
              This Cookie Policy may be updated when our technology,
              advertising services, analytics tools, or legal requirements
              change.
            </p>

            <h2>Questions</h2>

            <p>
              For questions about cookies used by Horizon Jobs, please visit
              the Contact page.
            </p>

          </div>

        </article>

      </div>
    </main>
  );
}