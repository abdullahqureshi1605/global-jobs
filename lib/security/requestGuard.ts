import type { NextRequest } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();

  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }

  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

function getClientIp(
  request: NextRequest
): string {
  const forwarded =
    request.headers.get("x-forwarded-for");

  if (forwarded) {
    return (
      forwarded.split(",")[0]?.trim() ||
      "unknown"
    );
  }

  const realIp =
    request.headers.get("x-real-ip");

  return realIp || "unknown";
}

export function getRequestIdentity(
  request: NextRequest
): string {
  const ip = getClientIp(request);

  const userAgent =
    request.headers.get("user-agent") ||
    "unknown";

  return `${ip}:${userAgent
    .slice(0, 80)
    .toLowerCase()}`;
}

export function checkRateLimit({
  request,
  keyPrefix,
  limit,
  windowMs,
}: {
  request: NextRequest;
  keyPrefix: string;
  limit: number;
  windowMs: number;
}) {
  cleanup();

  const identity =
    getRequestIdentity(request);

  const key =
    `${keyPrefix}:${identity}`;

  const now = Date.now();

  const existing =
    store.get(key);

  if (
    !existing ||
    existing.resetAt <= now
  ) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(
        limit - 1,
        0
      ),
      retryAfterSeconds: 0,
    };
  }

  existing.count += 1;

  const allowed =
    existing.count <= limit;

  return {
    allowed,

    remaining: Math.max(
      limit - existing.count,
      0
    ),

    retryAfterSeconds: Math.max(
      Math.ceil(
        (existing.resetAt - now) /
          1000
      ),
      1
    ),
  };
}