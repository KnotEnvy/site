import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import CloudCanvas from "@/components/three/CloudCanvas";
import RevealController from "@/components/ui/RevealController";
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
  title: "Heaven or Hell — Real? | Evidence of Life After Death",
  description:
    "Near-death experiences as factual, bias-free evidence of the afterlife — and how they support the Bible. No biases. No opinions. Rooted in reality.",
  openGraph: {
    title: "Heaven or Hell — Real?",
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
