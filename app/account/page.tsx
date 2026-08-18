"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Bookmark,
  LogOut,
  User,
  Bell,
  Settings,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedJobsCount, setSavedJobsCount] = useState(0);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);
        const savedResponse = await fetch("/api/user/saved-jobs");
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          setSavedJobsCount(savedData.savedJobs?.length || 0);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
              <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center mx-auto">
                <User className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{user.name || "User"}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              <p className="text-xs text-slate-400 mt-2">Member since {new Date(user.created_at).toLocaleDateString()}</p>
              <button
                onClick={handleLogout}
                className="mt-4 w-full py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <Link href="/saved" className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-300 transition">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">Saved Jobs</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{savedJobsCount} job{savedJobsCount !== 1 ? "s" : ""} saved</p>
                </div>
                <span className="text-slate-400">→</span>
              </div>
            </Link>

            <Link href="/account/job-alerts" className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-300 transition">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">Job Alerts</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Manage your email notifications</p>
                </div>
                <span className="text-slate-400">→</span>
              </div>
            </Link>

            <Link href="/account/settings" className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-300 transition">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">Settings</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Update your profile and preferences</p>
                </div>
                <span className="text-slate-400">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}