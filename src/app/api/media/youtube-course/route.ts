import { NextRequest, NextResponse } from "next/server";
import { resolveRequestSchema, detectPlatform } from "@/lib/validation/url";
import { extractPlaylistId, fetchYouTubePlaylist } from "@/lib/youtube/playlist";
import { ProviderError } from "@/lib/providers/types";
import { checkRateLimit } from "@/lib/rate-limit";
import type { MediaError } from "@/types/media";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 4096;

/**
 * "Download Course" — lists a YouTube playlist's videos via the official YouTube Data API v3.
 * No scraping, no yt-dlp, no VPS. Requires a playlist URL specifically (either
 * youtube.com/playlist?list=... or a video URL that also carries &list=...) — a plain video URL,
 * a channel URL, or a search URL is rejected with a clear message rather than guessing intent.
 */

function errorResponse(status: number, error: MediaError) {
  return NextResponse.json(error, { status });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = await checkRateLimit(ip);
  if (!limit.ok) {
    return errorResponse(429, { success: false, code: "rate_limited", message: "Too many requests. Please try again shortly." });
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return errorResponse(413, { success: false, code: "invalid_url", message: "Request too large." });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, { success: false, code: "invalid_url", message: "That doesn't look like a valid request." });
  }

  const parsed = resolveRequestSchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse(400, { success: false, code: "invalid_url", message: "That doesn't look like a supported URL." });
  }

  if (detectPlatform(parsed.data.url) !== "youtube") {
    return errorResponse(422, { success: false, code: "unsupported_platform", message: "Course downloads are only available for YouTube playlists." });
  }

  const playlistId = extractPlaylistId(parsed.data.url);
  if (!playlistId) {
    return errorResponse(422, {
      success: false,
      code: "invalid_url",
      message: "Course downloads need a YouTube playlist URL (a link with a \"list=\" parameter), not a single video.",
    });
  }

  if (!process.env.YOUTUBE_DATA_API_KEY) {
    return errorResponse(503, { success: false, code: "not_configured", message: "YouTube Course downloads are temporarily unavailable." });
  }

  try {
    const result = await fetchYouTubePlaylist(playlistId);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof ProviderError) {
      const status = err.code === "rate_limited" ? 429 : err.code === "network_error" ? 504 : 502;
      const message =
        err.code === "rate_limited"
          ? "Too many requests. Please try again shortly."
          : err.code === "network_error"
            ? "Connection failed. Please try again."
            : "We couldn't fetch this course right now. Make sure the playlist is public and the URL is correct.";
      return errorResponse(status, { success: false, code: err.code, message });
    }
    return errorResponse(500, { success: false, code: "provider_error", message: "We couldn't fetch this course right now. Please try again." });
  }
}
