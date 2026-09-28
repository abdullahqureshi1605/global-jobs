import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Horizon Jobs",
  description: "Cookie Policy for Horizon Jobs.",
};

const sections = [
  ["What Are Cookies?", "Cookies are small files or pieces of information stored by a website or service in your browser. They may allow a website to remember information between visits or help services understand how a website is being used."],
  ["Essential Cookies", "These may be required for login, authentication, security, session management, and basic website functionality. These cookies may be necessary for the website to operate."],
  ["Preference Cookies", "These may remember choices such as language, preferences, and interface settings."],
  ["Analytics Cookies", "These may help us understand website traffic, page usage, performance, technical problems, and general usage patterns."],
  ["Advertising Cookies", "If advertising is enabled, third-party advertising providers such as Google may use cookies or similar technologies to serve advertisements. Google states that its advertising services may place cookies when Google ad tags are used, and publishers displaying Google ads must clearly disclose cookie usage and comply with applicable privacy laws."],
  ["Third-Party Cookies", "Some services used on Horizon Jobs may place their own cookies or similar technologies. These may include providers for analytics, authentication, advertising, embedded services, and external integrations. Third-party providers operate under their own policies."],
  ["Managing Cookies", "Most browsers allow users to control or delete cookies through browser settings. Disabling certain cookies may affect website functionality. Where legally required, Horizon Jobs may also provide cookie-consent or preference controls."],
  ["Advertising Preferences", "Users may be able to control personalized advertising preferences through Google's advertising settings and other available controls."],
  ["Updates", "We may update this Cookie Policy when our use of cookies or relevant technologies changes."],
  ["Contact", "Questions about cookies can be sent to support@horizonjobs.online."]
];

export default function CookiePolicyPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-8 text-white">
        <div className="horizon-container">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#e4ad2f]">LEGAL</p>
          <h1 className="mt-2 text-[24px] font-bold">Cookie Policy</h1>
          <p className="mt-2 text-[12px] text-white/70">Effective Date: [DATE]</p>
        </div>
      </section>
      <section className="horizon-container py-8">
        <article className="horizon-card p-6 md:p-8">
          <p className="mb-7 text-[12px] leading-6 text-slate-700">
            Horizon Jobs uses cookies and similar technologies to provide essential functionality, improve performance, understand website usage, and, where enabled, support advertising.
          </p>
          <div className="space-y-6 text-[12px] leading-6 text-slate-700">
            {sections.map(([title, text]) => (
              <section key={title}>
                <h2 className="text-[16px] font-bold text-[#071a35]">{title}</h2>
                <p className="mt-1.5">{text}</p>
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
