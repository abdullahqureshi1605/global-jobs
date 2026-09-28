"use client";

import { FormEvent, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function JobAlertSubscribeForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const session = await getSession();

      if (session?.user) {
        router.push("/account/profile");
        return;
      }

      const callbackUrl = "/account/profile";
      const query = email.trim()
        ? `?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(email.trim())}`
        : `?callbackUrl=${encodeURIComponent(callbackUrl)}`;

      router.push(`/login${query}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-xl flex-col gap-3 sm:flex-row lg:min-w-[500px]"
    >
      <input
        type="email"
        name="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@email.com"
        aria-label="Email address"
        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white px-4 py-2.5 text-sm text-[#071a35] outline-none placeholder:text-[#7890AA] focus:border-[#E4AD2F]"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[#3E7BFA] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#F0BA3D] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Opening..." : "Subscribe"}
      </button>
    </form>
  );
}
