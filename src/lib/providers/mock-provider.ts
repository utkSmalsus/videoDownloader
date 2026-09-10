import type { MediaProvider } from "./types";
import type { Platform, ResolvedMedia } from "@/types/media";

/**
 * Explicit development-only stand-in. Only ever selected when MEDIA_PROVIDER=mock, which
 * itself is only permitted outside production (see media-service.ts). Never presented as a
 * real download — every mocked format URL is a placeholder, not a working link.
 */
const SAMPLES: Record<Platform, Omit<ResolvedMedia, "success" | "sourceUrl">> = {
  youtube: {
    platform: "youtube",
    title: "Building a great product in public",
    thumbnail: "https://picsum.photos/seed/youtube-mock/640/360",
    duration: 612,
    author: "Dev Channel",
    formats: [
      { id: "yt-1080", quality: "1080p", format: "mp4", type: "video", downloadUrl: "#mock-1080p" },
      { id: "yt-720", quality: "720p", format: "mp4", type: "video", downloadUrl: "#mock-720p" },
      { id: "yt-480", quality: "480p", format: "mp4", type: "video", downloadUrl: "#mock-480p" },
      { id: "yt-audio", quality: "192kbps", format: "mp3", type: "audio", downloadUrl: "#mock-audio" },
    ],
  },
  instagram: {
    platform: "instagram",
    title: "Reel from @studio",
    thumbnail: "https://picsum.photos/seed/instagram-mock/640/640",
    duration: 34,
    author: "@studio",
    formats: [
      { id: "ig-hd", quality: "1080p", format: "mp4", type: "video", downloadUrl: "#mock-hd" },
      { id: "ig-sd", quality: "720p", format: "mp4", type: "video", downloadUrl: "#mock-sd" },
    ],
  },
  x: {
    platform: "x",
    title: "A post with an attached clip",
    thumbnail: "https://picsum.photos/seed/x-mock/640/360",
    duration: 21,
    author: "@handle",
    formats: [
      { id: "x-hd", quality: "720p", format: "mp4", type: "video", downloadUrl: "#mock-hd" },
      { id: "x-sd", quality: "480p", format: "mp4", type: "video", downloadUrl: "#mock-sd" },
    ],
  },
  facebook: {
    platform: "facebook",
    title: "Video post from a public Facebook page",
    thumbnail: "https://picsum.photos/seed/facebook-mock/640/360",
    duration: 52,
    author: "Example Page",
    formats: [
      { id: "fb-hd", quality: "1080p", format: "mp4", type: "video", downloadUrl: "#mock-hd" },
      { id: "fb-sd", quality: "480p", format: "mp4", type: "video", downloadUrl: "#mock-sd" },
    ],
  },
};

export const mockProvider: MediaProvider = {
  async resolve(url, platform) {
    // Tiny artificial delay so the UI's processing state is actually visible in dev.
    await new Promise((r) => setTimeout(r, 900));
    return { success: true, sourceUrl: url, provider: "mock", ...SAMPLES[platform] };
  },
};
