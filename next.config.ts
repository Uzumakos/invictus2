import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve("."),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // Allow any HTTPS image URL
    ],
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
