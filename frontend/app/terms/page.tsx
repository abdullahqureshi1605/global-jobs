import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Horizon Jobs",
  description: "Terms and conditions governing use of Horizon Jobs.",
};

const sections = [
  ["1. About Horizon Jobs", "Horizon Jobs provides employment-related information, job discovery tools, career resources, recruiter services, and related features. Horizon Jobs may include job information originating from employers, partners, affiliate services, or external websites."],
  ["2. Job Information", "Job information may include title, employer, location, salary, employment type, requirements, descriptions, and application information. We make reasonable efforts to maintain useful and accurate information, but job information may change or become unavailable."],
  ["3. External Links", "Horizon Jobs may link to external websites. When you leave Horizon Jobs, the external website is responsible for its own content, privacy practices, terms, security, and application process."],
  ["4. User Accounts", "Users are responsible for maintaining the accuracy of information they provide and keeping their login information secure. You must not impersonate another person, provide false information, attempt unauthorized access, misuse the platform, interfere with website operation, or upload malicious content."],
  ["5. Recruiter Accounts", "Recruiters and employers must provide accurate information and must have the authority to represent the company or organization they associate with their account. Job postings must not contain fraudulent, misleading, discriminatory, unlawful, or otherwise prohibited material."],
  ["6. Acceptable Use", "You agree not to use Horizon Jobs to commit fraud, distribute malware, scrape restricted/private information, attempt unauthorized access, abuse platform services, send spam, impersonate employers or candidates, interfere with other users, or violate applicable laws."],
  ["7. Intellectual Property", "Unless otherwise stated, Horizon Jobs' original branding, website design, software, original content, graphics, and other proprietary materials are owned by or licensed to Horizon Jobs. Third-party content remains subject to the rights of its respective owners."],
  ["8. Career Information", "Career resources are provided for general informational purposes. They do not constitute legal, financial, immigration, tax, employment, or professional advice."],
  ["9. Availability", "We may change, suspend, improve, or discontinue parts of Horizon Jobs from time to time. We do not guarantee uninterrupted or error-free service."],
  ["10. Limitation of Liability", "To the extent permitted by applicable law, Horizon Jobs is not responsible for losses arising from third-party websites, employer decisions, job availability, application outcomes, inaccurate third-party information, website interruptions, user misuse, or external services."],
  ["11. Changes", "We may update these terms from time to time. Continued use of Horizon Jobs after updated terms are posted constitutes acceptance of the updated terms to the extent permitted by law."],
  ["12. Contact", "Questions about these Terms & Conditions can be sent to support@horizonjobs.online."]
];

export default function TermsPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-8 text-white">
        <div className="horizon-container">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#e4ad2f]">LEGAL</p>
          <h1 className="mt-2 text-[24px] font-bold">Terms &amp; Conditions</h1>
          <p className="mt-2 text-[12px] text-white/70">Effective Date: [DATE]</p>
        </div>
      </section>
      <section className="horizon-container py-8">
        <article className="horizon-card p-6 md:p-8">
          <p className="mb-7 text-[12px] leading-6 text-slate-700">
            Welcome to Horizon Jobs. By accessing or using Horizon Jobs, you agree to these Terms &amp; Conditions. If you do not agree with these terms, please do not use the website.
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
