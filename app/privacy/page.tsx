import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export const metadata = {
  title: "Privacy Policy | Horizon Jobs",
  description:
    "Read the Horizon Jobs privacy policy and learn how information is handled when you use the platform.",
};

export default function PrivacyPage() {
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
                label: "Privacy Policy",
              },
            ]}
          />
        </div>

        <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-10">

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Privacy Policy
          </h1>

          <p className="text-sm text-slate-500 mt-3">
            Last updated: August 14, 2026
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none mt-8">

            <h2>1. Overview</h2>

            <p>
              Horizon Jobs respects your privacy. This Privacy Policy
              explains the types of information that may be collected when
              you use the Horizon Jobs website and how that information may
              be used.
            </p>

            <h2>2. Information You Provide</h2>

            <p>
              Information may be provided voluntarily when you contact us,
              submit a report, or otherwise communicate with the platform.
            </p>

            <p>
              We only request information that is reasonably necessary for
              the relevant interaction.
            </p>

            <h2>3. Automatically Collected Information</h2>

            <p>
              Like many websites, Horizon Jobs may receive technical
              information such as browser type, device information, pages
              visited, approximate location, and other standard log
              information.
            </p>

            <h2>4. Cookies and Similar Technologies</h2>

            <p>
              Horizon Jobs may use cookies or similar technologies for
              functionality, analytics, security, advertising, and
              preferences.
            </p>

            <p>
              Advertising services such as Google AdSense may use cookies
              and similar technologies according to their own policies and
              applicable consent requirements.
            </p>

            <h2>5. Job Applications</h2>

            <p>
              Horizon Jobs is generally a discovery platform. When you
              select an external application link, you may be redirected to
              an employer or third-party website. Their privacy policies
              govern information collected on those websites.
            </p>

            <h2>6. Third-Party Services</h2>

            <p>
              The platform may use third-party services for hosting,
              analytics, advertising, security, authentication, or database
              functionality.
            </p>

            <h2>7. Data Security</h2>

            <p>
              Reasonable technical and organizational measures are used to
              protect information under our control. No internet service can
              guarantee absolute security.
            </p>

            <h2>8. Your Choices</h2>

            <p>
              Depending on your location and applicable law, you may have
              rights regarding access, correction, deletion, restriction,
              objection, or other handling of personal information.
            </p>

            <h2>9. Changes to This Policy</h2>

            <p>
              This Privacy Policy may be updated as the platform,
              technology, services, or legal requirements change.
            </p>

            <h2>10. Contact</h2>

            <p>
              For privacy questions, please use the Contact page.
            </p>

          </div>

        </article>

      </div>
    </main>
  );
}