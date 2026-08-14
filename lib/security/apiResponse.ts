import { NextResponse } from "next/server";

export function securityHeaders(
  response: NextResponse
) {
  response.headers.set(
    "Cache-Control",
    "no-store"
  );

  response.headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  return response;
}

export function rateLimitedResponse(
  retryAfterSeconds: number
) {
  const response =
    NextResponse.json(
      {
        error:
          "Too many requests. Please try again later.",
      },
      {
        status: 429,
      }
    );

  response.headers.set(
    "Retry-After",
    String(retryAfterSeconds)
  );

  return securityHeaders(
    response
  );
}