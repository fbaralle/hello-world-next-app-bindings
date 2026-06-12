import * as Sentry from "@sentry/nextjs";

/**
 * Next.js server instrumentation hook.
 *
 * On Webflow Cloud the app runs on Cloudflare Workers via
 * @opennextjs/cloudflare, which executes the Next.js *Node* server build
 * (NEXT_RUNTIME === "nodejs") inside workerd with the `nodejs_compat` flag.
 * The edge branch is kept for completeness (middleware, local dev).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Captures errors from nested React Server Components.
export const onRequestError = Sentry.captureRequestError;
