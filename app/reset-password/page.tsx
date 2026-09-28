"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess("Your password has been updated successfully. You can now sign in with your new password.");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => router.push("/login"), 1800);
    } catch {
      setError("Unable to update your password right now. Please try again.");
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
              Secure Account
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#071a35]">
              Create a new password
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Choose a new password for your Horizon Jobs account.
            </p>
          </div>

          {!ready ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
              This password-reset session is missing or has expired. Please request a new reset link.
              <div className="mt-3">
                <Link href="/forgot-password" className="font-bold text-[#2563EB] hover:underline">
                  Request a new link
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#071a35]">New password</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#3E7BFA] focus:ring-2 focus:ring-[#3E7BFA]/10"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#071a35]">Confirm new password</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#3E7BFA] focus:ring-2 focus:ring-[#3E7BFA]/10"
                  />
                </div>
              </label>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3E7BFA] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update Password"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>
          )}

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
