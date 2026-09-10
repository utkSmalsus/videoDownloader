# Fetchpoint

A media resolver for supported social platforms (YouTube, Instagram, X, Facebook). Paste a link,
get back normalized, provider-agnostic download formats.

Fetchpoint is a placeholder brand — swap the name/logo in [`src/components/icons/logo.tsx`](src/components/icons/logo.tsx)
whenever you're ready.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Zod 4 ·
React Three Fiber (hero only, lazy-loaded) · Motion for React · next-themes.

## Getting started

```bash
npm install
cp .env.example .env.local   # already defaults to the mock provider for local dev
npm run dev
```

Open http://localhost:3000. With `MEDIA_PROVIDER=mock` (the default outside production), every
platform page returns realistic sample data after a short delay — no real media is ever
downloaded, and the UI makes no claim that it was.

To use the real provider instead, set `MEDIA_PROVIDER=alldl` in `.env.local` and restart the dev
server. No paid media-extraction API is used anywhere in this project, and no self-hosted/VPS
component is required — AllDL is a plain HTTP call.

## Scripts

```bash
npm run dev         # start the dev server
npm run build        # production build (type-checks as part of the build)
npm run start        # run the production build
npm run lint          # eslint
npm run typecheck   # tsc --noEmit
npm test              # vitest
```

## Environment variables

See [`.env.example`](.env.example).

| Variable | Purpose |
|---|---|
| `MEDIA_PROVIDER` | `mock` for local development. Anything else (including unset) → AllDL, the only download provider. Production refuses to start with `mock`. |
| `MEDIA_PROVIDER_BASE_URL` | AllDL endpoint — `https://ahm7xmakki.com/api/alldl`. |
| `MEDIA_PROVIDER_TIMEOUT_MS` | Optional. Request timeout in ms, shared by AllDL and the YouTube Data API (default `15000`). |
| `YOUTUBE_DATA_API_KEY` | Server-side only. Used exclusively for "Download Course" playlist discovery — never for downloading media. Without it, "Download Video" works normally and "Download Course" returns a clean "temporarily unavailable" error. |

## Provider: AllDL only

Fetchpoint uses **no paid media-extraction API** and **no self-hosted/VPS component**. Every
platform — YouTube, Instagram, X, Facebook — resolves through AllDL
(`https://ahm7xmakki.com/api/alldl`), a single plain HTTP call
([`src/lib/providers/media-service.ts`](src/lib/providers/media-service.ts) →
[`src/lib/providers/adapters/shared.ts`](src/lib/providers/adapters/shared.ts)). The browser only
ever talks to our own `POST /api/media/resolve`; AllDL's own field names/shape never reach the
client. The quality list shown is exactly what AllDL returns for that URL — a full list, a single
"Best" result, or none at all — never a fabricated or hard-coded ladder.

### Download Course (YouTube playlists)

The `/youtube` page has a "Download Video" / "Download Course" switcher. Course mode is an
**orchestrator**, not a separate download engine:

```
playlist URL → YouTube Data API (discovery only) → individual lesson URLs → AllDL, one per lesson
```

1. Paste a playlist URL — either `youtube.com/playlist?list=ID` or a video URL that also carries
   `&list=ID`. A plain video URL, channel URL, or search URL is rejected with a message asking
   for a playlist link instead — course mode never downloads an entire channel.
2. [`/api/media/youtube-course`](src/app/api/media/youtube-course/route.ts) calls the official
   **YouTube Data API v3** (`playlistItems.list`, paginated via `nextPageToken` until every item
   is retrieved; `videos.list` batched up to 50 IDs per call for durations) — no scraping, no
   yt-dlp. Deleted/private items are skipped rather than failing the whole course.
3. Each selected lesson is then downloaded through the exact same `POST /api/media/resolve`
   endpoint the single-video page uses — no separate course-specific download route — sequentially
   (not concurrently — AllDL is a third-party service with no known-safe concurrency limit). The
   client picks the closest quality AllDL actually returned (never a fabricated one) and fetches
   that format's AllDL CDN URL directly, the same URL a single-video `<a href download>` would use
   — never proxied through Fetchpoint's own server, which avoids imposing a server-side timeout
   shorter than AllDL's CDN can deliver a large file. The playlist URL itself is never sent to
   AllDL — only each lesson's own video URL is.

