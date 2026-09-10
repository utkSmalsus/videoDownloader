import type { Platform } from "@/types/media";

/** Single source of truth for supported platforms. Add a platform here + one adapter, nothing else. */
export interface PlatformConfig {
  id: Platform;
  name: string;
  path: string; // route segment
  domains: string[]; // hostnames accepted (subdomains of these also match)
  contentType: string;
  description: string;
  urlPlaceholder: string;
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  youtube: {
    id: "youtube",
    name: "YouTube",
    path: "youtube",
    domains: ["youtube.com", "youtu.be", "youtube-nocookie.com"],
    contentType: "Videos & Shorts",
    description: "Paste a YouTube link to get available media formats.",
    urlPlaceholder: "https://www.youtube.com/watch?v=...",
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    path: "instagram",
    domains: ["instagram.com"],
    contentType: "Reels & Posts",
    description: "Paste an Instagram link to get available media formats.",
    urlPlaceholder: "https://www.instagram.com/reel/...",
  },
  x: {
    id: "x",
    name: "X",
    path: "x",
    domains: ["x.com", "twitter.com"],
    contentType: "Posts & Videos",
    description: "Paste an X (Twitter) link to get available media formats.",
    urlPlaceholder: "https://x.com/user/status/...",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    path: "facebook",
    domains: ["facebook.com", "fb.watch"],
    contentType: "Videos & Reels",
    description: "Paste a Facebook link to get available media formats.",
    urlPlaceholder: "https://www.facebook.com/.../videos/...",
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);
