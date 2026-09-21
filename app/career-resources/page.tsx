import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Resources | Horizon Jobs",
  description:
    "Practical career resources for CV writing, job applications, interviews, and safer job searching.",
};

const resources = [
  {
    title: "Build a Strong CV",
    text: "Learn how to present your experience, skills, education, and achievements clearly for employers.",
  },
  {
    title: "Improve Your Job Search",
    text: "Use job categories, countries, locations, saved jobs, and job alerts to organize your search.",
  },
  {
    title: "Prepare for Interviews",
    text: "Review your experience, understand the role, prepare examples, and practice clear answers.",
  },
  {
    title: "Apply Carefully",
    text: "Read job descriptions and application instructions carefully before submitting your information.",
  },
  {
    title: "Avoid Job Scams",
    text: "Be cautious of requests for upfront payments, sensitive financial information, or suspicious application links.",
  },
  {
    title: "Keep Your Profile Updated",
    text: "Maintain accurate contact information, skills, experience, and professional details.",
  },
];

export default function CareerResourcesPage() {
  return (
    <main className="horizon-page">
      <div className="horizon-container py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <p className="horizon-eyebrow">Horizon Jobs</p>
          <h1 className="mt-2 text-3xl font-black text-[#07152d] sm:text-5xl">
            Career Resources
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Practical guidance to help you prepare for opportunities, improve
            your applications, and search for jobs more safely.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {resources.map((resource) => (
              <article
                key={resource.title}
                className="horizon-card p-6 sm:p-7"
              >
                <h2 className="text-xl font-black text-[#07152d]">
                  {resource.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {resource.text}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/jobs" className="horizon-button">
              Browse Jobs
            </Link>
            <Link
              href="/job-alerts"
              className="horizon-button horizon-button-outline"
            >
              Create Job Alert
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}