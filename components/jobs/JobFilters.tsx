"use client";

import { Filter, SlidersHorizontal } from "lucide-react";

interface JobFiltersProps {
  category: string;
  workplace: string;
  employment: string;
  experience: string;
  onCategoryChange: (value: string) => void;
  onWorkplaceChange: (value: string) => void;
  onEmploymentChange: (value: string) => void;
  onExperienceChange: (value: string) => void;
  onReset: () => void;
  categories: string[];
}

export default function JobFilters({
  category,
  workplace,
  employment,
  experience,
  onCategoryChange,
  onWorkplaceChange,
  onEmploymentChange,
  onExperienceChange,
  onReset,
  categories,
}: JobFiltersProps) {
  return (
    <aside className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          Filter Results
        </h2>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-indigo-600 hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label
          htmlFor="job-category"
          className="text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          Category
        </label>

        <select
          id="job-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Workplace */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Workplace Type
        </span>

        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {["All", "Remote", "Hybrid", "On-site"].map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="workplace"
                value={item}
                checked={workplace === item}
                onChange={() => onWorkplaceChange(item)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Employment */}
      <div className="space-y-2">
        <label
          htmlFor="employment-type"
          className="text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          Employment Type
        </label>

        <select
          id="employment-type"
          value={employment}
          onChange={(e) => onEmploymentChange(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Employment Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Temporary">Temporary</option>
          <option value="Internship">Internship</option>
          <option value="Freelance">Freelance</option>
        </select>
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <label
          htmlFor="experience-level"
          className="text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          Experience Level
        </label>

        <select
          id="experience-level"
          value={experience}
          onChange={(e) => onExperienceChange(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Experience Levels</option>
          <option value="Entry Level">Entry Level</option>
          <option value="Mid Level">Mid Level</option>
          <option value="Senior">Senior</option>
          <option value="Executive">Executive</option>
        </select>
      </div>

      <div className="pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          Filters will control the job results once connected to the Jobs page.
        </div>
      </div>
    </aside>
  );
}