import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Canonical domain is the apex (mefaltauna.com). Any request that
  // arrives on www.mefaltauna.com is sent to the bare apex with a
  // 308 (permanent, method-preserving) so search engines and link
  // shares converge on a single URL — and Wompi callbacks land on
  // the same host they started from.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.mefaltauna.com" }],
        destination: "https://mefaltauna.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
