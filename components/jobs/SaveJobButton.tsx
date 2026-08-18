"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";

interface Props {
  jobId: string;
}

export default function SaveJobButton({ jobId }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in and if job is saved
  useEffect(() => {
    async function checkStatus() {
      try {
        // Check if logged in
        const meResponse = await fetch("/api/auth/me", { cache: "no-store" });
        if (!meResponse.ok) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }
        setIsLoggedIn(true);

        // Check if job is saved
        const savedResponse = await fetch("/api/user/saved-jobs");
        if (savedResponse.ok) {
          const data = await savedResponse.json();
          const savedJobs = data.savedJobs || [];
          setSaved(savedJobs.some((job: any) => job.id === jobId));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [jobId]);

  async function handleClick() {
    if (!isLoggedIn) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    setLoading(true);

    try {
      if (saved) {
        // Unsave
        const response = await fetch(`/api/user/saved-jobs?jobId=${jobId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setSaved(false);
        }
      } else {
        // Save
        const response = await fetch("/api/user/saved-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
        if (response.ok) {
          setSaved(true);
        }
      }
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  // Show nothing while loading
  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-900"
      >
        <Bookmark className="h-4 w-4" />
        Loading...
      </button>
    );
  }

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
      >
        <Bookmark className="h-4 w-4" />
        Login to Save
      </button>
    );
  }

  // Logged in - show save/unsave button
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
        saved
          ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
          : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      }`}
    >
      <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
      {saved ? "Saved" : "Save Job"}
    </button>
  );
}