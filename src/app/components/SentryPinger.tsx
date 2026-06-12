"use client";

import * as Sentry from "@sentry/nextjs";
import { useCallback, useEffect, useState } from "react";

/**
 * Join the app's base mount path with an API path (same helper as
 * BindingsStatus). Next.js's `basePath` only auto-prefixes
 * <Link>/<Image>/router — not fetch().
 */
function buildAppUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
}

const PING_INTERVAL_MS = 30_000;

/**
 * Calls /api/sentry-ping on load and every 30s. Each round trip produces:
 *  - a server-side Sentry log (emitted inside the API route), and
 *  - a browser-side Sentry log (emitted here after the response).
 * The buttons trigger a client / server error to verify error capture.
 */
export default function SentryPinger() {
  const [lastPing, setLastPing] = useState<string>("waiting…");
  const [pingCount, setPingCount] = useState(0);

  const ping = useCallback(async () => {
    const startedAt = Date.now();
    try {
      const res = await fetch(buildAppUrl("api/sentry-ping"));
      const body = (await res.json()) as { requestedAt?: string };

      Sentry.logger.info("client: sentry-ping completed", {
        status: res.status,
        durationMs: Date.now() - startedAt,
        serverTime: body.requestedAt ?? "unknown",
      });

      setPingCount((n) => n + 1);
      setLastPing(new Date().toLocaleTimeString());
    } catch (err) {
      Sentry.logger.error("client: sentry-ping failed", {
        durationMs: Date.now() - startedAt,
        message: err instanceof Error ? err.message : String(err),
      });
      setLastPing("failed — see console / Sentry");
    }
  }, []);

  useEffect(() => {
    // Deferred so the first ping (and its setState) runs outside the effect body.
    const initial = setTimeout(() => void ping(), 0);
    const id = setInterval(() => void ping(), PING_INTERVAL_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [ping]);

  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return (
      <section className="wf-bindings" aria-label="Sentry status">
        <p className="wf-subtitle">
          Sentry is not configured — set <code>NEXT_PUBLIC_SENTRY_DSN</code> in
          your environment variables to enable it.
        </p>
      </section>
    );
  }

  return (
    <section className="wf-bindings" aria-label="Sentry status">
      <p className="wf-subtitle">
        Sentry demo · pings <code>/api/sentry-ping</code> every{" "}
        {PING_INTERVAL_MS / 1000}s · pings sent: {pingCount} · last:{" "}
        {lastPing}
      </p>
      <div className="wf-cta">
        <button
          className="wf-btn wf-btn-ghost"
          type="button"
          onClick={() => {
            throw new Error("sentry-ping: intentional test error (browser)");
          }}
        >
          Trigger client error
        </button>
        <button
          className="wf-btn wf-btn-ghost"
          type="button"
          onClick={() => void fetch(buildAppUrl("api/sentry-ping?error=1"))}
        >
          Trigger server error
        </button>
      </div>
    </section>
  );
}
