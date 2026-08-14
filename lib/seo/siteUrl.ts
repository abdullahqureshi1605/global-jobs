const FALLBACK_LOCAL_URL = "http://localhost:3000";

export function getSiteUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return FALLBACK_LOCAL_URL;
}