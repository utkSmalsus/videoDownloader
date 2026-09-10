import { z } from "zod";
import type { CourseResult } from "@/types/media";
import { ProviderError } from "@/lib/providers/types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const DEFAULT_TIMEOUT_MS = 15_000;
// Sane cap so one huge playlist can't turn a single request into hundreds of API calls.
const MAX_PLAYLIST_ITEMS = 500;

/** youtube.com/youtu.be domains this accepts a playlist link from — mirrors
 *  PLATFORMS.youtube.domains (src/lib/config/platforms.ts) without importing UI config into a
 *  server-only data module. */
const YOUTUBE_HOSTS = ["youtube.com", "youtu.be", "youtube-nocookie.com"];

function isYouTubeHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\.|^m\./, "");
  return YOUTUBE_HOSTS.some((d) => host === d || host.endsWith(`.${d}`));
}

/** Extracts a playlist ID from either a dedicated playlist URL or a video URL that also carries
 *  a `list` param — both are valid "Download Course" inputs. Returns null for anything else
 *  (a plain video URL with no list, a channel URL, a search URL, a non-YouTube URL) so the
 *  caller can tell the user a playlist URL is required, rather than guessing at intent. */
export function extractPlaylistId(rawUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  if (!isYouTubeHost(parsed.hostname)) return null;

  const listId = parsed.searchParams.get("list");
  if (!listId || !/^[a-zA-Z0-9_-]{10,64}$/.test(listId)) return null;
  return listId;
}

function logResolution(entry: { success: boolean; latencyMs: number; errorCategory?: string }) {
  // Structured, no URLs/API key — safe to ship to any log aggregator as-is.
  console.log(JSON.stringify({ provider: "youtube-data-api", at: new Date().toISOString(), ...entry }));
}

interface YouTubeApiErrorBody {
  error?: { errors?: { reason?: string }[] };
}

/** Shared call to YouTube Data API v3. The API key is read from env and appended here only —
 *  never accepted as a parameter from a caller, never logged, never present in a thrown message. */
