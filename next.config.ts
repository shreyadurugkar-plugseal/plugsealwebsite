import type { NextConfig } from "next";

// When set, this deployment is frontend-only: every /api request is proxied to
// the backend (e.g. the Railway service). The browser still sees a single
// origin, so session cookies stay first-party and no CORS is needed.
const backendUrl = process.env.API_BACKEND_URL?.replace(/\/+$/, "");

if (process.env.VERCEL && !backendUrl) {
  throw new Error(
    "API_BACKEND_URL is not set. On Vercel this app runs frontend-only and needs the " +
      "backend URL (e.g. https://your-app.up.railway.app) in Project → Settings → Environment Variables."
  );
}
if (backendUrl && !/^https?:\/\//.test(backendUrl)) {
  throw new Error(`API_BACKEND_URL must start with http:// or https:// (got "${backendUrl}")`);
}

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendUrl) return [];
    // beforeFiles so the proxy wins over this app's own /api route handlers.
    return {
      beforeFiles: [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          // Browsers must always re-check the worker so updates roll out promptly.
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
