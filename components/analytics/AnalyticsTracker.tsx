"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  usePathname,
  useSearchParams,
} from "next/navigation";

const TRACK_URL =
  "/api/analytics/track";

const VISITOR_KEY =
  "horizon_analytics_visitor";

const SESSION_KEY =
  "horizon_analytics_session";

const ATTRIBUTION_KEY =
  "horizon_analytics_attribution";

const SESSION_TIMEOUT =
  30 * 60 * 1000;

function createId() {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getVisitorId() {
  try {
    const existing =
      localStorage.getItem(
        VISITOR_KEY
      );

    if (existing) {
      return existing;
    }

    const id =
      createId();

    localStorage.setItem(
      VISITOR_KEY,
      id
    );

    return id;
  } catch {
    return createId();
  }
}

function getSession() {
  const now =
    Date.now();

  try {
    const stored =
      localStorage.getItem(
        SESSION_KEY
      );

    if (stored) {
      const parsed =
        JSON.parse(
          stored
        ) as {
          id: string;
          lastActivity: number;
        };

      if (
        parsed.id &&
        now -
          parsed.lastActivity <
          SESSION_TIMEOUT
      ) {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            id: parsed.id,
            lastActivity: now,
          })
        );

        return {
          id: parsed.id,
          isNew: false,
        };
      }
    }

    const id =
      createId();

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id,
        lastActivity: now,
      })
    );

    return {
      id,
      isNew: true,
    };
  } catch {
    return {
      id: createId(),
      isNew: true,
    };
  }
}

function getAttribution() {
  try {
    const url =
      new URL(
        window.location.href
      );

    const params =
      url.searchParams;

    const current = {
      source:
        params.get(
          "utm_source"
        ) || "",

      medium:
        params.get(
          "utm_medium"
        ) || "",

      campaign:
        params.get(
          "utm_campaign"
        ) || "",

      hasGclid:
        Boolean(
          params.get(
            "gclid"
          )
        ),

      hasFbclid:
        Boolean(
          params.get(
            "fbclid"
          )
        ),
    };

    if (
      current.source ||
      current.medium ||
      current.campaign ||
      current.hasGclid ||
      current.hasFbclid
    ) {
      localStorage.setItem(
        ATTRIBUTION_KEY,
        JSON.stringify(
          current
        )
      );

      return current;
    }

    const saved =
      localStorage.getItem(
        ATTRIBUTION_KEY
      );

    if (saved) {
      return JSON.parse(
        saved
      );
    }
  } catch {
    // ignore
  }

  return {
    source: "",
    medium: "",
    campaign: "",
    hasGclid: false,
    hasFbclid: false,
  };
}

function getReferrerHost() {
  try {
    if (
      !document.referrer
    ) {
      return null;
    }

    return new URL(
      document.referrer
    ).hostname;
  } catch {
    return null;
  }
}

function getDevice() {
  if (
    window.innerWidth < 768
  ) {
    return "mobile";
  }

  if (
    window.innerWidth < 1024
  ) {
    return "tablet";
  }

  return "desktop";
}

function getBrowser() {
  const ua =
    navigator.userAgent;

  if (
    ua.includes("Edg/")
  ) {
    return "Edge";
  }

  if (
    ua.includes("Firefox/")
  ) {
    return "Firefox";
  }

  if (
    ua.includes("Chrome/")
  ) {
    return "Chrome";
  }

  if (
    ua.includes("Safari/")
  ) {
    return "Safari";
  }

  return "Other";
}

function getOS() {
  const ua =
    navigator.userAgent;

  if (
    /Windows/i.test(ua)
  ) {
    return "Windows";
  }

  if (
    /Android/i.test(ua)
  ) {
    return "Android";
  }

  if (
    /iPhone|iPad|iPod/i.test(
      ua
    )
  ) {
    return "iOS";
  }

  if (
    /Mac OS X/i.test(ua)
  ) {
    return "macOS";
  }

  if (
    /Linux/i.test(ua)
  ) {
    return "Linux";
  }

  return "Other";
}

function getScrollDepth() {
  const height =
    Math.max(
      document.body
        .scrollHeight,
      document.documentElement
        .scrollHeight
    );

  const viewport =
    window.innerHeight;

  if (
    height <= viewport
  ) {
    return 100;
  }

  return Math.min(
    100,
    Math.round(
      ((window.scrollY +
        viewport) /
        height) *
        100
    )
  );
}

