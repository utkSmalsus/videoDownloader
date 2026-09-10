import { z } from "zod";
import type { Platform, ResolvedMedia, MediaFormat } from "@/types/media";
import { requestAllDL } from "../http-client";
import { ProviderError } from "../types";

/** True http(s) URLs only — AllDL's media links are never executed server-side, only handed
 *  to the browser, but we still refuse to pass along a non-http(s) scheme (e.g. `javascript:`). */
function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
const httpUrlSchema = z.string().refine(isHttpUrl, "Must be an http(s) URL");

/** AllDL's documented response shape. Every field beyond `success` is optional — not every
 *  platform/media item returns audio, a thumbnail, or a qualities list. */
export const AllDLQualitySchema = z.object({
  quality: z.string(),
  url: httpUrlSchema,
});
type AllDLQuality = z.infer<typeof AllDLQualitySchema>;

export const AllDLMediaInfoSchema = z.object({
  title: z.string().nullish(),
  platform: z.string().nullish(),
  author: z.string().nullish(),
  duration: z.number().nullish(),
  videoUrl: httpUrlSchema.nullish(),
  audioUrl: httpUrlSchema.nullish(),
  thumbnail: httpUrlSchema.nullish(),
  // Validated per-entry in buildFormats (via parseQualities) rather than here — one malformed
  // quality object shouldn't invalidate an otherwise-good response that still has videoUrl/audioUrl.
  qualities: z.array(z.unknown()).nullish(),
});

export const AllDLResponseSchema = z.object({
  success: z.boolean(),
  mediaInfo: AllDLMediaInfoSchema.nullish(),
});

type AllDLMediaInfo = z.infer<typeof AllDLMediaInfoSchema>;

/** Drops any quality entry that doesn't match AllDLQualitySchema instead of failing the whole
 *  response over one bad entry. */
function parseQualities(raw: unknown[] | null | undefined): AllDLQuality[] {
  if (!raw) return [];
  const valid: AllDLQuality[] = [];
  for (const entry of raw) {
    const parsed = AllDLQualitySchema.safeParse(entry);
    if (parsed.success) valid.push(parsed.data);
  }
  return valid;
}

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "format";
}

function qualityRank(quality: string): number | null {
  const match = quality.match(/(\d+)\s*p\b/i);
  return match ? Number(match[1]) : null;
}

/** Video formats sort best-quality-first (1080p, 720p, ...) — but only when every video
 *  quality is numerically parseable. A comparator that treats unparseable values as "equal to
 *  everything" isn't a real total order and produces implementation-dependent results, so if
 *  any quality can't be read as a resolution we leave the whole list in its original order
 *  instead of half-sorting it. */
function sortFormats(formats: MediaFormat[]): MediaFormat[] {
  const videoRanks = formats.filter((f) => f.type === "video").map((f) => qualityRank(f.quality));
  const allParseable = videoRanks.every((r) => r !== null);
  if (!allParseable) return formats;

  return [...formats].sort((a, b) => {
    if (a.type !== "video" || b.type !== "video") return 0;
    return (qualityRank(b.quality) as number) - (qualityRank(a.quality) as number);
  });
}

/**
 * Builds our MediaFormat list from AllDL's fields, deduping by download URL.
 *
 * Video precedence (qualities always wins over the generic "Best" videoUrl label):
 *   CASE A — qualities has entries  → one format per quality, videoUrl is not shown separately.
 *   CASE B — qualities is missing/empty but videoUrl exists → a single "Best" format.
 *   CASE C — neither exists → no video formats (the UI shows an explicit empty state for this).
 */
function buildFormats(media: AllDLMediaInfo): MediaFormat[] {
  const byUrl = new Map<string, MediaFormat>();
  const usedIds = new Set<string>();

  function uniqueId(base: string): string {
    let id = base;
    let n = 2;
    while (usedIds.has(id)) id = `${base}-${n++}`;
    usedIds.add(id);
    return id;
  }

  function add(format: MediaFormat) {
    if (!byUrl.has(format.downloadUrl)) byUrl.set(format.downloadUrl, format);
  }

  const qualities = parseQualities(media.qualities);
  if (qualities.length > 0) {
    for (const q of qualities) {
      add({ id: uniqueId(`video-${slugify(q.quality)}`), quality: q.quality, format: "mp4", type: "video", downloadUrl: q.url });
    }
  } else if (media.videoUrl) {
    add({ id: uniqueId("default-video"), quality: "Best", format: "mp4", type: "video", downloadUrl: media.videoUrl });
  }

  if (media.audioUrl) {
    add({ id: uniqueId("default-audio"), quality: "Audio", format: "mp3", type: "audio", downloadUrl: media.audioUrl });
  }

  return sortFormats([...byUrl.values()]);
}

function logResolution(entry: { platform: Platform; success: boolean; latencyMs: number; errorCategory?: string }) {
  // Structured, no URLs/secrets — safe to ship to any log aggregator as-is.
  console.log(JSON.stringify({ provider: "alldl", at: new Date().toISOString(), ...entry }));
}

/** Calls AllDL for one platform's URL and normalizes its response to our MediaResult schema. */
export async function resolveViaProvider(url: string, platform: Platform): Promise<ResolvedMedia> {
  const startedAt = Date.now();
  try {
    const raw = await requestAllDL(url);
    if (process.env.NODE_ENV !== "production") {
      // Dev-only: AllDL's raw shape varies a lot by platform/URL, worth seeing as-is. Never
      // enabled in production — these can be direct, time-limited media URLs.
      console.debug("[alldl] raw response for", platform, JSON.stringify(raw));
    }

    const parsed = AllDLResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ProviderError("Provider returned a malformed response", "provider_error");
    }
    if (!parsed.data.success || !parsed.data.mediaInfo) {
      throw new ProviderError("Provider could not resolve this media", "provider_error");
    }

    const media = parsed.data.mediaInfo;
    // formats may legitimately be empty (CASE C) — the UI shows an explicit empty state for
    // that rather than us failing the whole request when we still have a title/thumbnail.
    const formats = buildFormats(media);

    const result: ResolvedMedia = {
      success: true,
      platform,
      sourceUrl: url,
      title: media.title ?? "Untitled",
      thumbnail: media.thumbnail ?? null,
      duration: media.duration ?? null,
      author: media.author ?? null,
      formats,
      provider: "alldl",
    };
    logResolution({ platform, success: true, latencyMs: Date.now() - startedAt });
    return result;
  } catch (err) {
    logResolution({
      platform,
      success: false,
      latencyMs: Date.now() - startedAt,
      errorCategory: err instanceof ProviderError ? err.code : "unknown",
    });
    throw err;
  }
}
