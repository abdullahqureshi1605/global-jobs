"use client";

import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

function getSafeCallbackUrl() {
  const params = new URLSearchParams(
    window.location.search
  );

  const callbackUrl = params.get("callbackUrl");

  if (
    callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//")
  ) {
    return callbackUrl;
  }

  return "/account/dashboard";
}

function LoginForm() {
  const searchParams = useSearchParams();

  const callbackUrl = (() => {
    const value =
      searchParams.get("callbackUrl") ||
      "/account/dashboard";

    return value.startsWith("/") &&
      !value.startsWith("//")
      ? value
      : "/account/dashboard";
  })();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        accountType: "candidate",
        redirect: false,
      });

      if (!result?.ok) {
        const message = result?.error || "";

        if (
          message.toLowerCase().includes("recruiter") ||
          message === "RecruiterAccount"
        ) {
          setError(
            "This email belongs to a recruiter account. Please use Recruiter Sign In."
          );
        } else {
          setError(
            "Email or password is incorrect. Please check your details and try again."
          );
        }

        return;
      }

      window.location.href = getSafeCallbackUrl();
    } catch {
      setError(
        "Unable to sign in right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f4f7fb] px-4 py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(7,26,53,.12)] lg:grid-cols-[.9fr_1.1fr]">
        <section className="hidden bg-[#071a35] p-10 text-white lg:block xl:p-14">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e4ad2f] text-xl font-black text-[#071a35]">
            H
          </div>

          <p className="mt-24 text-xs font-black uppercase tracking-[.24em] text-[#e4ad2f]">
            Candidate Portal
          </p>

          <h2 className="mt-5 max-w-md text-5xl font-black leading-[1.02]">
            Your career,
            <br />
            organized.
          </h2>

          <p className="mt-7 max-w-md text-base leading-8 text-white/65">
            Manage applications, saved jobs and your professional profile from one secure workspace.
          </p>

          <div className="mt-10 flex items-center gap-3 text-sm font-bold text-white/70">
            <ShieldCheck
              className="text-[#e4ad2f]"
              size={19}
            />
            Secure account access
          </div>
        </section>

        <section className="p-7 sm:p-10 lg:p-14">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#c38b12]">
            Welcome back
          </p>

          <h1 className="mt-3 text-4xl font-black text-[#071a35]">
            Sign in
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Access your Horizon Jobs candidate account.
          </p>

          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={googleLoading}
            className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
          >
            <Globe2 size={19} />
            {googleLoading
              ? "Opening Google..."
              : "Continue with Google"}
          </button>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Or
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form
            onSubmit={submit}
            className="space-y-5"
          >
            <Field
              label="Email"
              icon={<Mail size={18} />}
            >
              <input
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-12 text-base outline-none transition focus:border-[#e4ad2f] focus:ring-4 focus:ring-[#e4ad2f]/10"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </Field>

            <Field
              label="Password"
              icon={<Lock size={18} />}
            >
              <div className="relative">
                <input
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-12 pr-12 text-base outline-none transition focus:border-[#e4ad2f] focus:ring-4 focus:ring-[#e4ad2f]/10"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
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
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
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
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ad2f] text-base font-black text-[#071a35] transition hover:bg-[#f2c85d] disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-black text-[#a9770d]"
            >
              Create account
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-slate-400">
            Employer?{" "}
            <Link
              href="/recruiter/login"
              className="font-black text-[#a9770d]"
            >
              Recruiter Sign In
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-[calc(100vh-72px)] bg-[#f4f7fb]" />}>
      <LoginForm />
    </Suspense>
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
