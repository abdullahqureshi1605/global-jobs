"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronDown,
  LogOut,
  Menu,
  X,
  UserRound,
  BriefcaseBusiness,
  LayoutDashboard,
  FileText,
  Star,
  Settings,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();

  const [open, setOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const accountRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(
          event.target as Node
        )
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", close);

    return () =>
      document.removeEventListener(
        "mousedown",
        close
      );
  }, []);

  const links = [
    ["Find Jobs", "/jobs"],
    ["For Recruiters", "/recruiters"],
    ["Career Resources", "/career-resources"],
    ["About", "/about"],
    ["Contact", "/contact"],
  ];

  const authenticated =
    status === "authenticated" &&
    !!session?.user;

  const role =
    session?.user?.role === "recruiter" ||
    session?.user?.role === "admin"
      ? "recruiter"
      : "candidate";

  const displayName =
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "Account";

  const firstLetter =
    displayName.trim().charAt(0).toUpperCase() ||
    "A";

  return (
    <header className="sticky top-0 z-[100] border-b border-white/10 bg-[#071a35] text-white shadow-lg">
      <div className="mx-auto flex min-h-[72px] max-w-[1500px] items-center justify-between gap-5 px-5 sm:px-7 lg:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          onClick={() => {
            setOpen(false);
            setAccountOpen(false);
          }}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4ad2f] text-lg font-black text-[#071a35]">
            H
          </span>

          <span>
            <strong className="block text-[16px] leading-5">
              Horizon Jobs
            </strong>


          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-bold text-white/75 transition hover:text-[#f2c85d]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authenticated ? (
            <div
              ref={accountRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setAccountOpen((value) => !value)
                }
                className="flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-2 transition hover:border-white/25 hover:bg-white/[.08]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e4ad2f] text-[#071a35]">
                  <UserRound size={17} strokeWidth={2.2} />
                </span>

                <ChevronDown
                  size={17}
                  className={
                    accountOpen
                      ? "rotate-180 transition"
                      : "transition"
                  }
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-[#071a35] shadow-[0_20px_50px_rgba(7,26,53,.22)]">
                  <div className="border-b border-slate-100 px-3 py-3">
                    <p className="text-sm font-black">
                      {displayName}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {session?.user?.email}
                    </p>
                  </div>

                  {role === "recruiter" ? (
                    <>
                      <MenuLink
                        href="/recruiter/dashboard"
                        icon={<LayoutDashboard size={17} />}
                        label="Recruiter Dashboard"
                        close={() => setAccountOpen(false)}
                      />

                      <MenuLink
                        href="/recruiter/jobs"
                        icon={<BriefcaseBusiness size={17} />}
                        label="Manage Jobs"
                        close={() => setAccountOpen(false)}
                      />

                      <MenuLink
                        href="/recruiter/profile"
                        icon={<UserRound size={17} />}
                        label="Company Profile"
                        close={() => setAccountOpen(false)}
                      />
                    </>
                  ) : (
                    <>
                      <MenuLink
                        href="/account/dashboard"
                        icon={<LayoutDashboard size={17} />}
                        label="My Dashboard"
                        close={() => setAccountOpen(false)}
                      />

                      <MenuLink
                        href="/account/applications"
                        icon={<FileText size={17} />}
                        label="My Applications"
                        close={() => setAccountOpen(false)}
                      />

                      <MenuLink
                        href="/account/profile"
                        icon={<UserRound size={17} />}
                        label="Profile & Resume"
                        close={() => setAccountOpen(false)}
                      />

                      <MenuLink
                        href="/account/saved-jobs"
                        icon={<Star size={17} />}
                        label="Saved Jobs"
                        close={() => setAccountOpen(false)}
                      />

                      <MenuLink
                        href="/account/settings"
                        icon={<Settings size={17} />}
                        label="Settings"
                        close={() => setAccountOpen(false)}
                      />
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      signOut({
                        callbackUrl: "/",
                      })
                    }
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-white/20 px-4 py-3 text-sm font-black text-white hover:bg-white/5"
              >
                Sign in
              </Link>

              <Link
                href="/recruiters"
                className="rounded-xl bg-[#3E7BFA] px-5 py-3 text-sm font-black text-white hover:bg-[#f2c85d]"
              >
                Post a Job
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Open menu"
          className="rounded-xl border border-white/15 p-2 md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#081d3b] md:hidden">
          <div className="grid gap-1 px-5 py-4">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-bold text-white/80 hover:bg-white/5"
              >
                {label}
              </Link>
            ))}

            <div className="mt-2 border-t border-white/10 pt-3">
              {authenticated ? (
                <>
                  <Link
                    href={
                      role === "recruiter"
                        ? "/recruiter/dashboard"
                        : "/account/dashboard"
                    }
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold hover:bg-white/5"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      signOut({
                        callbackUrl: "/",
                      })
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-300 hover:bg-white/5"
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-black"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/recruiters"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-[#3E7BFA] px-4 py-3 text-center text-sm font-black text-white"
                  >
                    Post a Job
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href,
  icon,
  label,
  close,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  close: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={close}
      className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition hover:bg-slate-50"
    >
      <span className="text-[#b88410]">
        {icon}
      </span>

      {label}
    </Link>
  );
}



