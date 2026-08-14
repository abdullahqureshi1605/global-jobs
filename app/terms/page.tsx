import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export const metadata = {
  title: "Terms of Service | Horizon Jobs",
  description:
    "Read the terms governing your use of the Horizon Jobs website.",
};

export default function TermsPage() {
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
                label: "Terms of Service",
              },
            ]}
          />
        </div>

        <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-10">

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Terms of Service
          </h1>

          <p className="text-sm text-slate-500 mt-3">
            Last updated: August 14, 2026
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none mt-8">

            <h2>1. Acceptance of These Terms</h2>

            <p>
              By accessing or using Horizon Jobs, you agree to these Terms
              of Service and applicable laws.
            </p>

            <h2>2. Platform Purpose</h2>

            <p>
              Horizon Jobs provides job discovery and career information.
              The platform does not generally act as the employer or hiring
              authority for jobs displayed on the website.
            </p>

            <h2>3. Job Listings</h2>

            <p>
              Job information may come from employers, recruitment
              organizations, public sources, or other third-party sources.
              Availability and accuracy can change.
            </p>

            <h2>4. External Websites</h2>

            <p>
              Job application links may send you to websites operated by
              employers or third parties. Horizon Jobs is not responsible
              for the policies, availability, security, or content of those
              external websites.
            </p>

            <h2>5. No Employment Guarantee</h2>

            <p>
              Discovering or applying for a job through Horizon Jobs does
              not guarantee an interview, offer, employment, visa approval,
              salary, or any other outcome.
            </p>

            <h2>6. Acceptable Use</h2>

            <p>
              You agree not to misuse the platform, attempt unauthorized
              access, interfere with its operation, submit malicious
              information, or use the website for unlawful activity.
            </p>

            <h2>7. Intellectual Property</h2>

            <p>
              Website branding, original editorial content, interface
              design, and other original platform material may be protected
              by applicable intellectual-property laws.
            </p>

            <h2>8. Availability</h2>

            <p>
              Horizon Jobs may change, suspend, or discontinue features,
              pages, listings, or services without guaranteeing continuous
              availability.
            </p>

            <h2>9. Limitation of Responsibility</h2>

            <p>
              Information is provided for general discovery and informational
              purposes. Users should verify important job information with
              the original employer or source before taking action.
            </p>

            <h2>10. Changes</h2>

            <p>
              These terms may be updated when the platform or its services
              change.
            </p>

            <h2>11. Contact</h2>

            <p>
              Questions about these terms can be submitted through the
              Contact page.
            </p>

          </div>

        </article>

      </div>
    </main>
  );
}