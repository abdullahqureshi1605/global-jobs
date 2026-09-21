"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid administrator email or password.");
        return;
      }

      window.location.assign("/admin");
    } catch {
      setError("Unable to connect to administrator login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl sm:p-14">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e4ad2f] text-3xl font-black text-[#071a35]">
          H
        </div>

        <p className="mt-12 text-sm font-black uppercase tracking-[0.25em] text-[#b88410]">
          Horizon Jobs
        </p>

        <h1 className="mt-3 text-5xl font-black text-[#071a35]">
          Administrator sign in
        </h1>

        <p className="mt-4 text-lg text-slate-500">
          Secure access to the Horizon Jobs control center.
        </p>

        <form onSubmit={submit} className="mt-10 space-y-7">

          <div>
            <label className="mb-2 block text-sm font-black text-[#071a35]">
              Administrator email
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={21} />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
                className="h-16 w-full rounded-2xl border border-slate-200 pl-12 pr-4 text-lg text-[#071a35] outline-none focus:border-[#e4ad2f]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-[#071a35]">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={21} />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="h-16 w-full rounded-2xl border border-slate-200 pl-12 pr-14 text-lg text-[#071a35] outline-none focus:border-[#e4ad2f]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-16 w-full rounded-2xl bg-[#e4ad2f] text-lg font-black text-[#071a35] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in to Admin"}
          </button>

        </form>
      </div>
    </main>
  );
}