function sendEvent(
  event:
    Record<
      string,
      unknown
    >
) {
  try {
    const visitorId =
      getVisitorId();

    const session =
      getSession();

    const attribution =
      getAttribution();

    const payload = {
      visitor_id:
        visitorId,

      session_id:
        session.id,

      page_path:
        window.location.pathname,

      page_title:
        document.title,

      referrer_host:
        getReferrerHost(),

      utm_source:
        attribution.source,

      utm_medium:
        attribution.medium,

      utm_campaign:
        attribution.campaign,

      has_gclid:
        attribution.hasGclid,

      has_fbclid:
        attribution.hasFbclid,

      device_type:
        getDevice(),

      browser:
        getBrowser(),

      operating_system:
        getOS(),

      screen_width:
        window.screen.width,

      screen_height:
        window.screen.height,

      ...event,
    };

    const body =
      JSON.stringify(
        payload
      );

    const blob =
      new Blob(
        [body],
        {
          type:
            "application/json",
        }
      );

    if (
      typeof navigator
        .sendBeacon ===
      "function"
    ) {
      const sent =
        navigator.sendBeacon(
          TRACK_URL,
          blob
        );

      if (sent) {
        return;
      }
    }

    void fetch(
      TRACK_URL,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body,

        keepalive: true,
      }
    );
  } catch {
    // Analytics must never break the website.
  }
}

export default function AnalyticsTracker() {
  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const startedAt =
    useRef(
      Date.now()
    );

  const maxScroll =
    useRef(0);

  const sentExit =
    useRef(false);

  useEffect(() => {
    if (
      !pathname ||
      pathname.startsWith(
        "/admin"
      ) ||
      pathname.startsWith(
        "/api"
      ) ||
      pathname.startsWith(
        "/supabase-test"
      )
    ) {
      return;
    }

    startedAt.current =
      Date.now();

    maxScroll.current = 0;
    sentExit.current =
      false;

    const session =
      getSession();

    sendEvent({
      event_name:
        "page_view",

      is_landing:
        session.isNew,
    });

    let performanceTimer:
      number | undefined;

    if (
      typeof window !==
      "undefined"
    ) {
      performanceTimer =
        window.setTimeout(
          () => {
            try {
              const navigation =
                performance
                  .getEntriesByType(
                    "navigation"
                  )[0] as
                  | PerformanceNavigationTiming
                  | undefined;

              const paints =
                performance.getEntriesByType(
                  "paint"
                );

              const fcp =
                paints.find(
                  (entry) =>
                    entry.name ===
                    "first-contentful-paint"
                );

              sendEvent({
                event_name:
                  "page_performance",

                load_ms:
                  navigation?.loadEventEnd
                    ? Math.round(
                        navigation.loadEventEnd
                      )
                    : null,

                fcp_ms:
                  fcp
                    ? Math.round(
                        fcp.startTime
                      )
                    : null,
              });
            } catch {
              // ignore
            }
          },
          1200
        );
    }

    function onScroll() {
      maxScroll.current =
        Math.max(
          maxScroll.current,
          getScrollDepth()
        );
    }

    function sendExit() {
      if (
        sentExit.current
      ) {
        return;
      }

      sentExit.current =
        true;

      sendEvent({
        event_name:
          "page_exit",

        duration_ms:
          Date.now() -
          startedAt.current,

        scroll_depth:
          maxScroll.current,
      });
    }

    function onVisibilityChange() {
      if (
        document.visibilityState ===
        "hidden"
      ) {
        sendExit();
      }
    }

    function onClick(
      event: MouseEvent
    ) {
      const element =
        event.target as
          | HTMLElement
          | null;

      if (!element) {
        return;
      }

      const clickable =
        element.closest(
          "a,button,[role='button']"
        ) as
          | HTMLElement
          | null;

      if (!clickable) {
        return;
      }

      const label =
        (
          clickable.innerText ||
          clickable.textContent ||
          clickable.getAttribute(
            "aria-label"
          ) ||
          ""
        )
          .trim()
          .replace(
            /\s+/g,
            " "
          )
          .slice(
            0,
            120
          );

      const href =
        clickable.getAttribute(
          "href"
        ) || "";

      const combined =
        `${label} ${href}`.toLowerCase();

      if (
        combined.includes(
          "apply"
        )
      ) {
        sendEvent({
          event_name:
            "job_apply_click",

          event_label:
            label,

          event_target:
            href,
        });

        return;
      }

      if (
        combined.includes(
          "report job"
        ) ||
        href.includes(
          "/report"
        )
      ) {
        sendEvent({
          event_name:
            "report_job_click",

          event_label:
            label,

          event_target:
            href,
        });

        return;
      }

      sendEvent({
        event_name:
          "cta_click",

        event_label:
          label,

        event_target:
          href,
      });
    }

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    );

    document.addEventListener(
      "visibilitychange",
      onVisibilityChange
    );

    window.addEventListener(
      "pagehide",
      sendExit
    );

    document.addEventListener(
      "click",
      onClick,
      true
    );

    return () => {
      if (
        performanceTimer !==
        undefined
      ) {
        window.clearTimeout(
          performanceTimer
        );
      }

      window.removeEventListener(
        "scroll",
        onScroll
      );

      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );

      window.removeEventListener(
        "pagehide",
        sendExit
      );

      document.removeEventListener(
        "click",
        onClick,
        true
      );

      sendExit();
    };
  }, [
    pathname,
    searchParams,
  ]);

  return null;
}