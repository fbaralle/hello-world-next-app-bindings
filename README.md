# hello-world-next-app-bindings

A **Next.js** starter for [**Webflow Cloud**](https://webflow.com/cloud) with Cloudflare bindings (D1, R2, KV) wired in.

At deploy time, Webflow Cloud provisions the configured services and injects them into your app as typed bindings — no API keys, no connection strings.

> Looking for the plain vanilla variant (no bindings)?
> See [`hello-world-next-app`](https://github.com/Webflow-Examples/hello-world-next-app).

[![Deploy to Webflow](https://webflow.com/img/deploy-dark.svg)](https://webflow.com/dashboard/cloud/deploy?repo=https://github.com/Webflow-Examples/hello-world-next-app-bindings)

## What's included

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- `@opennextjs/cloudflare` for deploying Next.js to Cloudflare Workers via Webflow Cloud
- `wrangler.json` with **D1** (SQL), **R2** (object storage), **KV · Sessions**, and **KV · Flags** declared
- `/api/binding-status` — a live health check that pings every binding
- Branded landing page that renders real-time binding status

## Quickstart

```bash
npm install

# Run locally (no bindings)
npm run dev

# Run locally against real bindings (via wrangler)
npm run dev:cf
```

## Deploy to Webflow Cloud

1. Fork this repo.
2. In your Webflow site, open **Apps → Webflow Cloud → Create new app** and select this repo.
3. Webflow Cloud reads `wrangler.json` and provisions D1, R2, and KV automatically.
4. Pick a mount path (e.g. `/app`) and click **Deploy**.

Full walkthrough: <https://developers.webflow.com/webflow-cloud/quickstart>.

## Bindings map

| Binding        | Type | Where it's declared       | Learn more                                                                |
| -------------- | ---- | ------------------------- | ------------------------------------------------------------------------- |
| `DB`           | D1   | `wrangler.json`           | [D1 docs](https://developers.webflow.com/webflow-cloud/storing-data/sqlite)       |
| `MEDIA`        | R2   | `wrangler.json`           | [R2 docs](https://developers.webflow.com/webflow-cloud/storing-data/object-storage)       |
| `SESSIONS`     | KV   | `wrangler.json`           | [KV docs](https://developers.webflow.com/webflow-cloud/storing-data/key-value-store)       |
| `FLAGS`        | KV   | `wrangler.json`           | [Flags docs](https://developers.webflow.com/webflow-cloud/storing-data/key-value-store) |

Access them from any route handler via `getCloudflareContext()`:

```ts
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  const { env } = await getCloudflareContext();
  const rows = await env.DB.prepare("SELECT 1").first();
  return Response.json({ rows });
}
```

See `src/app/api/binding-status/route.ts` for a full working example that pings all four bindings.

## Sentry integration (this branch)

This branch adds a working [Sentry](https://docs.sentry.io/platforms/javascript/guides/nextjs/) setup for Webflow Cloud, following the official `@sentry/nextjs` manual setup plus Sentry's [Cloudflare/OpenNext guidance](https://docs.sentry.io/platforms/javascript/guides/cloudflare/frameworks/nextjs/):

| File                            | Purpose                                                      |
| ------------------------------- | ------------------------------------------------------------ |
| `next.config.ts`                | Wrapped with `withSentryConfig` (preserved by the Webflow Cloud builder) |
| `src/instrumentation.ts`        | Server init + `onRequestError` capture                       |
| `src/instrumentation-client.ts` | Browser init (logs + traces)                                 |
| `sentry.server.config.ts`       | Server-side `Sentry.init` with a fetch-based transport (runs on the Cloudflare Worker) |
| `sentry.edge.config.ts`         | Edge-runtime `Sentry.init` (middleware; unused here)         |
| `src/app/global-error.tsx`      | Root error boundary reporting to Sentry                      |
| `src/app/api/sentry-ping/route.ts` | Emits a server-side Sentry log on every request           |
| `src/app/components/SentryPinger.tsx` | Pings the API every 30s; emits a browser-side log per round trip; buttons to trigger test errors |

### Setup

1. Create a Sentry project (platform: Next.js) and copy its DSN.
2. Set `NEXT_PUBLIC_SENTRY_DSN` in your Webflow Cloud app's environment variables (it's inlined at build time into both browser and server bundles).
3. Optional, for readable stack traces: also set `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` to upload source maps during the build.
4. Deploy. Open the app and watch your Sentry project's **Logs** view: each 30s ping produces one `server:` and one `client:` log entry. Use the buttons to trigger a test error from the browser or the server.

### Webflow Cloud / Cloudflare Workers caveats

- The app runs on Cloudflare Workers (workerd), not Node. Sentry's default server transport sends events with Node's `https.request`, which workerd only provides at `compatibility_date >= 2025-08-16` — and Webflow Cloud currently deploys workers with an older date, so out of the box **server-side events are dropped silently**. This example works around that: `sentry.server.config.ts` overrides the transport with a `fetch`-based one, which works on every compatibility date. Keep that override when adapting this setup.
- Don't use Sentry's `tunnelRoute` option: it registers the tunnel at a fixed path that doesn't account for the mount path Webflow Cloud serves your app under.

## Customizing

The landing page lives in `src/app/page.tsx`. The binding status component is
`src/app/components/BindingsStatus.tsx`. Styles are in `src/app/globals.css`
under the `wf-*` prefix.

## Learn more

- [Webflow Cloud docs](https://developers.webflow.com/webflow-cloud)
- [Bindings guide](https://developers.webflow.com/webflow-cloud/storing-data/overview)
- [Next.js on Webflow Cloud](https://developers.webflow.com/webflow-cloud/frameworks/next-js)

---

Built with Next.js · Deployed on Webflow Cloud.
