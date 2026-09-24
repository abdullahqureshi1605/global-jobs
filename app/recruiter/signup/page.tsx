"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Lock,
  Mail,
  User,
} from "lucide-react";

function getSafeCallbackUrl() {
  const params = new URLSearchParams(window.location.search);

  const value =
    params.get("redirect") ||
    params.get("callbackUrl") ||
    "/recruiter/dashboard";

  return value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/recruiter/dashboard";
}

export default function RecruiterSignup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function continueWithGoogle() {
    setGoogleLoading(true);
    setError("");

    try {
      await signIn("google", {
        callbackUrl: getSafeCallbackUrl(),
      });
    } catch {
      setError(
        "Google sign in could not be completed. Please try again."
      );

      setGoogleLoading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/recruiter/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            company_name: company,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to create recruiter account."
        );
      }

      const login = await signIn(
        "credentials",
        {
          email,
          password,
          accountType: "recruiter",
          redirect: false,
        }
      );

      if (login?.error) {
        router.push(
          "/recruiter/login?created=1"
        );

        return;
      }

      window.location.href =
        "/recruiter/dashboard";

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Signup failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen w-full lg:h-screen lg:grid-cols-2">

        {/* LEFT PANEL */}
        <section className="relative flex min-h-[260px] flex-col bg-[#071a35] px-8 py-7 text-white sm:px-10 lg:min-h-0 lg:px-14 lg:py-10">

          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3e7bfa] to-[#e4ad2f]"
            aria-label="Horizon Jobs logo placeholder"
          >
            <span className="h-3 w-3 rounded-sm bg-white/90" aria-hidden="true" />
          </div>

          <div className="absolute left-14 top-1/2 max-w-[400px] -translate-y-1/2">

            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e4ad2f]">
              For employers
            </p>

            <h2 className="mt-3 font-serif text-[30px] font-semibold leading-[1.08] text-white sm:text-[32px]">
              Find the right
              <br />
              people.
            </h2>

            <p className="mt-3 max-w-[450px] text-[13px] leading-5 text-white/65">
              Create your employer account, publish opportunities and
              manage candidates from one secure Horizon Jobs workspace.
            </p>

          </div>

          <p className="absolute bottom-10 left-14 text-[10px] text-white/40">
            © 2026 Horizon Jobs
          </p>

        </section>

        {/* RIGHT PANEL */}
        <section className="flex min-h-0 overflow-hidden bg-white px-7 py-6 sm:px-10 lg:px-10 lg:py-5 xl:px-12">

          <div className="mx-auto w-full max-w-[490px]">

            {/* TABS */}
            <div className="flex border-b border-[#E3E8EF]">

              <Link
                href="/recruiter/login"
                className="px-1 pb-2.5 text-[13px] font-semibold text-[#7890aa] hover:text-[#0b1526]"
              >
                Sign in
              </Link>

              <Link
                href="/recruiter/signup"
                className="ml-8 border-b-2 border-[#e4ad2f] px-1 pb-2.5 text-[13px] font-bold text-[#0b1526]"
              >
                Create account
              </Link>

            </div>

            <div className="pt-1">

              <h1 className="mt-1.5 font-serif text-[24px] font-semibold leading-tight text-[#0b1526]">
                Create recruiter account
              </h1>

              <p className="mt-1 text-[11px] leading-4 text-[#45617f]">
                Create your employer account and start managing opportunities.
              </p>

              {/* GOOGLE */}
              <button
                type="button"
                onClick={continueWithGoogle}
                disabled={googleLoading}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#D5DDE8] bg-white text-[13px] font-semibold text-[#0b1526] transition hover:border-[#b8c4d5] hover:bg-[#f8fafc] disabled:opacity-60"
              >

                <span
                  className="text-[16px] font-bold"
                  aria-hidden="true"
                >
                  G
                </span>

                {googleLoading
                  ? "Opening Google..."
                  : "Continue with Google"}

              </button>

              {/* DIVIDER */}
              <div className="my-2.5 flex items-center gap-3">

                <span className="h-px flex-1 bg-[#E3E8EF]" />

                <span className="text-[10px] font-medium text-[#7890aa]">
                  OR
                </span>

                <span className="h-px flex-1 bg-[#E3E8EF]" />

              </div>

              <form
                onSubmit={submit}
                className="space-y-1.5"
              >

                <Field
                  label="Your name"
                  icon={<User size={15} />}
                >
                  <input
                    required
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D5DDE8] bg-white px-3 pl-9 text-[13px] text-[#0b1526] outline-none placeholder:text-[#9aaabd] focus:border-[#3e7bfa] focus:ring-2 focus:ring-[#3e7bfa]/10"
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </Field>

                <Field
                  label="Company name"
                  icon={<Building2 size={15} />}
                >
                  <input
                    required
                    value={company}
                    onChange={(e) =>
                      setCompany(e.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D5DDE8] bg-white px-3 pl-9 text-[13px] text-[#0b1526] outline-none placeholder:text-[#9aaabd] focus:border-[#3e7bfa] focus:ring-2 focus:ring-[#3e7bfa]/10"
                    placeholder="Your company name"
                    autoComplete="organization"
                  />
                </Field>

                <Field
                  label="Work email"
                  icon={<Mail size={15} />}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D5DDE8] bg-white px-3 pl-9 text-[13px] text-[#0b1526] outline-none placeholder:text-[#9aaabd] focus:border-[#3e7bfa] focus:ring-2 focus:ring-[#3e7bfa]/10"
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </Field>

                <Field
                  label="Password"
                  icon={<Lock size={15} />}
                >
                  <input
                    type="password"
                    minLength={6}
                    required
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D5DDE8] bg-white px-3 pl-9 text-[13px] text-[#0b1526] outline-none placeholder:text-[#9aaabd] focus:border-[#3e7bfa] focus:ring-2 focus:ring-[#3e7bfa]/10"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </Field>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold leading-4 text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#3e7bfa] text-[13px] font-bold text-white transition hover:bg-[#2f6eea] disabled:opacity-60"
                >
                  {loading
                    ? "Creating account..."
                    : "Create account"}

                  {!loading && (
                    <ArrowRight size={15} />
                  )}
                </button>

              </form>

              <div className="my-3 border-t border-[#E3E8EF]" />

              <p className="text-center text-[11px] text-[#7890aa]">
                Already have an account?{" "}
                <Link
                  href="/recruiter/login"
                  className="font-bold text-[#2563eb]"
                >
                  Sign in
                </Link>
              </p>

              <p className="mt-3 text-center text-[11px] text-[#7890aa]">
                Job seeker?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-[#2563eb]"
                >
                  Create candidate account
                </Link>
              </p>

            </div>
          </div>

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
      <label className="mb-1 block text-[11px] font-bold text-[#0b1526]">
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#8ca0b8]">
          {icon}
        </span>

        {children}
      </div>
    </div>
  );
}
