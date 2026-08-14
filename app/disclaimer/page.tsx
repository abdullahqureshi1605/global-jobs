import BackButton from "@/components/layout/BackButton";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export const metadata = {
  title: "Disclaimer | Horizon Jobs",
  description:
    "Read the Horizon Jobs disclaimer regarding job listings, external sources, career information, and third-party services.",
};

export default function DisclaimerPage() {
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
                label: "Disclaimer",
              },
            ]}
          />
        </div>

        <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-10">

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Disclaimer
          </h1>

          <p className="text-sm text-slate-500 mt-3">
            Last updated: August 14, 2026
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none mt-8">

            <h2>Job Information</h2>

            <p>
              Horizon Jobs organizes and publishes job information for
              discovery purposes. Job availability, salary information,
              requirements, deadlines, company details, and other information
              may change after publication.
            </p>

            <h2>Verification</h2>

            <p>
              A listing marked as verified or reviewed reflects the status
              assigned by Horizon Jobs based on its internal review process.
              It does not constitute a guarantee that the employer will
              ultimately hire an applicant or that every detail remains
              unchanged.
            </p>

            <h2>External Sources</h2>

            <p>
              Application and source links may lead to third-party websites.
              Horizon Jobs does not control those websites and does not
              guarantee their content, availability, security, or policies.
            </p>

            <h2>Career Information</h2>

            <p>
              Career resources are provided for general informational and
              educational purposes. They are not legal, immigration,
              financial, tax, medical, or professional advice.
            </p>

            <h2>Immigration and Visa Information</h2>

            <p>
              Job seekers should verify immigration, visa, work-permit, and
              employment requirements through official government sources or
              qualified professionals before making decisions.
            </p>

            <h2>Third-Party Advertising</h2>

            <p>
              Horizon Jobs may display advertising from third-party
              advertising providers. The presence of an advertisement does
              not constitute endorsement or guarantee of the advertised
              company, product, or service.
            </p>

            <h2>No Guarantee of Employment</h2>

            <p>
              Using Horizon Jobs does not guarantee employment, an interview,
              an offer, a visa, a particular salary, or any other employment
              outcome.
            </p>

            <h2>Report Incorrect Information</h2>

            <p>
              If you identify an expired, incorrect, broken, misleading, or
              suspicious listing, please report it through our Report a Job
              page.
            </p>

          </div>

        </article>

      </div>
    </main>
  );
}