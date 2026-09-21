"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";

export default function RecruiterLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        accountType: "recruiter",
        redirect: false,
      });

      if (!result?.ok) {
        const message = result?.error || "";

        if (message.toLowerCase().includes("candidate")) {
          setError(
            "This email is registered as a candidate account. Recruiter access requires a separate email."
          );
        } else {
          setError(
            "Recruiter access was not found for this email, or the password is incorrect."
          );
        }

        return;
      }

      window.location.href =
        "/recruiter/dashboard";
    } catch {
      setError(
        "Unable to sign in as recruiter right now."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f4f7fb] px-4 py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(7,26,53,.12)] lg:grid-cols-[.9fr_1.1fr]">

        <section className="hidden bg-[#071a35] p-10 text-white lg:block xl:p-14">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e4ad2f] text-[#071a35]">
            <BriefcaseBusiness size={26} />
          </div>

          <p className="mt-24 text-xs font-black uppercase tracking-[.24em] text-[#e4ad2f]">
            Recruiter Workspace
          </p>

          <h2 className="mt-5 max-w-md text-5xl font-black leading-[1.02]">
            Hire better.
            <br />
            Reach further.
          </h2>

          <p className="mt-7 max-w-md text-base leading-8 text-white/65">
            Publish jobs, manage candidates and operate your employer workspace.
          </p>
        </section>

        <section className="p-7 sm:p-10 lg:p-14">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#c38b12]">
            Employer Access
          </p>

          <h1 className="mt-3 text-4xl font-black text-[#071a35]">
            Recruiter sign in
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Access your employer workspace.
          </p>

          <form
            onSubmit={submit}
            className="mt-9 space-y-5"
          >
            <Field label="Work email" icon={<Mail size={18} />}>
              <input
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-12 text-base outline-none transition focus:border-[#e4ad2f] focus:ring-4 focus:ring-[#e4ad2f]/10"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </Field>

            <Field label="Password" icon={<Lock size={18} />}>
              <div className="relative">
                <input
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-12 pr-12 text-base outline-none transition focus:border-[#e4ad2f] focus:ring-4 focus:ring-[#e4ad2f]/10"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {show ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </Field>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ad2f] text-base font-black text-[#071a35] transition hover:bg-[#f2c85d] disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign in as recruiter"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            New employer?{" "}
            <Link
              href="/recruiter/signup"
              className="font-black text-[#a9770d]"
            >
              Create recruiter account
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-slate-400">
            Job seeker?{" "}
            <Link
              href="/login"
              className="font-black text-[#a9770d]"
            >
              Candidate sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-[#071a35]">
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        {children}
      </div>
    </div>
  );
}
