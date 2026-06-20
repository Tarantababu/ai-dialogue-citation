/**
 * Canonical public origin of the app, e.g. "https://de-cite.com".
 * Citations must reference the permanent custom domain — never the changeable
 * *.vercel.app preview host — so a sealed reference URL stays valid forever.
 *
 * Set NEXT_PUBLIC_SITE_URL in the environment. Falls back to the current
 * browser origin (client) so local/preview development still works.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(
  /\/$/,
  "",
);

export function siteBaseUrl(): string {
  if (SITE_URL) return SITE_URL;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
