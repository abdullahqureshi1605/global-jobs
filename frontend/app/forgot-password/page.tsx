"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage("If an account exists for this email, a password reset link has been sent. Please check your inbox.");
      }
    } catch {
      setError("Unable to send the reset email right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="horizon-page">
      <div className="horizon-container flex min-h-[calc(100vh-72px)] items-center justify-center py-12">
        <div className="horizon-card w-full max-w-md p-7 sm:p-9">
          <div className="mb-7 text-center">
            <a href="/" aria-label="Horizon Jobs home" className="mx-auto block w-fit"><img src="/logo.png" alt="Horizon Jobs logo" width="56" height="56" className="h-14 w-14 rounded-xl object-contain" /></a>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#3E7BFA]">
              Account Recovery
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#071a35]">
              Forgot your password?
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your email address and we&apos;ll send you a secure link to create a new password.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#071a35]">Email address</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#3E7BFA] focus:ring-2 focus:ring-[#3E7BFA]/10"
                />
              </div>
            </label>

            {message && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3E7BFA] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-bold text-[#2563EB] hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
