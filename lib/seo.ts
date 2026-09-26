import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { SitePage } from "@/lib/pages";

/**
 * Per-page metadata and structured data.
 *
 * Next merges `metadata` SHALLOWLY down the tree: a page that sets
 * `openGraph` replaces the layout's whole openGraph object, and a page that
 * sets nothing inherits the layout's `alternates.canonical` - which, left on
 * the root layout as "/", would tell search engines that every page on the
 * site is a duplicate of the home page. So every page builds its complete
 * metadata here, canonical included, and the root layout sets no canonical.
 */

/** Date the current content was last reviewed; surfaces in Article schema. */
export const CONTENT_DATE = "2026-09-26";

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

type MetaInput = {
  path: string;
  title: string;
  description: string;
  og: string;
  ogAlt?: string;
  /** Use the title verbatim, without the "| Eternal Truth" template. */
  absoluteTitle?: boolean;
  keywords?: string[];
  type?: "website" | "article";
};

export function buildMetadata({
  path,
  title,
  description,
  og,
  ogAlt,
  absoluteTitle,
  keywords,
  type = "article",
}: MetaInput): Metadata {
  const shareTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      type,
      locale: "en_US",
      images: [{ url: og, width: 1200, height: 630, alt: ogAlt ?? shareTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [og],
    },
  };
}

/** Metadata for a registered top-level page. */
export function pageMetadata(page: SitePage, extra?: Partial<MetaInput>): Metadata {
  return buildMetadata({
    path: page.href,
    title: page.title,
    description: page.description,
    og: page.og,
    ogAlt: `${SITE_NAME}: ${page.name}`,
    absoluteTitle: page.href === "/",
    type: page.href === "/" ? "website" : "article",
    ...extra,
  });
}

/* ------------------------------------------------------------------------- */
/*  JSON-LD builders                                                          */
/* ------------------------------------------------------------------------- */

export const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: abs(t.path),
    })),
  };
}

/**
 * A page as an Article published by the site's Organization. The `about` and
 * `mentions` entities (with Wikipedia `sameAs` links) are what let search and
 * answer engines connect the page to the people and topics it discusses.
 */
export function articleLd({
  path,
  headline,
  description,
  image,
  about,
  mentions,
  citation,
  type = "Article",
}: {
  path: string;
  headline: string;
  description: string;
  image: string;
  about?: object[];
  mentions?: object[];
  citation?: object[];
  type?: string;
}) {
  return {
    "@type": type,
    "@id": `${abs(path)}#article`,
    headline,
    description,
    image: abs(image),
    url: abs(path),
    mainEntityOfPage: abs(path),
    inLanguage: "en",
    datePublished: CONTENT_DATE,
    dateModified: CONTENT_DATE,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    ...(about ? { about } : {}),
    ...(mentions ? { mentions } : {}),
    ...(citation ? { citation } : {}),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** A Wikipedia-anchored entity reference (Person or Thing). */
export function entity(type: "Person" | "Thing" | "Book" | "CreativeWork", name: string, wiki?: string) {
  return {
    "@type": type,
    name,
    ...(wiki ? { sameAs: `https://en.wikipedia.org/wiki/${wiki}` } : {}),
  };
}

/** Wrap several nodes into one JSON-LD graph document. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
