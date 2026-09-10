/** Our own normalized media schema. Nothing provider-specific ever crosses this boundary. */

export type Platform = "youtube" | "instagram" | "x" | "facebook";

export type FormatType = "video" | "audio" | "image";

export interface MediaFormat {
  id: string;
  quality: string; // e.g. "1080p", "720p", "320kbps" — the provider's own label, never invented
  format: string; // e.g. "mp4", "mp3", "webp"
  type: FormatType;
  downloadUrl: string;
  sizeBytes?: number;
  // Richer metadata some providers return. Always optional — an adapter that can't supply a
  // field simply omits it rather than fabricating a value.
  width?: number;
  height?: number;
  fps?: number;
  codec?: string;
  /** The provider's own native format identifier. Needed to request this exact format again
   *  from a provider whose download step is a separate call. */
  formatId?: string;
  /** type:"video" only — whether `downloadUrl` already carries an audio track. */
  hasAudio?: boolean;
  /** type:"video" only, when hasAudio is false — a separate audio-only stream to pair with it. */
  audioUrl?: string;
  /** Headers that MUST be sent when fetching downloadUrl/audioUrl (some providers issue
   *  hotlink-protected URLs, e.g. requiring `Referer`). A plain `<a download>` can't attach
   *  custom headers, so this is currently informational/for a future proxy — never dropped. */
  requiredHeaders?: Record<string, string>;
}

export interface ResolvedMedia {
  success: true;
  platform: Platform;
  sourceUrl: string;
  title: string;
  thumbnail: string | null;
  duration: number | null; // seconds
  author: string | null;
  formats: MediaFormat[];
  /** Which backend actually resolved this. Logs/debugging only — never rendered in the UI. */
  provider?: "alldl" | "mock";
}

export type MediaErrorCode =
  | "invalid_url"
  | "unsupported_platform"
  | "provider_error"
  | "rate_limited"
  | "network_error"
  | "not_configured";

export interface MediaError {
  success: false;
  code: MediaErrorCode;
  message: string;
}

export type MediaResult = ResolvedMedia | MediaError;

/**
 * "Download Course" (YouTube playlists) — a separate, YouTube-only capability: playlist
 * discovery via the official YouTube Data API, each lesson then downloaded individually through
 * AllDL like any other single video. Kept out of MediaResult/MediaFormat on purpose: a playlist
 * is a list of videos, not a single resolved item, so it doesn't belong in the single-video model.
 */
export interface CourseLesson {
  videoId: string;
  title: string;
  url: string;
  durationSec: number | null; // best-effort — flat playlist extraction often omits it
  thumbnail: string | null;
}

export interface CourseResult {
  success: true;
  playlistId: string;
  title: string;
  lessons: CourseLesson[];
}

export type CourseFetchResult = CourseResult | MediaError;
