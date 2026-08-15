import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

const ALLOWED_HOSTS = [
  "global-jobz.netlify.app",
];

function count(
  html: string,
  expression: RegExp
) {
  return (
    html.match(expression) || []
  ).length;
}

function firstMatch(
  html: string,
  expression: RegExp
) {
  return (
    html.match(expression)?.[1] ||
    ""
  ).trim();
}

function header(
  headers: Headers,
  name: string
) {
  return (
    headers.get(name) ||
    "Not provided"
  );
}

export async function GET(
  request: Request
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const rawUrl =
      searchParams.get("url");

    if (!rawUrl) {
      return NextResponse.json(
        {
          error:
            "URL is required.",
        },
        {
          status: 400,
        }
      );
    }

    let target: URL;

    try {
      target = new URL(
        rawUrl
      );
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid URL.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      target.protocol !==
        "https:" &&
      target.protocol !==
        "http:"
    ) {
      return NextResponse.json(
        {
          error:
            "Only HTTP and HTTPS URLs are supported.",
        },
        {
          status: 400,
        }
      );
    }

    const configuredSite =
      process.env
        .NEXT_PUBLIC_SITE_URL;

    const configuredHost =
      configuredSite
        ? new URL(
            configuredSite
          ).hostname
        : null;

    const allowedHosts =
      new Set(
        [
          ...ALLOWED_HOSTS,
          configuredHost,
        ].filter(
          (
            host
          ): host is string =>
            Boolean(host)
        )
      );

    if (
      !allowedHosts.has(
        target.hostname
      )
    ) {
      return NextResponse.json(
        {
          error:
            "For security, this analyzer accepts Horizon Jobs pages only.",
        },
        {
          status: 400,
        }
      );
    }

    const started =
      performance.now();

    const response =
      await fetch(
        target.toString(),
        {
          method: "GET",
          redirect:
            "follow",
          cache: "no-store",
          headers: {
            "User-Agent":
              "Horizon-Jobs-Analyzer/1.0",
            Accept:
              "text/html,application/xhtml+xml",
          },
          signal:
            AbortSignal.timeout(
              15000
            ),
        }
      );

    const responseTimeMs =
      Math.round(
        performance.now() -
          started
      );

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      !contentType.includes(
        "text/html"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The supplied URL did not return an HTML page.",
        },
        {
          status: 400,
        }
      );
    }

    const html =
      await response.text();

    const pageSizeBytes =
      new TextEncoder().encode(
        html
      ).length;

    const title =
      firstMatch(
        html,
        /<title[^>]*>([\s\S]*?)<\/title>/i
      ) || "Missing";

    const description =
      firstMatch(
        html,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
      ) || "Missing";

    const canonical =
      firstMatch(
        html,
        /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*>/i
      ) || "Missing";

    const language =
      firstMatch(
        html,
        /<html[^>]+lang=["']([^"']+)["']/i
      ) || "Not provided";

    const robots =
      firstMatch(
        html,
        /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i
      ) || "Not provided";

    const viewport =
      firstMatch(
        html,
        /<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["'][^>]*>/i
      ) || "Not provided";

    const analysis = {
      requestedUrl:
        target.toString(),

      finalUrl:
        response.url,

      status:
        response.status,

      statusText:
        response.statusText,

      responseTimeMs,

      contentType,

      contentLength:
        header(
          response.headers,
          "content-length"
        ),

      pageSizeBytes,

      title,

      description,

      canonical,

      h1: count(
        html,
        /<h1\b/gi
      ),

      h2: count(
        html,
        /<h2\b/gi
      ),

      h3: count(
        html,
        /<h3\b/gi
      ),

      links: count(
        html,
        /<a\b/gi
      ),

      images: count(
        html,
        /<img\b/gi
      ),

      scripts: count(
        html,
        /<script\b/gi
      ),

      stylesheets: count(
        html,
        /<link[^>]+rel=["']stylesheet["']/gi
      ),

      forms: count(
        html,
        /<form\b/gi
      ),

      iframes: count(
        html,
        /<iframe\b/gi
      ),

      language,

      robots,

      viewport,

      cacheControl:
        header(
          response.headers,
          "cache-control"
        ),

      server:
        header(
          response.headers,
          "server"
        ),

      poweredBy:
        header(
          response.headers,
          "x-powered-by"
        ),

      securityHeaders: {
        contentSecurityPolicy:
          header(
            response.headers,
            "content-security-policy"
          ),

        strictTransportSecurity:
          header(
            response.headers,
            "strict-transport-security"
          ),

        xContentTypeOptions:
          header(
            response.headers,
            "x-content-type-options"
          ),

        xFrameOptions:
          header(
            response.headers,
            "x-frame-options"
          ),

        referrerPolicy:
          header(
            response.headers,
            "referrer-policy"
          ),
      },

      checkedAt:
        new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(
      "Website analyzer error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Analyzer failed.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}