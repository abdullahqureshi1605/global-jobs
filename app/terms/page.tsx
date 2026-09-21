import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Horizon Jobs",
  description: "Terms governing use of the Horizon Jobs platform.",
};

export default function TermsPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-14 text-white">
        <div className="horizon-container">
          <p className="horizon-eyebrow text-[#e4ad2f]">LEGAL</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Terms of Service</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
            Terms governing access to and use of Horizon Jobs.
          </p>
        </div>
      </section>

      <section className="horizon-container py-10 md:py-14">
        <article className="horizon-card p-7 md:p-10">
          <div className="space-y-8 text-sm leading-8 text-slate-700 md:text-base">
            <section>
              <h2 className="text-2xl font-black text-[#071a35]">1. Acceptable use</h2>
              <p className="mt-3">
                Use Horizon Jobs lawfully and responsibly. Do not misuse the
                platform, attempt unauthorized access, interfere with its
                operation, submit malicious material, or use another person's
                information without authorization.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">2. Accounts</h2>
              <p className="mt-3">
                Account holders are responsible for information submitted
                through their accounts and for keeping their credentials
                secure. Account information should be accurate and kept
                reasonably current.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">3. Job listings</h2>
              <p className="mt-3">
                Job information may originate from employers, recruiters, or
                external employment sources. Job availability, requirements,
                compensation, location, and application procedures can change.
                Applicants should verify important details with the relevant
                employer or application provider.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">4. Applications and external services</h2>
              <p className="mt-3">
                Some applications are completed on external websites. Those
                websites have their own terms, privacy practices, and
                responsibilities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">5. User content</h2>
              <p className="mt-3">
                Content submitted through Horizon Jobs should be lawful,
                relevant, and truthful to the extent reasonably required by the
                feature being used. Do not submit fraudulent, abusive,
                defamatory, malicious, or unauthorized material.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">6. Service changes</h2>
              <p className="mt-3">
                Features, listings, and other parts of the platform may change
                as Horizon Jobs develops. These Terms may also be updated when
                appropriate.
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