`YOUTUBE_DATA_API_KEY` (get one from the
[Google Cloud Console](https://console.cloud.google.com/apis/credentials) after enabling "YouTube
Data API v3") is required for step 2 only. Missing/invalid key, quota exceeded, and
not-found/private playlists all return a clean application-level error — never Google's raw
response.

### History

Fetchpoint's history feature stores resolved title/thumbnail/formats for display, but "Download
again" always re-navigates to the platform page to re-resolve a fresh link rather than replaying a
stored download URL — so a link that's since expired never breaks history, just re-triggers a new
one.

Using AllDL and the YouTube Data API in production must comply with each service's own terms and
with the terms/copyright rules of whichever platform (YouTube, Instagram, X, Facebook) the media
came from. Fetchpoint is not affiliated with, endorsed by, or sponsored by any of those platforms.

Fetchpoint's history feature stores resolved title/thumbnail/formats for display, but "Download
again" always re-navigates to the platform page to re-resolve a fresh link rather than replaying a
stored download URL — so a job that's since expired never breaks history, just re-triggers a new
one.

To add or swap a provider later: [`src/lib/providers/http-client.ts`](src/lib/providers/http-client.ts)
(the request) and an adapter under
[`src/lib/providers/adapters/`](src/lib/providers/adapters) (schema + normalization) are all that
need to change — the `MediaProvider` interface and every UI component stay untouched.

## Architecture

```
src/
  app/                    # routes (server components by default)
    api/media/resolve/          # resolves a URL to a normalized MediaResult (AllDL) — used by
                                 # both the single-video page AND each course lesson download
    api/media/youtube-course/   # lists a YouTube playlist's lessons via the YouTube Data API
    youtube/ instagram/ x/ facebook/
    history/ settings/
  components/
    layout/               # sidebar, mobile drawer, header, theme toggle
    downloader/            # the reusable paste → result flow (shared by home + platform pages)
    3d/                     # hero scene, lazy-loaded, ssr:false
    marketing/               # homepage-only sections
    ui/                       # button, input — the shared design-system primitives
  lib/
    config/platforms.ts     # single source of truth for supported platforms/domains
    validation/url.ts         # platform detection + the request Zod schema
    providers/                  # MediaProvider abstraction, AllDL adapters, mock provider
    youtube/playlist.ts            # YouTube Data API playlist discovery (Download Course only)
    rate-limit/                  # swappable rate limiter (in-memory now, Redis-ready)
    security/ssrf.ts               # private-IP guard for any server-side fetch
    storage/                        # localStorage-backed history/preferences (useSyncExternalStore)
  types/media.ts                    # the normalized schema returned to the client
```

## Security notes

- Provider credentials are read only from `process.env` inside server-only modules — never
  `NEXT_PUBLIC_*`, never sent to the client, never returned in an API response or logged.
- Every request is re-validated server-side with Zod, independent of the client's own checks.
- Only URLs matching a configured platform domain are ever accepted (`src/lib/validation/url.ts`).
- `src/lib/security/ssrf.ts` is available for any future server-side fetch of a provider-supplied
  URL — not currently needed by `/api/media/resolve`, which only ever calls AllDL's own fixed,
  configured base URL, never a client- or provider-supplied host.
- Basic per-IP rate limiting on `/api/media/resolve` and `/api/media/youtube-course` (swap the
  in-memory store for Redis/Upstash in production — see `src/lib/rate-limit/index.ts`).
- Errors are mapped to safe, generic messages; raw exceptions/stack traces — and the YouTube Data
  API's raw error responses — are never returned to the browser.

## Deploying

Any Next.js host (Vercel, etc.) works out of the box — `npm run build && npm run start`, or the
platform's native Next.js build. Set the environment variables above in the host's
dashboard/secrets manager. There's no database and no auth, so no other infrastructure is
required for the current feature set.
