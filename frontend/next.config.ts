import type { NextConfig } from "next";

const securityHeaders = [
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: `default-src 'self'; connect-src 'self' ${process.env.NEXT_PUBLIC_BACKEND_API_URL || ''}; script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;`,
  },
  // Prevent clickjacking
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Prevent MIME-type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Referrer policy — limit referrer info sent to third parties
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Permissions policy — disable unused browser features
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), payment=()",
  },
  // DNS prefetch control
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // Strict Transport Security (HSTS) — enforced when behind Cloudflare/TLS
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Apply security headers to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Images — configure allowed domains when needed
  images: {
    remotePatterns: [],
  },

  // Logging — useful in development
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
