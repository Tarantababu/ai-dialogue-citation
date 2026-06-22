import type { NextRequest } from "next/server";
import {
  localeFromCountry,
  localeFromLanguages,
  parseAcceptLanguage,
} from "@/lib/locale-detect";

/**
 * Suggests the interface locale for a first-time visitor based on their
 * location. Priority: geo-IP country (set by the platform edge as
 * `x-vercel-ip-country`) → the browser's Accept-Language → English.
 *
 * Per-visitor and never cached. The client only applies this when the user
 * has not already chosen a language.
 */
export const dynamic = "force-dynamic";

export function GET(req: NextRequest): Response {
  const country =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry"); // harmless fallback if fronted by Cloudflare
  const langs = parseAcceptLanguage(req.headers.get("accept-language"));

  const locale =
    localeFromCountry(country) ?? localeFromLanguages(langs) ?? "en";

  return new Response(JSON.stringify({ locale, country: country ?? null }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
