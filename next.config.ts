import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// User's custom Next.js configuration
// NOTE: basePath is handled by Webflow Cloud builder
const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Expose the mount path to client code as an env var so client-side
  // fetch() calls can prefix it (Next.js's basePath only auto-prefixes
  // <Link>/<Image>/router, not fetch).
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.COSMIC_MOUNT_PATH || '',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],
  },
};

// Wrap with Sentry. The Webflow Cloud builder preserves this wrapper —
// it merges its own basePath/assetPrefix on top of the resolved config.
// org / project / authToken are only needed for source-map upload; the
// app builds and reports events without them.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
});
