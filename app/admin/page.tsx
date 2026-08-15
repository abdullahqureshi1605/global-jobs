import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export const dynamic =
  "force-dynamic";

export default async function AdminDashboardPage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-950/50">
            🔐
          </div>

          <h1 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white">
            Admin Access Required
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Please sign in with your Horizon Jobs administrator account
            to access this dashboard.
          </p>

          <Link
            href="/admin/login"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Go to Admin Login
          </Link>
        </div>
      </main>
    );
  }

  const adminName =
    session.user.name ||
    "Horizon Jobs Admin";

  const adminEmail =
    session.user.email ||
    "";

  const cards = [
    {
      title: "Manage Jobs",
      description:
        "Add, edit, publish, unpublish, and archive job listings.",
      href: "/admin/jobs",
      action: "Open Jobs",
      icon: "💼",
    },
    {
      title: "Career Resources",
      description:
        "Create, edit, publish, feature, and manage career articles.",
      href: "/admin/resources",
      action: "Open Resources",
      icon: "📚",
    },
    {
      title: "Reported Jobs",
      description:
        "Review job listings reported by website visitors.",
      href: "/admin/reports",
      action: "Open Reports",
      icon: "🚩",
    },
    {
      title: "Analytics Center",
      description:
        "Open traffic analytics, performance monitoring, and Horizon Jobs content metrics.",
      href: "/admin/analytics",
      action: "Open Analytics",
      icon: "📊",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        <section className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-sm">
          <div className="p-7 sm:p-9 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
                  Horizon Jobs Administration
                </p>

                <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Admin Dashboard
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Manage jobs, career resources, visitor reports, and
                  platform analytics from one place.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Signed in as
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {adminName}
                </p>

                {adminEmail && (
                  <p className="mt-1 text-xs text-slate-400">
                    {adminEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Administration
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select an area to manage the Horizon Jobs platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cards.map(
              (card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-950/50">
                    <span aria-hidden="true">
                      {card.icon}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                    {card.title}
                  </h3>

                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {card.description}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-all group-hover:gap-3 dark:text-indigo-400">
                    {card.action}
                    <span aria-hidden="true">
                      →
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Quick Navigation
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Return to the public website or open the main management area.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                View Website
              </Link>

              <Link
                href="/admin/analytics"
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Analytics
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}