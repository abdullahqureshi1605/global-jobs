"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bookmark,
  Building,
  ExternalLink,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Job } from "@/types/job";
import AdSlot from "@/components/ads/AdSlot";

interface JobDetailsProps {
  job: Job;
  isBookmarked: boolean;
  onBookmark: (id: string) => void;
  onReport: (job: Job) => void;
}

export default function JobDetails({
  job,
  isBookmarked,
  onBookmark,
  onReport,
}: JobDetailsProps) {
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Breadcrumb area will be handled by the route page */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={`${job.company} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      {job.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {job.company}
                      </span>

                      <span>•</span>

                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.city}, {job.country}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onBookmark(job.id)}
                  aria-label={
                    isBookmarked ? "Remove saved job" : "Save job"
                  }
                  className={`p-3 rounded-2xl border transition-colors self-start ${
                    isBookmarked
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <Bookmark className="w-5 h-5 fill-current" />
                </button>
              </div>

              {/* Job metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block mb-1">
                    Employment
                  </span>
                  <strong className="text-slate-900 dark:text-white">
                    {job.employmentType}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block mb-1">
                    Workplace
                  </span>
                  <strong className="text-slate-900 dark:text-white">
                    {job.workplaceType}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block mb-1">
                    Experience
                  </span>
                  <strong className="text-slate-900 dark:text-white">
                    {job.experienceLevel}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400 block mb-1">
                    Compensation
                  </span>
                  <strong className="text-slate-900 dark:text-white">
                    {job.salaryMin && job.salaryMax
                      ? `${job.salaryCurrency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                      : "Not specified"}
                  </strong>
                </div>
              </div>

              {/* Application actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(true)}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  Apply on Source Platform
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onReport(job)}
                  className="py-3.5 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Report Job
                </button>
              </div>
            </section>

            {/* Advertisement */}
           <AdSlot slotId="something" />

            {/* Description */}
            <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  Job Description
                </h2>
                <p>{job.description}</p>
              </div>

              {job.responsibilities.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    Responsibilities
                  </h2>

                  <ul className="list-disc pl-5 space-y-2">
                    {job.responsibilities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requirements.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    Requirements
                  </h2>

                  <ul className="list-disc pl-5 space-y-2">
                    {job.requirements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.benefits.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    Benefits
                  </h2>

                  <ul className="list-disc pl-5 space-y-2">
                    {job.benefits.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                Listing Information
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Source</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right">
                    {job.sourceName}
                  </span>
                </div>

                <div className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Posted</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {job.datePosted}
                  </span>
                </div>

                <div className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Last Verified</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {job.lastVerified}
                  </span>
                </div>

                <div className="flex justify-between gap-4 py-2">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-emerald-600">
                    {job.verificationStatus}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Application takes place on the original source. Verify the
                position details before applying.
              </p>
            </section>

            <AdSlot slotId="something" />
          </aside>
        </div>
      </div>

      {/* Application confirmation modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white">
                External Application
              </h2>

              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              You are leaving Horizon Jobs and going to the original source
              for this listing.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 break-all">
              {job.applyUrl}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold"
              >
                Cancel
              </button>

              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold text-center"
                onClick={() => setApplyModalOpen(false)}
              >
                Continue
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}