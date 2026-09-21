"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: "\u2302" },
    ],
  },
  {
    label: "Jobs",
    items: [
      { href: "/admin/jobs", label: "Job Review", icon: "\u2713" },
      { href: "/admin/processing", label: "Processing", icon: "\u21BB" },
    ],
  },
  {
    label: "Sources",
    items: [
      { href: "/admin/adzuna", label: "Adzuna Control", icon: "\u25C9" },
    ],
  },
  {
    label: "Content",
    items: [
      {
        href: "/admin/resources",
        label: "Career Resources",
        icon: "\u2630",
      },
    ],
  },
  {
    label: "AI & Quality",
    items: [
      { href: "/admin/ai-agents", label: "AI Agents", icon: "\u2726" },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/admin/adsense", label: "AdSense", icon: "\u0024" },
      { href: "/admin/seo", label: "SEO", icon: "\u2315" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/users", label: "Users", icon: "\u263A" },
      { href: "/admin/recruiters", label: "Recruiters", icon: "\u260E" },
      { href: "/admin/companies", label: "Companies", icon: "\u25A6" },
      { href: "/admin/maintenance", label: "Maintenance", icon: "\u2699" },
    ],
  },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">

        {/* Mobile backdrop */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobile}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex h-screen flex-col
            border-r border-white/10 bg-slate-950
            transition-all duration-200
            ${collapsed ? "w-[84px]" : "w-[288px]"}
            ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Brand */}
          <div
            className={`
              flex h-[106px] shrink-0 items-center border-b border-white/10
              ${collapsed ? "justify-center px-3" : "justify-between px-6"}
            `}
          >
            {!collapsed && (
              <Link
                href="/admin"
                onClick={closeMobile}
                className="min-w-0"
              >
                <div className="text-[24px] font-black tracking-tight">
                  Horizon Jobs
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  Admin Control Center
                </div>
              </Link>
            )}

            {collapsed && (
              <Link
                href="/admin"
                onClick={closeMobile}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-lg font-black"
              >
                H
              </Link>
            )}

            {/* Desktop collapse */}
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`
                hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg
                border border-white/10 text-slate-400 transition
                hover:bg-white/10 hover:text-white lg:flex
                ${collapsed ? "absolute -right-4 top-8 bg-slate-950" : ""}
              `}
            >
              {collapsed ? "Ã¢â‚¬Âº" : "Ã¢â‚¬Â¹"}
            </button>

            {/* Mobile close */}
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close sidebar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              Ãƒâ€”
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {navigation.map((section) => (
              <div key={section.label} className="mb-6">
                {!collapsed && (
                  <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    {section.label}
                  </div>
                )}

                {collapsed && (
                  <div className="mb-2 h-px bg-white/5" />
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobile}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={`
                          group flex w-full items-center rounded-xl
                          transition-all duration-150
                          ${collapsed
                            ? "justify-center px-2 py-3"
                            : "gap-3 px-3 py-3"
                          }
                          ${
                            active
                              ? "border border-cyan-400/30 bg-cyan-400/10 text-white"
                              : "border border-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
                          }
                        `}
                      >
                        <span
                          className={`
                            flex h-9 w-9 shrink-0 items-center justify-center
                            rounded-lg text-sm font-black
                            ${
                              active
                                ? "bg-cyan-400 text-slate-950"
                                : "bg-white/[0.05] text-slate-400 group-hover:text-white"
                            }
                          `}
                        >
                          {item.icon}
                        </span>

                        {!collapsed && (
                          <span
                            className={`
                              block min-w-0 flex-1 truncate text-left text-sm font-bold
                              ${
                                active
                                  ? "text-white"
                                  : "text-slate-300"
                              }
                            `}
                          >
                            {item.label}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="shrink-0 border-t border-white/10 p-3">
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className={`
                  flex w-full items-center rounded-xl border border-white/10
                  text-slate-300 transition hover:bg-white/[0.06] hover:text-white
                  ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-3"}
                `}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-black">
                  Ã¢â€ Âª
                </span>

                {!collapsed && (
                  <span className="text-sm font-bold">
                    Sign out
                  </span>
                )}
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <main
          className={`
            min-w-0 flex-1 transition-[margin] duration-200
            ${collapsed ? "lg:ml-[84px]" : "lg:ml-[288px]"}
          `}
        >
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
            <div className="flex h-[106px] items-center justify-between gap-4 px-5 lg:px-8">

              <div className="flex min-w-0 items-center gap-3">
                {/* Mobile menu */}
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
                >
                  Ã¢ËœÂ°
                </button>

                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    Horizon Jobs
                  </div>
                  <div className="truncate text-lg font-black">
                    Administration
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300 sm:block">
                  System Online
                </div>

                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-300">
                  Admin
                </div>
              </div>
            </div>
          </header>

          <div className="p-5 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
