import * as Sentry from "@sentry/nextjs";

/**
 * Browser-side Sentry initialization. Runs once when the app loads in the
 * browser. The DSN is inlined at build time from NEXT_PUBLIC_SENTRY_DSN —
 * set it in your Webflow Cloud environment variables before deploying.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Demo settings: capture everything. Lower these in a real app.
  tracesSampleRate: 1.0,

  // Send Sentry structured logs (Sentry.logger.*) from the browser.
  enableLogs: true,

  // Log a console line when an event can't be sent — handy while verifying.
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
