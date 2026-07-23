/**
 * Canonical site URL for absolute metadata (OG images, canonical, sitemap).
 *
 * On Netlify, `URL` is injected at build time with the site's primary URL, so
 * this is correct automatically once deployed, custom domain included. The
 * fallback only matters for local `next build` runs.
 */
export const SITE_URL = process.env.URL ?? "https://heavenorhellreal.netlify.app";

export const SITE_NAME = "Heaven or Hell. Real?";

export const SITE_DESCRIPTION =
  "Millions of near-death experiences point to the same conclusion: God is real, and death is not the end. Watch the testimony, weigh the science, and decide for yourself.";
