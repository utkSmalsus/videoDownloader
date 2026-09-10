import type { Platform } from "@/types/media";

/**
 * Per-platform *art direction* — the knobs that make /youtube feel cinematic and /x feel
 * editorial, without any of them owning a copy of the downloader.
 *
 * Everything here is presentation-only: copy, an accent-strength dial, and which decorative
 * motif the shared PlatformShell should render. Colour itself is never listed — that already
 * cascades from the `[data-platform]` CSS scope in globals.css.
 */
export interface PlatformEnvironment {
  /** Small label above the title. */
  kicker: string;
  /** Headline shown instead of the generic "<Name> Downloader". */
  headline: string;
  /** One-line support copy under the headline. */
  subhead: string;
  /** Which decorative motif to draw beneath the header. */
  motif: "timeline" | "gradient-ring" | "rule" | "social-card";
  /** How loud the ambient aurora should be for this platform. */
  ambient: "hero" | "page";
}

export const PLATFORM_ENVIRONMENTS: Record<Platform, PlatformEnvironment> = {
  youtube: {
    kicker: "YouTube",
    headline: "Download video and full courses.",
    subhead: "Single videos, or an entire playlist queued lesson by lesson.",
    motif: "timeline",
    ambient: "hero",
  },
  instagram: {
    kicker: "Instagram",
    headline: "Save reels, posts and stories.",
    subhead: "Paste any public Instagram link and pick the quality you want.",
    motif: "gradient-ring",
    ambient: "hero",
  },
  x: {
    kicker: "X",
    headline: "Pull video straight from a post.",
    subhead: "Paste the post URL. No clutter, no extra steps.",
    motif: "rule",
    ambient: "page",
  },
  facebook: {
    kicker: "Facebook",
    headline: "Download videos and reels.",
    subhead: "Works with public video posts, reels and watch links.",
    motif: "social-card",
    ambient: "hero",
  },
};
