/** @type {import('next').NextConfig} */

// A games portal must run third-party game code (jsDelivr-hosted scripts, Ruffle,
// Unity/Construct exports, embedded SWFs). That requires a deliberately permissive
// Content-Security-Policy. We scope it as tightly as is practical while still letting
// games load. See DECISIONS.md for the trade-off rationale.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob: data:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' https: data: blob:",
  "font-src 'self' https: data:",
  "connect-src 'self' https: wss: data: blob:",
  "media-src 'self' https: data: blob:",
  "object-src 'self' https: data: blob:",
  "frame-src 'self' https: blob:",
  "child-src 'self' https: blob:",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self' https:",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'fullscreen=*, autoplay=*, gamepad=*, accelerometer=*, gyroscope=*',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Thumbnails are served locally from /public/games; allow modern formats.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1920],
    imageSizes: [120, 160, 200, 256, 320, 384],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Cleaned game HTML + assets are immutable build artifacts; cache hard.
        source: '/games/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
