import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap for the public, indexable routes. Skips dynamic verification pages
 * (/dogrulama/[code]) and operational pages (admin, checkout success). The
 * cornerstone SEO page is given a high priority so crawlers prioritise it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL || "https://de-cite.com";
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/how-to-cite-chatgpt", priority: 0.9, changeFrequency: "monthly" },
    { path: "/muhurle", priority: 0.8, changeFrequency: "monthly" },
    { path: "/dogrulama", priority: 0.7, changeFrequency: "monthly" },
    { path: "/sss", priority: 0.6, changeFrequency: "monthly" },
    { path: "/son-atiflar", priority: 0.5, changeFrequency: "daily" },
    { path: "/makbuz", priority: 0.3, changeFrequency: "yearly" },
    { path: "/geri-bildirim", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
