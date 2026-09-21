"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Lock,
  Mail,
  User,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirm, setConfirm] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function submit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (password !== confirm) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/auth/signup",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to create account."
        );
      }

      const login =
        await signIn(
          "credentials",
          {
            email,
            password,
            redirect: false,
          }
        );

      if (login?.error) {
        router.push(
          "/login?created=1"
        );

        return;
      }

      window.location.href =
        "/account/dashboard";
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
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fa] px-5 py-12">

      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

        <div className="bg-[#071a35] px-8 py-8 text-white">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e4ad2f] text-[#071a35]">
            <BriefcaseBusiness />
          </div>

          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.25em] text-[#e4ad2f]">
            Candidate Account
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Create account
          </h1>

          <p className="mt-2 text-sm text-white/60">
            Build your professional profile and start applying.
          </p>

        </div>


        <form
          onSubmit={submit}
          className="space-y-5 p-8"
        >

          <Field
            label="Full name"
            icon={<User size={17} />}
          >
            <input
              required
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="workspace-input pl-11"
              placeholder="Your full name"
            />
          </Field>


          <Field
            label="Email"
            icon={<Mail size={17} />}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="workspace-input pl-11"
              placeholder="you@example.com"
            />
          </Field>


          <Field
            label="Password"
            icon={<Lock size={17} />}
          >
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="workspace-input pl-11"
              placeholder="At least 6 characters"
            />
          </Field>


          <Field
            label="Confirm password"
            icon={<Lock size={17} />}
          >
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) =>
                setConfirm(
                  e.target.value
                )
              }
              className="workspace-input pl-11"
              placeholder="Repeat password"
            />
          </Field>


          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}


          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f2b51d] font-black text-[#071a35] disabled:opacity-60"
          >
            {loading
              ? "Creating account..."
              : "Create account"}

            {!loading && (
              <ArrowRight size={17} />
            )}
          </button>


          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}

            <Link
              href="/login"
              className="font-black text-[#b88410]"
            >
              Sign in
            </Link>
          </p>


          <p className="text-center text-xs text-slate-400">
            Hiring people?{" "}

            <Link
              href="/recruiter/signup"
              className="font-bold text-slate-600"
            >
              Create recruiter account
            </Link>
          </p>

        </form>

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
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#071a35]">
        {label}
      </span>

      <div className="relative">
        <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        {children}
      </div>
    </label>
  );
}
