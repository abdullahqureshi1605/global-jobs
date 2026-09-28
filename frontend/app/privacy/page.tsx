import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | Horizon Jobs",
  description: "Privacy information for Horizon Jobs users and visitors.",
};

export default function PrivacyPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-14 text-white">
        <div className="horizon-container">
          <p className="horizon-eyebrow text-[#e4ad2f]">LEGAL</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Privacy</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
            Information about privacy and the way Horizon Jobs may handle
            information when you use the platform.
          </p>
        </div>
      </section>

      <section className="horizon-container py-10 md:py-14">
        <article className="horizon-card p-7 md:p-10">
          <div className="space-y-8 text-sm leading-8 text-slate-700 md:text-base">
            <section>
              <h2 className="text-2xl font-black text-[#071a35]">Information you provide</h2>
              <p className="mt-3">
                Horizon Jobs may receive information that you choose to provide
                when creating an account, maintaining a profile, saving jobs,
                creating job alerts, submitting applications, contacting us,
                or using recruiter features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">How information may be used</h2>
              <p className="mt-3">
                Information may be used to provide account functionality,
                operate job-search and recruitment features, communicate with
                users, maintain security, improve the platform, and provide
                requested services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">Job applications</h2>
              <p className="mt-3">
                Some listings may send applicants to an employer or another
                external application service. Information submitted after
                leaving Horizon Jobs is subject to the policies and terms of
                that external service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">Cookies</h2>
              <p className="mt-3">
                Cookies and similar technologies may be used for authentication,
                security, preferences, analytics, and other website
                functionality. See the Cookie Policy for more information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">Security</h2>
              <p className="mt-3">
                Reasonable measures are used to help protect information and
                maintain the security of the service. No internet-based system
                can guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">Questions and requests</h2>
              <p className="mt-3">
                For privacy-related questions or requests, contact Horizon Jobs
                through the contact information published on the website.
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
