import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Horizon Jobs",
  description: "Learn about Horizon Jobs and our global employment platform.",
};

export default function AboutPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="bg-[#071a35] py-8 text-white md:py-10">
        <div className="horizon-container">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#e4ad2f]">
            ABOUT HORIZON JOBS
          </p>
          <h1 className="mt-2 text-[24px] font-bold leading-tight">
            About Horizon Jobs
          </h1>
          <p className="mt-3 max-w-3xl text-[12px] leading-6 text-white/75">
            Welcome to Horizon Jobs
          </p>
        </div>
      </section>

      <section className="horizon-container py-8 md:py-10">
        <article className="horizon-card p-6 md:p-8">
          <div className="space-y-7 text-[12px] leading-6 text-slate-700">
            <div>
              <h2 className="text-[16px] font-bold text-[#071a35]">
                Welcome to Horizon Jobs
              </h2>
              <p className="mt-2">
                Horizon Jobs is a global employment platform designed to make
                job discovery simpler, clearer, and more useful.
              </p>
              <p className="mt-2">
                We bring together employment opportunities, career resources,
                job alerts, and practical tools in one place so that people can
                spend less time searching across different websites and more
                time finding opportunities that are relevant to their career
                goals.
              </p>
            </div>

            <div>
              <h2 className="text-[16px] font-bold text-[#071a35]">
                Our Mission
              </h2>
              <p className="mt-2">
                Our mission is to help people discover employment opportunities
                around the world through a clear, useful, and trustworthy
                job-search experience.
              </p>
              <p className="mt-2">
                We aim to make it easier for job seekers to explore
                opportunities by location, category, skills, and employment
                preferences.
              </p>
            </div>

            <div>
              <h2 className="text-[16px] font-bold text-[#071a35]">
                What We Provide
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Global job discovery</li>
                <li>Country and city-based job searches</li>
                <li>Job-category exploration</li>
                <li>Remote job opportunities</li>
                <li>Career resources and guides</li>
                <li>Job alerts</li>
                <li>Saved job functionality</li>
                <li>Personalized employment features</li>
                <li>Recruiter and employer opportunities</li>
              </ul>
              <p className="mt-3">
                Some job opportunities may originate from external websites,
                employers, partners, or affiliate sources. Where an
                application is completed outside Horizon Jobs, we clearly
                indicate that the user is being directed to an external
                destination.
              </p>
            </div>

            <div>
              <h2 className="text-[16px] font-bold text-[#071a35]">
                For Job Seekers
              </h2>
              <p className="mt-2">
                Our goal is to provide more than a list of links.
              </p>
              <p className="mt-2">
                Horizon Jobs is designed to help users discover relevant
                opportunities, save jobs they are interested in, create
                alerts, explore career resources, and build a more organized
                job-search experience.
              </p>
            </div>

            <div>
              <h2 className="text-[16px] font-bold text-[#071a35]">
                For Recruiters
              </h2>
              <p className="mt-2">
                Horizon Jobs is also being developed as a platform for
                recruiters and employers to present opportunities to
                candidates, manage jobs, build their company presence, and
                eventually use additional recruitment and business tools.
              </p>
            </div>

            <div>
              <h2 className="text-[16px] font-bold text-[#071a35]">
                Our Approach
              </h2>
              <p className="mt-2">
                We believe employment platforms should be:
              </p>
              <p className="mt-2 font-bold text-[#071a35]">
                Useful. Clear. Transparent. Practical.
              </p>
              <p className="mt-2">
                We do not guarantee employment, interviews, salaries, or hiring
                outcomes.
              </p>
              <p className="mt-2">
                Job availability, employer decisions, compensation,
                requirements, application procedures, and application status
                are determined by the relevant employer or original job source.
              </p>
            </div>

            <div>
              <h2 className="text-[16px] font-bold text-[#071a35]">
                Our Future
              </h2>
              <p className="mt-2">
                Horizon Jobs is being developed into a broader employment
                technology platform connecting candidates, recruiters, job
                information, career knowledge, analytics, and intelligent
                tools.
              </p>
              <p className="mt-2">
                Thank you for using Horizon Jobs.
              </p>
            </div>

            <Link
              href="/jobs"
              className="inline-flex rounded-md bg-[#3E7BFA] px-4 py-2 text-[12px] font-bold text-white"
            >
              Explore Jobs
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
