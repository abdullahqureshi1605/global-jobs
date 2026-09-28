"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CONSENT_COOKIE = "horizon_cookie_consent";

type ConsentValue = "all" | "essential";

function getConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  const value = match?.[1];
  return value === "all" || value === "essential" ? value : null;
}

function saveConsent(value: ConsentValue) {
  // "Secure" only works on https. On http (phone testing over Wi-Fi) the browser
  // would drop the cookie and the banner would keep coming back.
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
}

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setVisible(getConsent() === null);
  }, []);

  // Keep the bottom of the page (footer links) from hiding behind the bar
  useEffect(() => {
    const el = barRef.current;
    if (!visible || !el) return;
    const apply = () => {
      document.body.style.paddingBottom = `${el.offsetHeight}px`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.body.style.paddingBottom = "";
    };
  }, [visible, mounted]);

  if (!mounted || !visible) return null;

  const choose = (value: ConsentValue) => {
    saveConsent(value);
    setVisible(false);
  };

  return createPortal(
    <div
      ref={barRef}
      className="hj-cookie"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div className="hj-cookie__inner">
        <span className="hj-cookie__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M21.6 12.8a1 1 0 0 0-1-.2 2.6 2.6 0 0 1-3.4-2.9 1 1 0 0 0-1-1.2 4.6 4.6 0 0 1-4.4-4.4 1 1 0 0 0-1.2-1A10 10 0 1 0 22 13.7a1 1 0 0 0-.4-.9ZM7.5 15a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm2-6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm6 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
          </svg>
        </span>

        <p className="hj-cookie__text">
          <strong>Your privacy matters.</strong> Horizon Jobs uses essential cookies
          to keep the site working, plus optional analytics and advertising cookies.
          See our <a href="/cookie-policy">Cookie Policy</a> and{" "}
          <a href="/privacy-policy">Privacy Policy</a>.
        </p>

        <div className="hj-cookie__actions">
          <button
            type="button"
            className="hj-cookie__btn hj-cookie__btn--ghost"
            onClick={() => choose("essential")}
          >
            Essential only
          </button>
          <button
            type="button"
            className="hj-cookie__btn hj-cookie__btn--solid"
            onClick={() => choose("all")}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}