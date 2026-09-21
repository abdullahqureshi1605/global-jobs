import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | Horizon Jobs",
  description: "Important information about Horizon Jobs job listings and external links.",
};

export default function DisclaimerPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-14 text-white">
        <div className="horizon-container">
          <p className="horizon-eyebrow text-[#e4ad2f]">LEGAL</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Disclaimer</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
            Important information about job listings, employers, external
            websites, and information published on Horizon Jobs.
          </p>
        </div>
      </section>

      <section className="horizon-container py-10 md:py-14">
        <article className="horizon-card p-7 md:p-10">
          <div className="space-y-8 text-sm leading-8 text-slate-700 md:text-base">
            <section>
              <h2 className="text-2xl font-black text-[#071a35]">Job information</h2>
              <p className="mt-3">
                Horizon Jobs provides job-search information to help users
                discover employment opportunities. Listing details may change,
                become unavailable, or contain information supplied by employers,
                recruiters, or external employment sources.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">Verify important details</h2>
              <p className="mt-3">
                Users should verify important information such as job
                availability, employer identity, qualifications, salary,
                location, contract terms, deadlines, and application procedures
                before making decisions or submitting personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">No employment guarantee</h2>
              <p className="mt-3">
                Publication of a job listing does not guarantee that a position
                remains open, that an applicant will be contacted, or that an
                applicant will receive an offer of employment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">External websites</h2>
              <p className="mt-3">
                Horizon Jobs may link to employer websites, application
                platforms, advertising services, and other third-party websites.
                Those websites operate independently and have their own terms
                and privacy practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">Professional advice</h2>
              <p className="mt-3">
                Information on Horizon Jobs is general informational content and
                should not be treated as legal, immigration, financial, tax, or
                other professional advice. Seek qualified professional advice
                where appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">Changes</h2>
              <p className="mt-3">
                Horizon Jobs may update listings, pages, features, and this
                disclaimer as the platform develops.
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
