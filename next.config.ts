import path from "node:path";

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const hstsHeader = isDev
  ? []
  : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }];

function buildCsp(frameAncestors: string): string {
  return [
    "default-src 'self'",
    // React dev mode and Turbopack's HMR client need 'unsafe-eval'; production never does.
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    // Turbopack's HMR client connects over a websocket in dev.
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    // Lets the résumé page embed an uploaded PDF via <iframe> — either the local /uploads/
    // fallback (same-origin, covered by 'self') or Vercel Blob storage in production.
    "frame-src 'self' https://*.public.blob.vercel-storage.com",
    `frame-ancestors ${frameAncestors}`,
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...hstsHeader,
  { key: "Content-Security-Policy", value: buildCsp("'none'") },
];

// Uploaded files (résumé PDFs, screenshots, ...) need to be embeddable in an <iframe> on our
// own pages (see /resume), which `X-Frame-Options: DENY` / `frame-ancestors 'none'` above would
// block outright — those headers govern who may frame *this* response, including our own site.
// `frame-ancestors 'self'` still blocks third-party sites from framing uploaded files, just not us.
const uploadsHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  ...hstsHeader,
  { key: "Content-Security-Policy", value: buildCsp("'self'") },
];

const nextConfig: NextConfig = {
  // "standalone" packages a self-contained server for Docker self-hosting. Vercel does its own
  // output packaging and this option actively conflicts with it (missing .nft.json trace files
  // at build time), so only apply it outside of Vercel's build environment.
  output: process.env.VERCEL ? undefined : "standalone",
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/((?!uploads/).*)",
        headers: securityHeaders,
      },
      {
        source: "/uploads/:path*",
        headers: uploadsHeaders,
      },
    ];
  },
};

export default nextConfig;
