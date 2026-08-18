"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bookmark,
  Building2,
  ChevronRight,
  Globe,
  Menu,
  User,
  X,
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Countries", href: "/countries" },
  { name: "Categories", href: "/categories" },
  { name: "Career Resources", href: "/career-resources" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [recruiter, setRecruiter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    setLoading(true);
    try {
      // Check user
      const userRes = await fetch("/api/auth/me", { 
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      if (userRes.ok) {
        const data = await userRes.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }

    try {
      // Check recruiter
      const recRes = await fetch("/api/recruiter/me", { 
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      if (recRes.ok) {
        const data = await recRes.json();
        setRecruiter(data.recruiter);
      } else {
        setRecruiter(null);
      }
    } catch {
      setRecruiter(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  function closeMenu() {
    setMobileOpen(false);
  }

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Clear state immediately
        setUser(null);
        setRecruiter(null);
        closeMenu();
        // Force hard refresh to clear all cached state
        window.location.href = "/";
      } else {
        // Fallback
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        setUser(null);
        setRecruiter(null);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      setRecruiter(null);
      window.location.href = "/";
    }
  }

  async function handleRecruiterLogout() {
    try {
      await fetch("/api/recruiter/logout", { method: "POST" });
      setRecruiter(null);
      closeMenu();
      window.location.href = "/";
    } catch {
      setRecruiter(null);
      window.location.href = "/";
    }
  }

  // Show loading state
  if (loading) {
    return (
      <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center gap-5">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-bold tracking-tight">
                HORIZON <span className="text-indigo-400 font-medium">JOBS</span>
              </div>
              <div className="hidden sm:block text-[9px] tracking-widest uppercase text-slate-400 font-mono">
                Global Employment Intelligence
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-20 h-9 bg-slate-700 rounded-xl animate-pulse"></div>
            <div className="w-24 h-9 bg-slate-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center gap-5">

        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
          </div>
          <div>
            <div className="text-base sm:text-xl font-bold tracking-tight">
              HORIZON <span className="text-indigo-400 font-medium">JOBS</span>
            </div>
            <div className="hidden sm:block text-[9px] tracking-widest uppercase text-slate-400 font-mono">
              Global Employment Intelligence
            </div>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-1 ml-auto">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors whitespace-nowrap">
              {link.name}
            </Link>
          ))}
          <Link href="/saved" className="ml-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors">
            <Bookmark className="w-4 h-4" />
          </Link>

          {/* Recruiter Button */}
          {recruiter ? (
            <Link href="/recruiter/dashboard" className="ml-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Dashboard
            </Link>
          ) : (
            <Link href="/recruiter/signup" className="ml-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-sm font-semibold transition flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Post a Job
            </Link>
          )}

          {/* User Button - KEY FIX: Check user state properly */}
          {user ? (
            <Link href="/account" className="ml-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition flex items-center gap-2">
              <User className="w-4 h-4" /> My Account
            </Link>
          ) : (
            <Link href="/login" className="ml-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition">
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile button */}
        <div className="lg:hidden ml-auto">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-3">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMenu} className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">
                <span>{link.name}</span> <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            ))}
            <Link href="/saved" onClick={closeMenu} className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">
              <span>Saved Jobs</span> <Bookmark className="w-4 h-4 text-slate-500" />
            </Link>

            {/* Mobile Recruiter */}
            {recruiter ? (
              <Link href="/recruiter/dashboard" onClick={closeMenu} className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-slate-800">
                <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Dashboard</span>
              </Link>
            ) : (
              <Link href="/recruiter/signup" onClick={closeMenu} className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-slate-800">
                <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Post a Job</span>
              </Link>
            )}

            {/* Mobile User */}
            {user ? (
              <>
                <Link href="/account" onClick={closeMenu} className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">
                  <span className="flex items-center gap-2"><User className="w-4 h-4" /> My Account</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 w-full">
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link href="/login" onClick={closeMenu} className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">
                <span>Sign In</span>
              </Link>
            )}

            {/* Recruiter Logout */}
            {recruiter && (
              <button onClick={handleRecruiterLogout} className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 w-full">
                <span>Recruiter Logout</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}