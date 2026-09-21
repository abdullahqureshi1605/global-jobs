import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Horizon Jobs",
  description: "Learn how Horizon Jobs handles information and privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-14 text-white">
        <div className="horizon-container">
          <p className="horizon-eyebrow text-[#e4ad2f]">LEGAL</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
            This Privacy Policy explains how Horizon Jobs may handle information
            when visitors and registered users use the platform.
          </p>
        </div>
      </section>

      <section className="horizon-container py-10 md:py-14">
        <article className="horizon-card p-7 md:p-10">
          <div className="space-y-8 text-sm leading-8 text-slate-700 md:text-base">
            <section>
              <h2 className="text-2xl font-black text-[#071a35]">1. Scope</h2>
              <p className="mt-3">
                This policy applies to information handled through the Horizon
                Jobs website and its related account, job-search, recruitment,
                alert, and communication features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">2. Information we may receive</h2>
              <p className="mt-3">
                Depending on how you use the platform, Horizon Jobs may receive
                information such as your name, email address, profile details,
                employment-related information, saved jobs, job alerts,
                applications, recruiter information, messages, and information
                you voluntarily submit through forms or account features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">3. Technical information</h2>
              <p className="mt-3">
                The website may process technical information needed to operate,
                secure, maintain, and improve the service. This can include
                information associated with requests, devices, browsers, and
                website usage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">4. How information is used</h2>
              <p className="mt-3">
                Information may be used to provide and maintain accounts,
                display and manage jobs, provide job alerts, support recruiter
                features, process applications where applicable, communicate
                with users, prevent abuse, maintain security, troubleshoot
                problems, and improve Horizon Jobs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">5. Job applications and third parties</h2>
              <p className="mt-3">
                Some job listings may direct you to an employer or third-party
                application website. Information submitted on those external
                services is governed by their own privacy policies and terms.
                Horizon Jobs does not control the privacy practices of external
                websites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">6. Cookies and similar technologies</h2>
              <p className="mt-3">
                Horizon Jobs may use cookies and similar technologies for
                authentication, security, preferences, measurement, advertising,
                and website functionality. Details are provided in the Cookie
                Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">7. Advertising</h2>
              <p className="mt-3">
                Horizon Jobs may display advertising from third-party advertising
                providers. Such providers may use cookies or similar technologies
                according to their own policies and applicable requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">8. Security</h2>
              <p className="mt-3">
                We use reasonable measures intended to protect information and
                maintain the security of the platform. However, no online
                service can guarantee complete security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">9. Data choices</h2>
              <p className="mt-3">
                Depending on your account and applicable law, you may have
                choices regarding information you provide, account information,
                communications, cookies, and other data practices. Requests can
                be made using the contact information published on Horizon Jobs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">10. Policy updates</h2>
              <p className="mt-3">
                This policy may be updated when the website, services, or
                applicable requirements change. The updated version will be
                published on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">11. Contact</h2>
              <p className="mt-3">
                For privacy questions, please use the contact information
                available on the Horizon Jobs Contact page.
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
