import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
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
  title: "Heaven or Hell. Real? | Evidence of Life After Death",
  description:
    "Millions of near-death experiences point to the same conclusion: God is real, and death is not the end. Watch the testimony, weigh the science, and decide for yourself.",
  openGraph: {
    title: "Heaven or Hell. Real?",
    description:
      "Evidence of life after death, scientifically examined through near-death experiences.",
    type: "website",
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
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} h-full`}>
      <body className="min-h-full">
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
