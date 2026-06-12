import * as Sentry from "@sentry/nextjs";

/**
 * Edge-runtime Sentry initialization (middleware / edge routes).
 * Included for completeness; this example app has no middleware.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enableLogs: true,
  debug: false,
});
