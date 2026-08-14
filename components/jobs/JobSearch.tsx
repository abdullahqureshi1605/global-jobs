"use client";

import { MapPin, Search } from "lucide-react";

interface JobSearchProps {
  keyword: string;
  location: string;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch?: () => void;
}

export default function JobSearch({
  keyword,
  location,
  onKeywordChange,
  onLocationChange,
  onSearch,
}: JobSearchProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3"
    >
      {/* Keyword */}
      <div className="md:col-span-5 relative flex items-center">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />

        <input
          type="text"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Job title, keyword, or company"
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-0 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* Location */}
      <div className="md:col-span-4 relative flex items-center">
        <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />

        <input
          type="text"
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          placeholder="Country, city, or remote"
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-0 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* Search button */}
      <div className="md:col-span-3">
        <button
          type="submit"
          className="w-full h-full min-h-[48px] px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          Search Jobs
        </button>
      </div>
    </form>
  );
}