async function callYouTubeApi(path: string, params: Record<string, string>): Promise<unknown> {
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;
  if (!apiKey) {
    throw new ProviderError("YouTube Course downloads are temporarily unavailable.", "provider_error");
  }

  const url = new URL(`${YOUTUBE_API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("key", apiKey);

  const timeoutMs = Number(process.env.MEDIA_PROVIDER_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new ProviderError("YouTube Data API timed out", "network_error");
    }
    throw new ProviderError("YouTube Data API request failed", "network_error");
  }

  if (!res.ok) {
    let reason: string | undefined;
    try {
      const body = (await res.json()) as YouTubeApiErrorBody;
      reason = body.error?.errors?.[0]?.reason;
    } catch {
      // no JSON body — fine, reason stays undefined
    }
    if (res.status === 403 && reason === "quotaExceeded") {
      throw new ProviderError("YouTube Data API quota exceeded", "rate_limited");
    }
    if (res.status === 404 || reason === "playlistNotFound") {
      throw new ProviderError("Playlist not found", "provider_error");
    }
    if (res.status === 403) {
      throw new ProviderError("This playlist isn't accessible", "provider_error");
    }
    throw new ProviderError(`YouTube Data API responded ${res.status}`, "provider_error");
  }

  try {
    return await res.json();
  } catch {
    throw new ProviderError("YouTube Data API returned malformed JSON", "provider_error");
  }
}

const thumbnailSchema = z.object({ url: z.string().nullish() }).nullish();
const playlistItemSchema = z.object({
  snippet: z
    .object({
      title: z.string().nullish(),
      position: z.number().nullish(),
      resourceId: z.object({ videoId: z.string().nullish() }).nullish(),
      thumbnails: z.record(z.string(), thumbnailSchema).nullish(),
    })
    .nullish(),
});
const playlistItemsResponseSchema = z.object({
  items: z.array(playlistItemSchema).nullish(),
  nextPageToken: z.string().nullish(),
});

const playlistMetaResponseSchema = z.object({
  items: z.array(z.object({ snippet: z.object({ title: z.string().nullish() }).nullish() })).nullish(),
});

const videoDurationResponseSchema = z.object({
  items: z.array(z.object({ id: z.string(), contentDetails: z.object({ duration: z.string().nullish() }).nullish() })).nullish(),
});

function pickThumbnail(thumbnails: Record<string, { url?: string | null } | null | undefined> | null | undefined): string | null {
  if (!thumbnails) return null;
  const preferred = thumbnails.medium ?? thumbnails.default ?? Object.values(thumbnails)[0];
  return preferred?.url ?? null;
}

const ISO_DURATION_PATTERN = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;

function parseIsoDuration(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const match = iso.match(ISO_DURATION_PATTERN);
  if (!match) return null;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : null;
}

interface RawPlaylistItem {
  videoId: string;
  title: string;
  thumbnail: string | null;
  position: number;
}

/** Follows nextPageToken until every item is retrieved (or MAX_PLAYLIST_ITEMS is hit), skipping
 *  unavailable entries (deleted/private videos have no resourceId.videoId or a placeholder
 *  title) instead of failing the whole course over one bad item. */
async function fetchPlaylistItems(playlistId: string): Promise<RawPlaylistItem[]> {
  const items: RawPlaylistItem[] = [];
  let pageToken: string | undefined;

  do {
    const raw = await callYouTubeApi("/playlistItems", {
      part: "snippet",
      playlistId,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    });
    const parsed = playlistItemsResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ProviderError("YouTube Data API returned a malformed playlist response", "provider_error");
    }

    for (const item of parsed.data.items ?? []) {
      const videoId = item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title;
      if (!videoId || !title || title === "Private video" || title === "Deleted video") continue;
      items.push({
        videoId,
        title,
        thumbnail: pickThumbnail(item.snippet?.thumbnails),
        position: item.snippet?.position ?? items.length,
      });
    }
    pageToken = parsed.data.nextPageToken ?? undefined;
  } while (pageToken && items.length < MAX_PLAYLIST_ITEMS);

  return items.sort((a, b) => a.position - b.position);
}

/** Best-effort — a missing/failed title lookup falls back to "Untitled course" rather than
 *  failing a course whose lessons were already retrieved successfully. */
async function fetchPlaylistTitle(playlistId: string): Promise<string | null> {
  try {
    const raw = await callYouTubeApi("/playlists", { part: "snippet", id: playlistId });
    const parsed = playlistMetaResponseSchema.safeParse(raw);
    return parsed.success ? parsed.data.items?.[0]?.snippet?.title ?? null : null;
  } catch {
    return null;
  }
}

/** Batched duration lookup (up to 50 video IDs per call, per the Data API's own limit) — never
 *  one request per lesson. Best-effort per batch: a failed batch just leaves those durations
 *  null rather than failing the whole course over cosmetic metadata. */
async function fetchDurations(videoIds: string[]): Promise<Map<string, number | null>> {
  const durations = new Map<string, number | null>();
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    try {
      const raw = await callYouTubeApi("/videos", { part: "contentDetails", id: batch.join(",") });
      const parsed = videoDurationResponseSchema.safeParse(raw);
      if (!parsed.success) continue;
      for (const item of parsed.data.items ?? []) {
        durations.set(item.id, parseIsoDuration(item.contentDetails?.duration));
      }
    } catch {
      // Duration is best-effort metadata — skip this batch, lessons still get durationSec: null.
    }
  }
  return durations;
}

/** Discovers a YouTube playlist's lessons via the official YouTube Data API v3 — no scraping, no
 *  yt-dlp. Throws ProviderError on any failure that should stop the whole course (bad/missing
 *  API key, playlist not found/private, quota exceeded, network failure); individual unavailable
 *  lessons are skipped rather than failing the request. */
export async function fetchYouTubePlaylist(playlistId: string): Promise<CourseResult> {
  const startedAt = Date.now();
  try {
    const rawItems = await fetchPlaylistItems(playlistId);
    if (rawItems.length === 0) {
      throw new ProviderError("This playlist has no available videos", "provider_error");
    }

    const durations = await fetchDurations(rawItems.map((item) => item.videoId));
    const title = await fetchPlaylistTitle(playlistId);

    const result: CourseResult = {
      success: true,
      playlistId,
      title: title ?? "Untitled course",
      lessons: rawItems.map((item) => ({
        videoId: item.videoId,
        title: item.title,
        url: `https://www.youtube.com/watch?v=${item.videoId}`,
        durationSec: durations.get(item.videoId) ?? null,
        thumbnail: item.thumbnail,
      })),
    };
    logResolution({ success: true, latencyMs: Date.now() - startedAt });
    return result;
  } catch (err) {
    logResolution({
      success: false,
      latencyMs: Date.now() - startedAt,
      errorCategory: err instanceof ProviderError ? err.code : "unknown",
    });
    throw err;
  }
}
