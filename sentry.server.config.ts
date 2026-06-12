import * as Sentry from "@sentry/nextjs";

/**
 * Server-side Sentry initialization (Node runtime).
 *
 * On Webflow Cloud this code runs inside a Cloudflare Worker (workerd) with
 * the `nodejs_compat` compatibility flag, via @opennextjs/cloudflare.
 * Sentry's Cloudflare guide for Next.js + OpenNext requires a worker
 * compatibility_date of 2025-08-16 or later for the SDK transport
 * (Node `https.request`) to work in that runtime.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Demo settings: capture everything. Lower these in a real app.
  tracesSampleRate: 1.0,

  // Send Sentry structured logs (Sentry.logger.*) from the server.
  enableLogs: true,

  debug: false,
});
