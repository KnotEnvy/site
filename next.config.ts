import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow viewing the dev server from the local network (phones, other
  // machines) without Next blocking cross-origin dev resources.
  allowedDevOrigins: ["172.19.224.1", "localhost", "127.0.0.1"],

  images: {
    // Video cards use the real YouTube thumbnails for the real videos.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },

  // StrictMode's dev-only mount→cleanup→remount cycle makes react-three-fiber
  // schedule a delayed forceContextLoss() against the live canvas, killing the
  // WebGL context ~500ms after startup on EVERY machine (it was never a flaky
  // GPU). The recovery path then locks the sky into "lite" mode, hiding the
  // bloom + set-pieces in dev. Production builds never double-invoke, so this
  // changes nothing for the shipped site.
  reactStrictMode: false,
};

export default nextConfig;
