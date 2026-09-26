import type { Metadata, Viewport } from "next";
import { Anton, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { ORG_ID, WEBSITE_ID, graph } from "@/lib/seo";
import SmoothScroll from "@/components/providers/SmoothScroll";
import CloudCanvas from "@/components/three/CloudCanvas";
import RevealController from "@/components/ui/RevealController";
import JourneyRail from "@/components/ui/JourneyRail";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Scripture and quotations. Not preloaded: the home page barely uses it, so it
// should not compete with Anton/Inter for the first paint there.
const cormorant = Cormorant_Garamond({
  weight: ["500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});

/**
 * Site-wide defaults only. Every page sets its own complete metadata via
 * lib/seo.ts - including its canonical, which deliberately does NOT live here:
 * metadata merges shallowly, so a canonical of "/" on the root layout would be
 * inherited by every page that forgot to override it.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Evidence of Life After Death`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#3e9bf0",
  width: "device-width",
  initialScale: 1,
};

// Who publishes this site, and the site itself. Pages reference these by @id
// as their author/publisher/isPartOf, so answer engines see one consistent
// entity behind every page.
const siteLd = graph(
  {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    email: "Eternaltruth303@gmail.com",
    description:
      "Eternal Truth examines near-death experiences, the scientific case for God, and what Scripture says about eternity.",
    // Mirrors the Footer contact block.
    sameAs: ["https://www.instagram.com/theeternaltruth.official/"],
  },
  {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  }
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Next 16 no longer neutralises CSS smooth scrolling during route
      // changes on its own; this opts back in so a navigation lands instantly.
      data-scroll-behavior="smooth"
      className={`${anton.variable} ${inter.variable} ${cormorant.variable} h-full`}
    >
      <body className="min-h-full">
        <JsonLd data={siteLd} />

        {/* Persistent WebGL sky, fixed behind all content. Each page picks its
            own journey through it (lib/journeys.ts). */}
        <CloudCanvas />

        {/* Arms scroll-reveal animations (content is visible without it) */}
        <RevealController />

        {/* Scroll progress rail, labelled for the current journey */}
        <JourneyRail />

        {/* Lenis momentum scroll wraps the document */}
        <SmoothScroll>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" className="relative z-10">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
