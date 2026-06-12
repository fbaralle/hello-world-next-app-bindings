import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Demo endpoint: emits a server-side Sentry structured log on every request.
 * The home page calls it on an interval, so a deployed app produces a steady
 * stream of server logs you can watch in Sentry's Logs view.
 *
 * Pass `?error=1` to throw — verifies server-side error capture
 * (instrumentation.ts → onRequestError) end to end.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedAt = new Date().toISOString();

  Sentry.logger.info("server: sentry-ping received", {
    path: url.pathname,
    requestedAt,
    userAgent: request.headers.get("user-agent") ?? "unknown",
  });

  if (url.searchParams.get("error") === "1") {
    throw new Error("sentry-ping: intentional test error (server)");
  }

  // Workers freeze I/O once the response is returned; flush so the
  // log/envelope is sent within the request lifetime.
  await Sentry.flush(2000);

  return NextResponse.json({
    ok: true,
    source: "server",
    requestedAt,
  });
}
