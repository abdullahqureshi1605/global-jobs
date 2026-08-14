import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-slate-900 text-white rounded-3xl p-8 mb-8">
          <p className="text-sm text-indigo-300 font-semibold uppercase tracking-wider">
            Private Administration
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
            Horizon Jobs Admin
          </h1>

          <p className="text-slate-300 text-sm mt-3">
            Welcome, {session.user.name || session.user.email}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <Link
            href="/admin/jobs"
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-500/50 hover:shadow-lg transition-all"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Manage Jobs
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Add, edit, publish, unpublish, and archive job listings.
            </p>
          </Link>

          <Link
            href="/admin/resources"
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-500/50 hover:shadow-lg transition-all"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Career Resources
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Create and manage career articles and guides.
            </p>
          </Link>
            <Link
  href="/admin/reports"
  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-500/50 hover:shadow-lg transition-all"
>
  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
    Reported Jobs
  </h2>

  <p className="text-sm text-slate-500 mt-2">
    Review job listings reported by visitors.
  </p>

  <span className="inline-block mt-4 text-sm font-semibold text-indigo-600">
    Open Reports →
  </span>
</Link>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Reports
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Report management will be connected after the core content
              management system is ready.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}