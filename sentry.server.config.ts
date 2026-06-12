import * as Sentry from "@sentry/nextjs";
import type { BaseTransportOptions, Transport, TransportMakeRequestResponse, TransportRequest } from "@sentry/core";

/**
 * Fetch-based transport.
 *
 * On Webflow Cloud the app runs inside a Cloudflare Worker (workerd) with the
 * `nodejs_compat` flag, via @opennextjs/cloudflare. The Sentry Node SDK's
 * default transport sends events with Node's `https.request`, which workerd
 * only provides at compatibility_date >= 2025-08-16 — on older dates events
 * are dropped silently. `fetch` works on every compatibility date, so this
 * transport makes server-side Sentry work regardless of the worker's date.
 */
function makeFetchTransport(options: BaseTransportOptions): Transport {
  return Sentry.createTransport(options, async (request: TransportRequest): Promise<TransportMakeRequestResponse> => {
    // request.body is string | Uint8Array; workers-types' BodyInit doesn't
    // include the generic Uint8Array type, hence the cast.
    const response = await fetch(options.url, {
      method: "POST",
      body: request.body as BodyInit,
      headers: options.headers,
    });
    return {
      statusCode: response.status,
      headers: {
        "x-sentry-rate-limits": response.headers.get("X-Sentry-Rate-Limits"),
        "retry-after": response.headers.get("Retry-After"),
      },
    };
  });
}

/**
 * Server-side Sentry initialization (Node runtime).
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  transport: makeFetchTransport,

  // Demo settings: capture everything. Lower these in a real app.
  tracesSampleRate: 1.0,

  // Send Sentry structured logs (Sentry.logger.*) from the server.
  enableLogs: true,

  debug: false,
});
