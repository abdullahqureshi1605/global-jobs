import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Horizon Jobs",
  description:
    "Contact Horizon Jobs for general questions, job listing issues, recruiter inquiries, partnerships, and privacy requests.",
};

export default function ContactPage() {
  return (
    <main className="horizon-page bg-slate-50">
      <section className="horizon-container py-8 md:py-10">
        <div className="grid gap-7 lg:grid-cols-[1fr_.9fr]">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wide text-[#d9a62e]">
              CONTACT US
            </p>

            <h1 className="mt-2 text-[24px] font-bold leading-tight text-[#07152d]">
              Contact Horizon Jobs
            </h1>

            <p className="mt-3 max-w-lg text-[12px] leading-6 text-gray-500">
              Have a question, found an issue, or want to contact Horizon Jobs?
              We would like to hear from you.
            </p>

            <div className="mt-6 space-y-5 text-[12px] leading-6">
              <div>
                <h2 className="text-[16px] font-bold text-[#07152d]">
                  General Questions
                </h2>
                <p className="mt-1 text-gray-500">
                  For general questions about Horizon Jobs:
                </p>
                <p className="mt-1 font-semibold text-[#07152d]">
                  contact@horizonjobs.online
                </p>
              </div>

              <div>
                <h2 className="text-[16px] font-bold text-[#07152d]">
                  Job Listing Issues
                </h2>
                <p className="mt-1 text-gray-500">
                  If you believe that a job listing contains incorrect
                  information, is no longer available, or violates our
                  platform requirements, please contact us with:
                </p>
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-gray-500">
                  <li>Job title</li>
                  <li>Company name</li>
                  <li>Job URL</li>
                  <li>Description of the issue</li>
                </ul>
                <p className="mt-2 text-gray-500">
                  We will review the information and take appropriate action
                  where necessary.
                </p>
                <p className="mt-1 font-semibold text-[#07152d]">
                  support@horizonjobs.online
                </p>
              </div>

              <div>
                <h2 className="text-[16px] font-bold text-[#07152d]">
                  Recruiters and Employers
                </h2>
                <p className="mt-1 text-gray-500">
                  Recruiters and employers interested in using Horizon Jobs can
                  contact:
                </p>
                <p className="mt-1 font-semibold text-[#07152d]">
                  partnership@horizonjobs.online
                </p>
                <p className="mt-1 text-gray-500">
                  Please include your name, company name, your role, and what
                  you would like to discuss.
                </p>
              </div>

              <div>
                <h2 className="text-[16px] font-bold text-[#07152d]">
                  Privacy Requests
                </h2>
                <p className="mt-1 text-gray-500">
                  For questions concerning personal information, privacy, or
                  account-related data:
                </p>
                <p className="mt-1 font-semibold text-[#07152d]">
                  support@horizonjobs.online
                </p>
              </div>

              <div>
                <h2 className="text-[16px] font-bold text-[#07152d]">
                  Important
                </h2>
                <p className="mt-1 text-gray-500">
                  Horizon Jobs cannot guarantee the response time, availability,
                  hiring decision, salary, interview, or application outcome of
                  any employer or external job source.
                </p>
                <p className="mt-1 text-gray-500">
                  For issues concerning an application submitted on an external
                  website, users should also contact the relevant employer or
                  original application provider.
                </p>
              </div>
            </div>
          </div>

          <form
            action="mailto:contact@horizonjobs.online"
            method="post"
            encType="text/plain"
            className="horizon-card h-fit p-6 md:p-7"
          >
            <h2 className="text-[16px] font-bold text-[#07152d]">
              Send Us a Message
            </h2>

            <p className="mt-1.5 text-[12px] leading-6 text-gray-500">
              Use the form below and select the reason for contacting Horizon
              Jobs.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-[#07152d]">
                  First Name
                </span>
                <input
                  name="First Name"
                  className="horizon-input w-full text-[12px]"
                  placeholder="First name"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[12px] font-semibold text-[#07152d]">
                  Last Name
                </span>
                <input
                  name="Last Name"
                  className="horizon-input w-full text-[12px]"
                  placeholder="Last name"
                  required
                />
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-[12px] font-semibold text-[#07152d]">
                Email
              </span>
              <input
                name="Email"
                type="email"
                className="horizon-input w-full text-[12px]"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-1 block text-[12px] font-semibold text-[#07152d]">
                Reason for Contact
              </span>
              <select
                name="Reason"
                className="horizon-input w-full text-[12px]"
                defaultValue="General Questions"
              >
                <option value="General Questions">
                  General Questions — contact@horizonjobs.online
                </option>
                <option value="Job Listing Issue">
                  Job Listing Issue — support@horizonjobs.online
                </option>
                <option value="Privacy Request">
                  Privacy Request — support@horizonjobs.online
                </option>
                <option value="Recruiter / Employer">
                  Recruiter / Employer — partnership@horizonjobs.online
                </option>
              </select>
            </label>

            <label className="mt-3 block">
              <span className="mb-1 block text-[12px] font-semibold text-[#07152d]">
                Message
              </span>
              <textarea
                name="Message"
                className="min-h-32 w-full rounded border border-[#cfd7e3] p-3 text-[12px] leading-5 outline-none focus:border-[#3E7BFA]"
                placeholder="Write your message..."
                required
              />
            </label>

            <button
              type="submit"
              className="horizon-button horizon-button-gold mt-3 w-full"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
