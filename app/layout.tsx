import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import SmoothScroll from "@/components/providers/SmoothScroll";
import CloudCanvas from "@/components/three/CloudCanvas";
import RevealController from "@/components/ui/RevealController";
import DescentRail from "@/components/ui/DescentRail";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | Evidence of Life After Death`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  keywords: [
    "near-death experience",
    "NDE",
    "life after death",
    "heaven",
    "hell",
    "afterlife evidence",
    "NDE testimonies",
    "consciousness after death",
  ],
  openGraph: {
    title: SITE_NAME,
    description:
      "Evidence of life after death, scientifically examined through near-death experiences.",
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Heaven or Hell. Real? A headline over sunlit clouds at the start of the descent.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Evidence of life after death, scientifically examined through near-death experiences.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#3e9bf0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
  };

  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} h-full`}>
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Persistent WebGL sky of drifting clouds, fixed behind all content */}
        <CloudCanvas />

        {/* Arms scroll-reveal animations (content is visible without it) */}
        <RevealController />

        {/* Heaven→Hell scroll progress rail */}
        <DescentRail />

        {/* Lenis momentum scroll wraps the document */}
        <SmoothScroll>
          <Header />
          <main className="relative z-10">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
