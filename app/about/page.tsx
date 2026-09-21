import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Globe2, Users, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About Horizon Jobs",
  description:
    "Learn about Horizon Jobs, a global employment platform connecting job seekers, employers, and career resources.",
};

const highlights = [
  {
    icon: BriefcaseBusiness,
    title: "Discover opportunities",
    text: "Explore published job opportunities across industries, locations, employment types, and work modes.",
  },
  {
    icon: Globe2,
    title: "Global employment discovery",
    text: "Horizon Jobs is designed to make employment discovery easier across countries and local job markets.",
  },
  {
    icon: Users,
    title: "For candidates and employers",
    text: "Job seekers can discover opportunities while employers and recruiters can use dedicated tools to manage recruitment activities.",
  },
  {
    icon: ShieldCheck,
    title: "Clear information",
    text: "We aim to present job information clearly and provide links to the relevant application destination.",
  },
];

export default function AboutPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-16 text-white">
        <div className="horizon-container">
          <p className="horizon-eyebrow text-[#e4ad2f]">ABOUT HORIZON JOBS</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Connecting people with their next opportunity.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 md:text-lg">
            Horizon Jobs is a global employment discovery platform built to
            help job seekers find opportunities and help employers connect
            with potential candidates.
          </p>
        </div>
      </section>

      <section className="horizon-container py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <article className="horizon-card p-7 md:p-10">
            <p className="text-xs font-black uppercase tracking-[.16em] text-[#b88410]">
              Our purpose
            </p>

            <h2 className="mt-3 text-2xl font-black text-[#071a35] md:text-3xl">
              Making job discovery simpler and more useful
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-8 text-slate-700 md:text-base">
              <p>
                Searching for work can involve many different websites,
                employers, locations, and job categories. Horizon Jobs brings
                employment discovery into one focused platform so visitors can
                search, filter, compare and explore available opportunities
                more easily.
              </p>

              <p>
                Our platform includes job discovery tools for candidates,
                recruitment tools for employers, saved jobs, job alerts,
                application-related features and career resources.
              </p>

              <p>
                Job listings may come from external employment sources or be
                submitted through the Horizon Jobs platform. Where a listing
                uses an external application destination, candidates may be
                directed to the relevant external website to continue the
                application process.
              </p>
            </div>
          </article>

          <aside className="horizon-card p-7 md:p-8">
            <p className="text-xs font-black uppercase tracking-[.16em] text-[#b88410]">
              Platform
            </p>

            <h2 className="mt-3 text-2xl font-black text-[#071a35]">
              Horizon Jobs
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Search opportunities by job category, country, location and
                work mode.
              </p>
              <p>
                Create an account to access candidate features and manage your
                employment activity.
              </p>
              <p>
                Employers and recruiters can access dedicated recruitment
                functionality.
              </p>
            </div>

            <Link
              href="/jobs"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#e4ad2f] px-5 py-3 text-sm font-black text-[#071a35] transition hover:translate-y-[-1px]"
            >
              Explore jobs
              <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="horizon-container py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[.16em] text-[#b88410]">
              What we provide
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#071a35]">
              Built around practical employment discovery
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff3c7] text-[#b88410]">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-5 text-lg font-black text-[#071a35]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="horizon-container py-12 md:py-16">
        <div className="horizon-card bg-[#071a35] p-7 text-white md:p-10">
          <h2 className="text-2xl font-black md:text-3xl">
            Looking for your next opportunity?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
            Browse current opportunities and use the available filters to
            narrow your search.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-[#e4ad2f] px-5 py-3 text-sm font-black text-[#071a35]"
            >
              Find jobs
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white"
            >
              Contact Horizon Jobs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
