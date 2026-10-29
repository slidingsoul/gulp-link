# gulp.

**Big links. Tiny gulps.** A playful frontend for the [snap-link](../snap-link) URL shortener.

Paste a long URL, get a six-character link you can copy, open, or turn into a QR code. Links are protected by Neon Managed Better Auth (email + password), and your recent links are remembered locally per account.

## Features

- Email/password sign-up, sign-in, and sign-out via Neon Managed Better Auth
- Shorten any `http(s)` URL with snap-link's `POST /snap`
- Copy, open, and download a QR code for every short link
- Per-user recent-link history in `localStorage` (up to 50 links)
- Friendly validation and error messages for bad URLs, expired sessions, and the 5-per-minute rate limit
- Hand-drawn mascot with idle, gulping, happy, and confused moods

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- `@neondatabase/auth` for auth and JWT retrieval
- `qrcode.react` for QR codes
- `lucide-react` for icons
- Bricolage Grotesque + Inter via Fontsource

## Quick start

### 1. Run the backend

From the sibling `snap-link` repo:

```bash
cd ../snap-link
go run main.go
```

It should listen on `http://localhost:8081`. Check it with:

```bash
curl http://localhost:8081/health
# {"status":"healthy"}
```

The backend needs its own `.env` with `DATABASE_URL` and `NEON_AUTH_BASE_URL`, plus the `links` table from its migrations. Optionally set `PUBLIC_BASE_URL` (e.g. `http://localhost:8081`) so snap-link returns localhost links, and `CORS_ALLOWED_ORIGINS` if the browser calls it directly. This frontend does not change the backend.

### 2. Configure the frontend

```bash
cp .env.example .env.local
```

Fill in `VITE_NEON_AUTH_URL` with the same value as snap-link's `NEON_AUTH_BASE_URL`:

```
https://ep-xxxxx.neonauth.<region>.aws.neon.tech/neondb/auth
```

The other defaults work for local development.

### 3. Install and run

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

> The repo includes an `.npmrc` with `legacy-peer-deps=true`. Without it, npm 10 can fail on this Vite/React peer graph with `Cannot read properties of null (reading 'edgesOut')`. The dependency tree is valid; the flag only relaxes npm's peer resolver. If you copy the project without `.npmrc`, run `npm install --legacy-peer-deps`.

## Environment variables

| Variable | Default | What it does |
| --- | --- | --- |
| `VITE_NEON_AUTH_URL` | — (required) | Neon Auth base URL, e.g. `https://…/neondb/auth` |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:8081` | Where Vite forwards `/api/*` in dev |
| `VITE_AUTH_ORIGIN` | `http://localhost:8081` | `Origin` header the dev proxy sends to Neon Auth. Must be a trusted domain in Neon. |
| `VITE_AUTH_MODE` | `proxy` | `proxy` (same-origin dev proxy) or `direct` (cross-origin Neon calls) |
| `VITE_API_BASE` | `/api` | API base path used by the browser |
| `VITE_SHORT_BASE_URL` | — (uses API `link`) | Optional override for the origin used when displaying/copying short links |

## How networking works

The Vite dev server proxies both services so local development stays same-origin:

- `/api/*` → `VITE_API_PROXY_TARGET` (snap-link), with `Origin` rewritten to the API origin
- `/auth/*` → `VITE_NEON_AUTH_URL`, with the `Origin` header rewritten to `VITE_AUTH_ORIGIN`

snap-link also supports CORS via `CORS_ALLOWED_ORIGINS` for direct browser calls; the proxy keeps local dev working without needing that setting. The auth client talks to `http://localhost:5173/auth`, so the session cookie is same-origin. The proxy forwards it to Neon, and the `Origin` rewrite satisfies Neon's trusted-domain check using snap-link's existing `http://localhost:8081` entry.

### Direct mode

If you prefer the browser to call Neon Auth directly:

```env
VITE_AUTH_MODE=direct
```

Then add `http://localhost:5173` to **Neon Console → Branch → Auth → Trusted domains**. Direct mode relies on cross-site cookies (`SameSite=None; Secure`), which some browsers block by default, so proxy mode is recommended for local work.

### Production

The proxy is a dev-server feature. For a real deployment you need one of:

- Serve the frontend and API behind the same origin/reverse proxy (`/api` and `/auth` routed upstream), or
- Set `CORS_ALLOWED_ORIGINS` on snap-link to the frontend origin, point `VITE_API_BASE` at the backend URL, and use `VITE_AUTH_MODE=direct` (plus add the frontend origin to Neon's trusted domains), and
- Set `PUBLIC_BASE_URL` on snap-link to the public backend origin, or set `VITE_SHORT_BASE_URL` to override the displayed origin.

## Scripts

```bash
npm run dev        # Vite dev server with /api and /auth proxies
npm run build      # Type-check and build for production
npm run typecheck  # TypeScript only
npm run lint       # oxlint
npm run preview    # Preview the production build (with the same proxy config)
```

## Behavior notes

- **Short links** come from `POST /snap` as both `link` (the full shareable URL) and `short_code` (the bare code). The UI uses `link` unless `VITE_SHORT_BASE_URL` overrides the origin.
- **JWT caching**: the Neon JWT is cached until 30 seconds before `exp`. A `401` from `/snap` triggers one forced refresh and a retry; if that fails, the app signs out and asks you to sign in again.
- **Rate limit**: snap-link allows 5 links per minute per user (keyed on the JWT `sub`). A `401` doesn’t consume quota, and the UI uses the `Retry-After` header from a `429` to show the remaining seconds.
- **History**: there is no server-side list endpoint, so recent links live in `localStorage` under `gulp:recent:<userId>`. They survive reloads and sync across tabs, but not across browsers or devices.
- **Validation**: the client mirrors the server's rules (trim, 2,048 characters max, no spaces, `http`/`https` only, bare hosts get `https://`). The server remains the source of truth.

## Project structure

```
src/
  components/     UI: auth screen, shorten form, result card, history, mascot, toasts
  components/ui/  Button, Field, Spinner
  hooks/          Session, shorten, recent links, toasts
  lib/            Auth client, API client, URL validation, storage, clipboard, formatting
  App.tsx         Session-aware shell
  index.css       Tailwind design tokens, textures, animations
```

## Troubleshooting

**“Can’t reach the API. Is snap-link running on :8081?”**
Start the backend (`go run main.go` in `../snap-link`) and confirm `curl http://localhost:8081/health`.

**Sign-in works but requests fail with 401**
The JWT may have expired. Sign in again. If it happens immediately, make sure the backend's `NEON_AUTH_BASE_URL` points at the same Neon Auth branch as `VITE_NEON_AUTH_URL`.

**Auth requests fail with a trusted-domain / CORS error**
Use the default `VITE_AUTH_MODE=proxy`. If you switch to `direct`, add `http://localhost:5173` to Neon's trusted domains and allow third-party cookies for localhost.

**API requests fail with a CORS error**
Use the default `/api` proxy in dev. If you call snap-link directly, set `CORS_ALLOWED_ORIGINS` on the backend to the frontend origin and point `VITE_API_BASE` at the backend URL.

**“You’ve hit your 5-links-per-minute limit”**
Wait for the number of seconds shown. The limit is per signed-in user.

**Recent links disappeared**
History is per user and per browser. Signing in as a different user shows a different list. Clearing site data removes it.
