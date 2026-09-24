"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe2,
  Home,
  LogOut,
  Menu,
  Settings,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

export default function CandidateShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName =
    session?.user?.name ||
    session?.user?.email ||
    "Candidate";

  const initial =
    displayName.charAt(0).toUpperCase();

  const nav = [
    {
      href: "/account/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/account/applications",
      label: "My Applications",
      icon: FileText,
    },
    {
      href: "/account/saved-jobs",
      label: "Saved Jobs",
      icon: Star,
    },
    {
      href: "/account/profile",
      label: "Profile & Resume",
      icon: UserRound,
    },
    {
      href: "/account/job-alerts",
      label: "Job Alerts",
      icon: Bell,
    },
    {
      href: "/account/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const isActive = (href: string) =>
    pathname === href ||
    (
      href !== "/account/dashboard" &&
      pathname.startsWith(href)
    );

  function closeMobile() {
    setMobileOpen(false);
  }

  const sidebar = (
    <>
      <div className="flex h-[68px] shrink-0 items-center border-b border-white/10 px-4">

        {collapsed ? (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-[2px] bg-[#e4ad2f] text-[18px] font-black text-[#071a35]">
            H
          </div>
        ) : (
          <div className="flex w-full items-center justify-between gap-3">
            <Link
              href="/account/dashboard"
              className="flex min-w-0 items-center gap-3"
              onClick={closeMobile}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-[#e4ad2f] text-[18px] font-black text-[#071a35]">
                H
              </div>

              <div className="min-w-0">
                <div className="text-[18px] font-black">
                  Horizon Jobs
                </div>

                <div className="hidden">
                  Global Opportunities
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-[2px] text-white/50 hover:bg-white/10 hover:text-white lg:flex"
              title="Close sidebar"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={closeMobile}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-5 flex h-9 w-9 items-center justify-center rounded-[2px] bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          title="Open sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div className="px-3 pt-6">
        {!collapsed && (
          <p className="px-3 text-[9px] font-black uppercase tracking-[0.20em] text-white/35">
            Candidate Portal
          </p>
        )}

        <nav className="mt-3 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                title={collapsed ? item.label : undefined}
                className={[
                  "flex items-center rounded-[2px] text-[14px] font-bold transition",
                  collapsed
                    ? "justify-center px-3 py-3.5"
                    : "gap-3 px-3 py-2.5",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className={
                    active
                      ? "shrink-0 text-[#f2c85d]"
                      : "shrink-0 text-white/45"
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
            className="flex items-center gap-3 rounded-[2px] border border-white/10 bg-white/5 px-4 py-3 text-[13px] font-bold text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Globe2 size={17} />
            Back to Original Website
          </Link>

          <div className="mt-4 border-t border-white/10 pt-4">

            <div className="flex items-center gap-3 rounded-[2px] bg-white/5 p-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e4ad2f] font-black text-[#071a35]">
                {initial}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold">
                  {displayName}
                </p>

                <p className="text-[11px] text-white/40">
                  Candidate
                </p>
              </div>

              <button
                type="button"
                title="Sign out"
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
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
          collapsed ? "w-[76px]" : "w-[250px]",
        ].join(" ")}
      >
        {sidebar}
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobile}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />

          <aside className="fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col overflow-hidden bg-[#071a35] text-white lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      <div
        className={[
          "min-h-screen transition-all duration-200",
          collapsed
            ? "lg:pl-[76px]"
            : "lg:pl-[250px]",
        ].join(" ")}
      >

        <header className="sticky top-0 z-30 flex h-[62px] items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-[2px] border border-slate-200 text-slate-600 lg:hidden"
            >
              <Menu size={18} />
            </button>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b88410]">
                Candidate Portal
              </p>

              <h1 className="text-[18px] font-black text-[#071a35]">
                {pathname === "/account/dashboard"
                  ? "Dashboard"
                  : pathname.includes("applications")
                  ? "My Applications"
                  : pathname.includes("saved-jobs")
                  ? "Saved Jobs"
                  : pathname.includes("profile")
                  ? "Profile & Resume"
                  : pathname.includes("job-alerts")
                  ? "Job Alerts"
                  : "Settings"}
              </h1>
            </div>
          </div>

          <Link
            href="/account/dashboard"
            className="flex items-center gap-3"
          >
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-bold text-[#071a35]">
                {displayName}
              </p>

              <p className="text-[11px] text-slate-400">
                Candidate
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e4ad2f] font-black text-[#071a35]">
              {initial}
            </div>
          </Link>

        </header>

        <main className="min-h-[calc(100vh-62px)] w-full overflow-x-hidden">
          {children}
        </main>

      </div>
    </div>
  );
}



