import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
const isLocalSupabase = supabaseUrl !== null && ["127.0.0.1", "localhost"].includes(supabaseUrl.hostname);
const isDev = process.env.NODE_ENV === "development";

// Storage (images, videos) and the REST/Auth endpoints all live on the Supabase origin.
const supabaseOrigin = supabaseUrl ? supabaseUrl.origin : "";

/**
 * `script-src` keeps 'unsafe-inline' on purpose: Next's bootstrap scripts are inline, and the
 * nonce alternative forces every page to render dynamically, which would throw away the static
 * /ISR caching the whole site is built around. External scripts are still blocked by 'self'.
 */
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
  `media-src 'self' blob: ${supabaseOrigin}`.trim(),
  `font-src 'self' data:`,
  `connect-src 'self' ${supabaseOrigin}${isDev ? " ws: http://127.0.0.1:* http://localhost:*" : ""}`.trim(),
  `frame-src 'none'`,
  `worker-src 'self' blob:`,
  `manifest-src 'self'`,
  ...(isDev ? [] : [`upgrade-insecure-requests`]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  // Don't advertise the framework/version.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      ...(supabaseUrl
        ? [
            {
              protocol: supabaseUrl.protocol === "http:" ? ("http" as const) : ("https" as const),
              hostname: supabaseUrl.hostname,
              port: supabaseUrl.port,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
    // Next 16 refuses to optimise images from loopback IPs; only relax that for local Supabase.
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
};

export default nextConfig;
