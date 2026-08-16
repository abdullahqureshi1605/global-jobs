"use client";

import {
  Bookmark,
} from "lucide-react";

import {
  useState,
} from "react";

interface Props {
  jobId: string;
}

export default function SaveJobButton({
  jobId,
}: Props) {
  const [
    saved,
    setSaved,
  ] = useState(false);

  function handleSave() {
    setSaved(
      (value) =>
        !value
    );
  }

  return (
    <button
      type="button"
      onClick={
        handleSave
      }
      aria-label={
        saved
          ? "Remove saved job"
          : "Save job"
      }
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
        saved
          ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
          : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      }`}
    >
      <Bookmark
        className="h-4 w-4"
        fill={
          saved
            ? "currentColor"
            : "none"
        }
      />

      {saved
        ? "Saved"
        : "Save Job"}
    </button>
  );
}