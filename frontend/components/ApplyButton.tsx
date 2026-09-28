"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

type ApplyButtonProps = {
  jobId?: string | null;
  source?: string | null;
  applyUrl?: string | null;
};

export default function ApplyButton({
  jobId,
  source,
  applyUrl,
}: ApplyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoStarted = useRef(false);

  const isExternal = Boolean(
    source &&
      source.toLowerCase() !== "manual" &&
      source.toLowerCase() !== "horizon"
  );

  async function startApply() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const sessionResponse = await fetch("/api/auth/session", {
        cache: "no-store",
      });

      const session = await sessionResponse.json();

      if (!session?.user) {
        const callbackUrl =
          window.location.pathname +
          "?apply=1";

        router.push(
          `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        );

        return;
      }

      if (isExternal) {
        if (!applyUrl) {
          throw new Error(
            "The original application link is unavailable."
          );
        }

        window.location.href = applyUrl;
        return;
      }

      if (!jobId) {
        throw new Error(
          "This Horizon job is missing its application ID."
        );
      }

      const response = await fetch(
        "/api/user/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_id: jobId,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        const callbackUrl =
          window.location.pathname +
          "?apply=1";

        router.push(
          `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to submit application."
        );
      }

      router.push("/account/applications");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to apply right now."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    if (
      params.get("apply") === "1" &&
      !autoStarted.current
    ) {
      autoStarted.current = true;
      void startApply();
    }
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={startApply}
        disabled={loading}
        className="horizon-button horizon-button-gold w-full"
      >
        <Send size={16} />
        {loading ? "Processing..." : "Apply Now"}
      </button>

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
