import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Horizon Jobs",
  description: "Privacy Policy for Horizon Jobs.",
};

const sections = [
  ["Information We May Collect", "Depending on how you use Horizon Jobs, we may collect information such as account information, professional information, job activity, recruiter information, and automatically collected technical information."],
  ["Account Information", "When you create an account, we may collect your name, email address, login information, profile information, and account preferences."],
  ["Professional Information", "If you choose to create a professional profile, we may collect skills, experience, job preferences, preferred locations, preferred categories, employment preferences, and career interests. You decide what optional profile information you provide."],
  ["Job Activity", "We may process information related to your use of the platform, such as saved jobs, job-alert preferences, jobs viewed, search preferences, notification preferences, and other interactions with Horizon Jobs."],
  ["Recruiter Information", "Recruiters and employers may provide name, email, company name, company information, professional role, job-posting information, and recruitment preferences."],
  ["Automatically Collected Information", "When you use our website, certain technical information may be collected automatically, such as IP address, browser type, device type, operating system, pages visited, approximate usage information, referral information, and technical performance information. This information may be used to operate, maintain, secure, and improve the platform."],
  ["How We Use Information", "We may use information to create and maintain accounts, provide job-search functionality, personalize job discovery, provide job alerts, save user preferences, provide career resources, communicate with users, support recruiters and employers, improve website functionality, understand platform usage, detect security problems, prevent abuse, improve content and services, operate analytics and reporting, and comply with applicable legal requirements."],
  ["Job Sources and External Websites", "Horizon Jobs may provide information about jobs that originate from employers, partners, affiliate services, or external websites. When you follow an external application link, that external website may collect information under its own privacy policy and terms. We encourage users to review the privacy policy of the external website before submitting personal information."],
  ["Cookies and Similar Technologies", "Horizon Jobs may use cookies and similar technologies for essential website functionality, user preferences, authentication, security, analytics, performance measurement, and advertising. Third-party vendors, including Google, may use cookies to serve advertisements based on a user's prior visits to this website or other websites."],
  ["Analytics", "We may use analytics technologies to understand traffic, page usage, user interactions, performance, geographic trends at an appropriate level, and technical problems. Analytics information helps us improve the website and services."],
  ["Advertising", "Horizon Jobs may display advertising provided by third-party advertising partners, including Google AdSense, if and when enabled. Advertising partners may use cookies, web beacons, IP addresses, or similar technologies as permitted by their policies and applicable law."],
  ["Affiliate Links", "Some links on Horizon Jobs may be affiliate links. When you follow an affiliate link and complete an eligible action on an external website, Horizon Jobs may receive a commission at no additional cost to you."],
  ["How We Protect Information", "We use reasonable technical and organizational measures designed to protect information against unauthorized access, misuse, alteration, disclosure, or destruction. However, no internet-based service can guarantee absolute security."],
  ["Data Retention", "We retain information for as long as reasonably necessary for the purposes described in this policy, including account operation, legal requirements, security, dispute resolution, and legitimate business purposes. Retention periods may vary depending on the type of information."],
  ["Your Choices", "Depending on your location and applicable law, you may have rights concerning your personal information, including rights to access information, correct information, delete information, withdraw certain permissions, unsubscribe from communications, and manage certain cookie preferences. Requests can be sent to support@horizonjobs.online."],
  ["Children's Privacy", "Horizon Jobs is intended for a general audience and is not designed specifically for children. We do not knowingly use our services to create personalized advertising audiences based on information about children under the applicable age threshold."],
  ["Changes to This Policy", "We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised effective date."],
  ["Contact", "For privacy questions, contact support@horizonjobs.online."]
];

export default function PrivacyPolicyPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-8 text-white">
        <div className="horizon-container">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#e4ad2f]">LEGAL</p>
          <h1 className="mt-2 text-[24px] font-bold">Privacy Policy</h1>
          <p className="mt-2 text-[12px] text-white/70">Effective Date: [DATE]</p>
        </div>
      </section>
      <section className="horizon-container py-8">
        <article className="horizon-card p-6 md:p-8">
          <p className="mb-7 text-[12px] leading-6 text-slate-700">
            Horizon Jobs ("Horizon Jobs", "we", "us", or "our") respects your privacy and is committed to explaining how information may be collected, used, stored, and shared when you use our website and services.
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
