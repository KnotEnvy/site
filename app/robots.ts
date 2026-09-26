import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Open to every crawler, including the AI answer engines (GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended...). For a site whose whole purpose is to
 * get this message in front of people, being quotable by those engines is the
 * point - the wildcard rule already allows them; this comment is here so no
 * one "tightens" it by accident.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
