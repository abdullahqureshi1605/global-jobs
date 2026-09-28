import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | Horizon Jobs",
  description: "Important information about Horizon Jobs job listings and external links.",
};

const sections = [
  ["No Employment Guarantee", "Horizon Jobs does not guarantee employment, interviews, job offers, salaries, promotions, hiring decisions, or application success. All hiring decisions are made by the relevant employer or organization."],
  ["Job Listings", "Job listings and related information may originate from employers, recruitment companies, partners, affiliate platforms, external job websites, and other permitted sources. Although we may review and organize information, users should verify important details before applying."],
  ["External Websites", "Some links lead to external websites. Horizon Jobs does not control external websites and is not responsible for their content, availability, privacy practices, security, terms, or application processes."],
  ["Career Resources", "Career information is provided for general informational purposes and should not be treated as professional, legal, immigration, financial, tax, or employment advice."],
  ["Accuracy", "We aim to keep information useful and accurate, but information can change without notice. Always verify critical information with the relevant employer, organization, official source, or external provider."],
  ["Affiliate Disclosure", "Some links may be affiliate links. Horizon Jobs may receive a commission when users complete an eligible action through certain links. Affiliate relationships do not mean that Horizon Jobs guarantees the quality, availability, suitability, or outcome of an external service."],
  ["Advertising", "Horizon Jobs may display advertisements from third-party advertising providers. Third-party advertisements are subject to the policies and technologies of the relevant advertising providers."],
  ["AI-Generated Information", "Horizon Jobs may use automated or AI-assisted systems to organize information, generate recommendations, summarize content, or assist with platform operations. AI-generated information may contain errors and should be reviewed where accuracy is important."],
  ["Contact", "Questions regarding this disclaimer can be sent to support@horizonjobs.online."]
];

export default function DisclaimerPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-8 text-white">
        <div className="horizon-container">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#e4ad2f]">LEGAL</p>
          <h1 className="mt-2 text-[24px] font-bold">Disclaimer</h1>
          <p className="mt-2 text-[12px] text-white/70">Effective Date: [DATE]</p>
        </div>
      </section>
      <section className="horizon-container py-8">
        <article className="horizon-card p-6 md:p-8">
          <p className="mb-7 text-[12px] leading-6 text-slate-700">
            The information provided by Horizon Jobs is intended for general informational and employment-discovery purposes.
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
