import Link from "next/link";
import { getServerSession } from "next-auth";

import {
  BriefcaseBusiness,
  FileText,
  BarChart3,
  Flag,
  Users,
} from "lucide-react";

import {
  redirect,
} from "next/navigation";

import {
  authOptions,
} from "@/lib/auth";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export const dynamic =
  "force-dynamic";

const cards = [
  {
    title: "Manage Jobs",
    description:
      "Add, edit, publish, unpublish, feature, or archive job listings.",
    href: "/admin/jobs",
    icon: BriefcaseBusiness,
  },
  {
    title: "Career Resources",
    description:
      "Create and manage career articles and guides.",
    href: "/admin/resources",
    icon: FileText,
  },
  {
    title: "Analytics",
    description:
      "Review platform traffic, visitors, page analytics, and live activity.",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Reported Jobs",
    description:
      "Review job listings reported by visitors.",
    href: "/admin/reports",
    icon: Flag,
  },
  {
    title: "Users",
    description:
      "User and recruiter management will be available here.",
    href: "/admin/users",
    icon: Users,
  },
];

export default async function AdminDashboardPage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user) {
    redirect("/admin/login");
  }

  const email =
    session.user.email ||
    "Admin account";

  return (
    <main className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-300">
                Horizon Jobs Administration
              </p>

              <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Admin Dashboard
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Manage jobs, career resources, visitor reports, and platform analytics from one place.
              </p>
            </div>

            <div className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-900/80 p-6 lg:mr-8">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Signed in as
              </p>

              <p className="mt-2 text-lg font-bold text-white">
                Horizon Jobs Admin
              </p>

              <p className="mt-1 break-all text-sm text-slate-400">
                {email}
              </p>

              <AdminLogoutButton />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
            Administration
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(
              ({
                title,
                description,
                href,
                icon: Icon,
              }) => (
                <Link
                  key={href}
                  href={href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-950 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {description}
                  </p>

                  <span className="mt-5 inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    Open →
                  </span>
                </Link>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}