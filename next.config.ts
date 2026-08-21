import type { NextConfig } from "next";

// Uygulamanın gerçekten kullandığı dış servisler baz alınarak yazıldı:
// Supabase (auth/db/realtime), Cloudflare Turnstile (captcha), Google Analytics,
// Microsoft Clarity, Vercel Analytics/Insights, Google (OAuth ikonu/gstatic).
const SUPABASE_ORIGIN = "https://kyjiecfkzelkqkiezxkk.supabase.co";

const csp = [
  `default-src 'self'`,
  // Not: script-src'de 'unsafe-inline' hâlâ var (Clarity/GA snippet'leri nonce'suz
  // enjekte ediliyor). İleride nonce tabanlı bir çözüme geçilirse kaldırılabilir.
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://challenges.cloudflare.com https://va.vercel-scripts.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://www.gstatic.com https://www.google-analytics.com https://*.clarity.ms`,
  `font-src 'self' data:`,
  `connect-src 'self' ${SUPABASE_ORIGIN} wss://${SUPABASE_ORIGIN.replace("https://", "")} https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.clarity.ms https://*.clarity.ms https://challenges.cloudflare.com https://vitals.vercel-insights.com`,
  `frame-src https://challenges.cloudflare.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
