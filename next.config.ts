import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow viewing the dev server from the local network (phones, other
  // machines) without Next blocking cross-origin dev resources.
  allowedDevOrigins: ["172.19.224.1", "localhost", "127.0.0.1"],
};

export default nextConfig;
