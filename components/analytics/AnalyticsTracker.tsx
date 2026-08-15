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

type Attribution = {
  source: string;
  medium: string;
  campaign: string;
  hasGclid: boolean;
  hasFbclid: boolean;
};

function uuid() {
  return crypto.randomUUID();
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

    const value = uuid();

    localStorage.setItem(
      VISITOR_KEY,
      value
    );

    return value;
  } catch {
    return uuid();
  }
}

function getSession() {
  const now =
    Date.now();

  try {
    const raw =
      localStorage.getItem(
        SESSION_KEY
      );

    if (raw) {
      const parsed =
        JSON.parse(raw) as {
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

    const id = uuid();

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
      id: uuid(),
      isNew: true,
    };
  }
}

function getAttribution(): Attribution {
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
          params.get("gclid")
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
    // Continue with defaults.
  }

  return {
    source: "",
    medium: "",
    campaign: "",
    hasGclid: false,
    hasFbclid: false,
  };
}

function referrerHost() {
  try {
    if (
      !document.referrer
    ) {
      return "";
    }

    return new URL(
      document.referrer
    ).hostname.slice(0, 120);
  } catch {
    return "";
  }
}

function detectDevice() {
  const width =
    window.innerWidth;

  if (width < 768) {
    return "mobile";
  }

  if (width < 1024) {
    return "tablet";
  }

  return "desktop";
}

function detectBrowser() {
  const ua =
    navigator.userAgent;

  if (
    ua.includes("Edg/")
  ) {
    return "Edge";
  }

  if (
    ua.includes("Chrome/") &&
    !ua.includes(
      "Edg/"
    )
  ) {
    return "Chrome";
  }

  if (
    ua.includes("Firefox/")
  ) {
    return "Firefox";
  }

  if (
    ua.includes("Safari/") &&
    !ua.includes(
      "Chrome/"
    )
  ) {
    return "Safari";
  }

  return "Other";
}

function detectOS() {
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
    /Mac OS X/i.test(
      ua
    )
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

function sendEvent(
  event: Record<
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
        referrerHost(),

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
        detectDevice(),

      browser:
        detectBrowser(),

      operating_system:
        detectOS(),

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
      navigator.sendBeacon
    ) {
      navigator.sendBeacon(
        TRACK_URL,
        blob
      );

      return;
    }

    void fetch(
      TRACK_URL,
      {
        method: "POST",
        body,
        headers: {
          "Content-Type":
            "application/json",
        },
        keepalive: true,
      }
    );
  } catch {
    // Analytics must never break the website.
  }
}

function scrollDepth() {
  const bodyHeight =
    Math.max(
      document.body
        .scrollHeight,
      document.documentElement
        .scrollHeight
    );

  const viewport =
    window.innerHeight;

  const scrollTop =
    window.scrollY;

  if (
    bodyHeight <= viewport
  ) {
    return 100;
  }

  return Math.min(
    100,
    Math.round(
      ((scrollTop +
        viewport) /
        bodyHeight) *
        100
    )
  );
}

export default function AnalyticsTracker() {
  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const pageStarted =
    useRef(
      Date.now()
    );

  const maxScroll =
    useRef(0);

  const exitSent =
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

    pageStarted.current =
      Date.now();

    maxScroll.current = 0;
    exitSent.current =
      false;

    const session =
      getSession();

    sendEvent({
      event_name:
        "page_view",

      is_landing:
        session.isNew,
    });

    const performanceTimer =
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

            let lcp = 0;
            let cls = 0;

            try {
              const lcpEntries =
                performance.getEntriesByType(
                  "largest-contentful-paint"
                );

              const last =
                lcpEntries[
                  lcpEntries.length -
                    1
                ];

              if (last) {
                lcp =
                  Math.round(
                    last.startTime
                  );
              }
            } catch {}

            try {
              const clsEntries =
                performance.getEntriesByType(
                  "layout-shift"
                ) as Array<
                  PerformanceEntry & {
                    value?: number;
                    hadRecentInput?: boolean;
                  }
                >;

              cls =
                clsEntries.reduce(
                  (
                    total,
                    entry
                  ) => {
                    if (
                      entry.hadRecentInput
                    ) {
                      return total;
                    }

                    return (
                      total +
                      (entry.value ||
                        0)
                    );
                  },
                  0
                );
            } catch {}

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
                getPaint(
                  "first-contentful-paint"
                ),

              lcp_ms:
                lcp || null,

              cls,

              duration_ms:
                Math.round(
                  performance.now()
                ),
            });
          } catch {
            // Never break the page.
          }
        },
        1200
      );

    function onScroll() {
      maxScroll.current =
        Math.max(
          maxScroll.current,
          scrollDepth()
        );
    }

    function sendExit() {
      if (
        exitSent.current
      ) {
        return;
      }

      exitSent.current =
        true;

      sendEvent({
        event_name:
          "page_exit",

        duration_ms:
          Math.max(
            0,
            Date.now() -
              pageStarted.current
          ),

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
      const target =
        event.target as
          | HTMLElement
          | null;

      if (!target) {
        return;
      }

      const clickable =
        target.closest(
          "a,button,[role='button']"
        ) as
          | HTMLElement
          | null;

      if (!clickable) {
        return;
      }

      const href =
        clickable
          .getAttribute(
            "href"
          ) || "";

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
          .slice(0, 120);

      const targetUrl =
        href.slice(
          0,
          500
        );

      const lower =
        `${label} ${href}`.toLowerCase();

      if (
        lower.includes(
          "apply"
        ) &&
        href &&
        !href.startsWith(
          "/jobs/"
        )
      ) {
        sendEvent({
          event_name:
            "job_apply_click",

          event_label:
            label,

          event_target:
            targetUrl,
        });

        return;
      }

      if (
        href.includes(
          "/report-job"
        ) ||
        lower.includes(
          "report job"
        )
      ) {
        sendEvent({
          event_name:
            "report_job_click",

          event_label:
            label,

          event_target:
            targetUrl,
        });

        return;
      }

      sendEvent({
        event_name:
          "cta_click",

        event_label:
          label,

        event_target:
          targetUrl,
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
      window.clearTimeout(
        performanceTimer
      );

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

function getPaint(
  name: string
) {
  try {
    const entries =
      performance.getEntriesByType(
        "paint"
      );

    const entry =
      entries.find(
        (item) =>
          item.name === name
      );

    return entry
      ? Math.round(
          entry.startTime
        )
      : null;
  } catch {
    return null;
  }
}