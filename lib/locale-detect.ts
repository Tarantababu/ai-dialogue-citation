import type { Locale } from "@/lib/i18n";

/**
 * Pure locale-detection helpers, shared by the server (the /api/locale route,
 * which reads the visitor's geo-IP country) and the client (the I18nProvider,
 * which reads the browser's languages). No DOM or Node APIs, so both can import.
 */

const SUPPORTED: Locale[] = [
  "en", "zh", "hi", "es", "fr", "ar", "pt", "ru", "de", "ja", "tr",
];
const SUPPORTED_SET = new Set<string>(SUPPORTED);

/** Map a list of BCP-47 language tags (e.g. ["pt-BR","en"]) to a supported locale. */
export function localeFromLanguages(
  langs: readonly string[] | undefined | null,
): Locale | null {
  if (!langs) return null;
  for (const raw of langs) {
    const primary = raw.toLowerCase().split("-")[0];
    if (SUPPORTED_SET.has(primary)) return primary as Locale;
  }
  return null;
}

/**
 * Map an ISO 3166-1 alpha-2 country code to the locale most people there read.
 * Only the clear cases are mapped; anywhere unlisted (US, GB, CA, …) falls
 * through so the caller can use the browser language or English instead.
 */
const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  // Chinese
  CN: "zh", TW: "zh", HK: "zh", MO: "zh",
  // Japanese
  JP: "ja",
  // Hindi
  IN: "hi",
  // Turkish
  TR: "tr",
  // Russian
  RU: "ru", BY: "ru", KZ: "ru", KG: "ru",
  // German
  DE: "de", AT: "de", LI: "de", CH: "de",
  // French
  FR: "fr", MC: "fr", LU: "fr", BE: "fr", SN: "fr", CI: "fr", ML: "fr",
  BF: "fr", NE: "fr", TD: "fr", CD: "fr", CG: "fr", GA: "fr", CM: "fr",
  TG: "fr", BJ: "fr", GN: "fr", DJ: "fr", KM: "fr", MG: "fr", RW: "fr",
  // Arabic
  SA: "ar", AE: "ar", EG: "ar", DZ: "ar", MA: "ar", IQ: "ar", SD: "ar",
  SY: "ar", YE: "ar", TN: "ar", JO: "ar", LY: "ar", LB: "ar", OM: "ar",
  KW: "ar", QA: "ar", BH: "ar", PS: "ar", MR: "ar",
  // Portuguese
  PT: "pt", BR: "pt", AO: "pt", MZ: "pt", CV: "pt", GW: "pt", ST: "pt", TL: "pt",
  // Spanish
  ES: "es", MX: "es", AR: "es", CO: "es", PE: "es", VE: "es", CL: "es",
  EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es",
  SV: "es", NI: "es", CR: "es", PA: "es", UY: "es", GQ: "es", PR: "es",
};

/** Resolve a supported locale from an ISO country code, or null when unmapped. */
export function localeFromCountry(
  country: string | null | undefined,
): Locale | null {
  if (!country) return null;
  return COUNTRY_TO_LOCALE[country.trim().toUpperCase()] ?? null;
}

/** Parse a raw `Accept-Language` header value into ordered language tags. */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => part.split(";")[0].trim())
    .filter(Boolean);
}
