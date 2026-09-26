import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { PAGES } from "@/lib/pages";
import { THEMES } from "@/lib/content/themes";
import { CONTENT_DATE } from "@/lib/seo";

/**
 * Every indexable URL, generated from the page registry and the study themes
 * so a new page can't be forgotten here. lastModified is the date the content
 * was last reviewed (lib/seo.ts), not the build time - a sitemap that claims
 * every page changed on every deploy teaches crawlers to ignore it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(CONTENT_DATE);
  return [
    ...PAGES.map((p) => ({
      url: p.href === "/" ? SITE_URL : `${SITE_URL}${p.href}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: p.priority,
    })),
    ...THEMES.map((t) => ({
      url: `${SITE_URL}/scripture/${t.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
