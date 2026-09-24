"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe2,
  Home,
  LogOut,
  Menu,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

export default function RecruiterShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const displayName =
    session?.user?.name ||
    session?.user?.email ||
    "Recruiter";

  const initial =
    displayName
      .charAt(0)
      .toUpperCase();

  const nav = [
    {
      href: "/recruiter/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/recruiter/jobs",
      label: "Manage Jobs",
      icon: BriefcaseBusiness,
    },
    {
      href: "/recruiter/post-job",
      label: "Post a Job",
      icon: FileText,
    },
    {
      href: "/recruiter/candidates",
      label: "Candidates",
      icon: Users,
    },
    {
      href: "/recruiter/profile",
      label: "Company Profile",
      icon: Building2,
    },
  ];

  const isActive = (href: string) =>
    pathname === href ||
    (
      href !== "/recruiter/dashboard" &&
      pathname.startsWith(href)
    );

  const closeMobile = () =>
    setMobileOpen(false);

  const content = (
    <>
      <div className="flex h-[82px] shrink-0 items-center border-b border-white/10 px-4">

        {collapsed ? (
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4ad2f] text-2xl font-black text-[#071a35]">
            H
          </div>
        ) : (
          <div className="flex w-full items-center justify-between gap-3">

            <Link
              href="/recruiter/dashboard"
              onClick={closeMobile}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e4ad2f] text-2xl font-black text-[#071a35]">
                H
              </div>

              <div className="min-w-0">
                <div className="text-xl font-black">
                  Horizon Jobs
                </div>

                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Recruiter Workspace
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() =>
                setCollapsed(true)
              }
              title="Close sidebar"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white lg:flex"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={closeMobile}
              className="lg:hidden"
            >
              <X size={20} />
            </button>

          </div>
        )}

      </div>


      {collapsed && (
        <button
          type="button"
          onClick={() =>
            setCollapsed(false)
          }
          className="mx-auto mt-5 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/70"
          title="Open sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}


      <div className="px-3 pt-8">

        {!collapsed && (
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
            Recruiter Portal
          </p>
        )}

        <nav className="mt-4 space-y-1.5">

          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
                className={[
                  "flex items-center rounded-xl font-bold transition",
                  collapsed
                    ? "justify-center px-3 py-3.5"
                    : "gap-4 px-4 py-3.5",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                <Icon
                  size={19}
                  className={
                    active
                      ? "text-[#f2c85d]"
                      : "text-white/45"
                  }
                />

                {!collapsed && (
                  <span>{item.label}</span>
                )}
              </Link>
            );
          })}

        </nav>
      </div>


      {!collapsed && (
        <div className="mt-auto p-4">

          <Link
            href="/"
            onClick={closeMobile}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Globe2 size={17} />
            Back to Original Website
          </Link>

          <Link
            href="/recruiter/profile"
            onClick={closeMobile}
            className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/60 hover:bg-white/5 hover:text-white"
          >
            <UserRound size={17} />
            Company Settings
          </Link>

          <div className="mt-4 border-t border-white/10 pt-4">

            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e4ad2f] font-black text-[#071a35]">
                {initial}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {displayName}
                </p>

                <p className="text-[11px] text-white/40">
                  Recruiter
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  signOut({
                    callbackUrl: "/",
                  })
                }
                className="text-white/40 hover:text-white"
              >
                <LogOut size={17} />
              </button>

            </div>

          </div>
        </div>
      )}

    </>
  );

  return (
    <div className="account-portal min-h-screen bg-[#f5f7fa]">

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 hidden flex-col overflow-hidden bg-[#071a35] text-white transition-all duration-200 lg:flex",
          collapsed
            ? "w-[76px]"
            : "w-[278px]",
        ].join(" ")}
      >
        {content}
      </aside>


      {mobileOpen && (
        <>
          <button
            type="button"
            onClick={closeMobile}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />

          <aside className="fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col overflow-hidden bg-[#071a35] text-white lg:hidden">
            {content}
          </aside>
        </>
      )}


      <div
        className={[
          "min-h-screen transition-all duration-200",
          collapsed
            ? "lg:pl-[76px]"
            : "lg:pl-[278px]",
        ].join(" ")}
      >

        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setMobileOpen(true)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 lg:hidden"
            >
              <Menu size={18} />
            </button>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b88410]">
                Recruiter Workspace
              </p>

              <h1 className="text-xl font-black text-[#071a35]">
                Horizon Jobs
              </h1>
            </div>
          </div>


          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[#071a35]">
                {displayName}
              </p>

              <p className="text-[11px] text-slate-400">
                Recruiter
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4ad2f] font-black text-[#071a35]">
              {initial}
            </div>

          </div>

        </header>


        <main className="min-h-[calc(100vh-70px)] w-full overflow-x-hidden">
          {children}
        </main>

      </div>
    </div>
  );
}

