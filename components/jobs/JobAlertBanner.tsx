"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";

export default function JobAlertBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);

          // Check if user has subscription
          if (data.user) {
            const subResponse = await fetch(`/api/job-alerts/subscribe?userId=${data.user.id}`);
            if (subResponse.ok) {
              const subData = await subResponse.json();
              setHasSubscription((subData.subscriptions || []).length > 0);
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    checkUser();
  }, []);

  // Don't show if:
  // - User is logged in AND has a subscription
  // - User is logged in AND is on account page
  // - Banner is dismissed
  if (!isVisible) return null;
  if (!isLoading && user && hasSubscription) return null;
  if (typeof window !== "undefined" && window.location.pathname === "/job-alerts") return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 shrink-0 animate-pulse" />
            <p className="text-sm font-medium">
              {user ? (
                "Get job alerts matching your preferences!"
              ) : (
                "Get job alerts delivered to your inbox!"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/job-alerts"
              className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full transition"
            >
              Subscribe Now
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/70 hover:text-white transition"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}