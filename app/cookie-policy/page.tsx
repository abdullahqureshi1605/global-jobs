import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Horizon Jobs",
  description: "Information about cookies and similar technologies used by Horizon Jobs.",
};

export default function CookiePolicyPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-14 text-white">
        <div className="horizon-container">
          <p className="horizon-eyebrow text-[#e4ad2f]">LEGAL</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Cookie Policy</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
            Information about cookies and similar technologies used to operate
            and improve Horizon Jobs.
          </p>
        </div>
      </section>

      <section className="horizon-container py-10 md:py-14">
        <article className="horizon-card p-7 md:p-10">
          <div className="space-y-8 text-sm leading-8 text-slate-700 md:text-base">
            <section>
              <h2 className="text-2xl font-black text-[#071a35]">1. What are cookies?</h2>
              <p className="mt-3">
                Cookies are small files or similar technologies that allow a
                website to remember information about a browser or device and
                support website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">2. How Horizon Jobs may use them</h2>
              <p className="mt-3">
                Cookies and similar technologies may support sign-in sessions,
                security, preferences, website functionality, usage measurement,
                and advertising-related features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">3. Essential technologies</h2>
              <p className="mt-3">
                Some cookies or similar technologies may be necessary for
                authentication, security, account sessions, and core website
                functionality. Disabling these technologies may affect parts of
                the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">4. Measurement and preferences</h2>
              <p className="mt-3">
                Technologies may be used to understand website usage, remember
                preferences, and help improve the user experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">5. Advertising technologies</h2>
              <p className="mt-3">
                Horizon Jobs may use third-party advertising services. Those
                providers may use cookies or similar technologies in accordance
                with their own policies and applicable requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">6. Managing cookies</h2>
              <p className="mt-3">
                Most modern browsers provide controls for viewing, blocking, or
                deleting cookies. Blocking certain cookies may affect login,
                preferences, or other website features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">7. Changes</h2>
              <p className="mt-3">
                This Cookie Policy may be updated as website features,
                technologies, or applicable requirements change.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#071a35]">8. Contact</h2>
              <p className="mt-3">
                Questions about cookies can be directed through the Horizon Jobs
                Contact page.
              </p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
