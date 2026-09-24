"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock, Mail, User } from "lucide-react";

function getSafeCallbackUrl() {
  const params = new URLSearchParams(window.location.search);

  const value =
    params.get("redirect") ||
    params.get("callbackUrl") ||
    "/account/dashboard";

  return value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/account/dashboard";
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to create account."
        );
      }

      const login = await signIn(
        "credentials",
        {
          email,
          password,
          accountType: "candidate",
          redirect: false,
        }
      );

      if (login?.error) {
        router.push("/login?created=1");
        return;
      }

      window.location.href =
        getSafeCallbackUrl();

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
        <section className="relative flex min-h-[230px] flex-col bg-[#071a35] px-8 py-7 text-white sm:px-10 lg:min-h-0 lg:px-12 lg:py-8">

          {/* Future logo placeholder — no Horizon Jobs text */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#3e7bfa] to-[#e4ad2f]"
            aria-label="Horizon Jobs logo placeholder"
          >
            <span className="text-lg font-black text-white">
              H
            </span>
          </div>

          <div className="absolute inset-x-8 top-1/2 max-w-[470px] -translate-y-1/2 sm:inset-x-10 lg:inset-x-12">

            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e4ad2f]">
              For job seekers
            </p>

            <h2 className="mt-3 font-serif text-[30px] font-semibold leading-[1.08] text-white sm:text-[32px]">
              Find the right
              <br />
              opportunity.
            </h2>

            <p className="mt-3 max-w-[450px] text-[13px] leading-5 text-white/65">
              Create your profile, discover relevant jobs and keep your applications organized in one place.
            </p>

          </div>

          <p className="mt-5 text-[10px] text-white/40">
            © 2026 Horizon Jobs
          </p>

        </section>

        {/* RIGHT PANEL */}
        <section className="flex min-h-0 overflow-hidden bg-white px-7 py-6 sm:px-10 lg:px-10 lg:py-5 xl:px-12">

          <div className="mx-auto w-full max-w-[490px]">

            {/* TABS */}
            <div className="flex border-b border-[#E3E8EF]">

              <Link
                href="/login"
                className="px-1 pb-2.5 text-[13px] font-semibold text-[#7890aa] hover:text-[#0b1526]"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="ml-8 border-b-2 border-[#e4ad2f] px-1 pb-2.5 text-[13px] font-bold text-[#0b1526]"
              >
                Create account
              </Link>

            </div>

            <div className="pt-1">

              <p className="hidden text-[11px] font-bold text-[#0b1526]">
                Candidate account
              </p>

              <h1 className="mt-1.5 font-serif text-[24px] font-semibold leading-tight text-[#0b1526]">
                Create account
              </h1>

              <p className="mt-1 text-[11px] leading-4 text-[#45617f]">
                Create your account and start discovering opportunities.
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
                  label="Full name"
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
                  label="Email"
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
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Field>

                <Field
                  label="Password"
                  icon={<Lock size={15} />}
                >
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D5DDE8] bg-white px-3 pl-9 text-[13px] text-[#0b1526] outline-none placeholder:text-[#9aaabd] focus:border-[#3e7bfa] focus:ring-2 focus:ring-[#3e7bfa]/10"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </Field>

                <Field
                  label="Confirm password"
                  icon={<Lock size={15} />}
                >
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) =>
                      setConfirm(e.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#D5DDE8] bg-white px-3 pl-9 text-[13px] text-[#0b1526] outline-none placeholder:text-[#9aaabd] focus:border-[#3e7bfa] focus:ring-2 focus:ring-[#3e7bfa]/10"
                    placeholder="Repeat your password"
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
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#3e7bfa] text-[13px] font-bold text-white transition hover:bg-[#2f6eea] disabled:opacity-60"
                >
                  {loading
                    ? "Creating account..."
                    : "Create account"}

                  {!loading && (
                    <ArrowRight size={15} />
                  )}
                </button>

              </form>

              
                  <br></br>
              <p className="text-center text-[11px] text-[#7890aa]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#2563eb]"
                >
                  Sign in
                </Link>
              </p>
                    <div className="my-3 border-t border-[#E3E8EF]" />

              <p className="mt-3 text-center text-[11px] text-[#7890aa]">
                Hiring people?{" "}
                <Link
                  href="/recruiter/signup"
                  className="font-bold text-[#2563eb]"
                >
                  Create recruiter account
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



