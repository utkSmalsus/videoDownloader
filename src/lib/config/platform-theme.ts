import type { Platform } from "@/types/media";

/**
 * The real "platform theme" — primary/soft/glow/gradient tokens — lives entirely in CSS as
 * `--platform-*` custom properties, scoped via `[data-platform="…"]` (see globals.css). That's
 * the single source of truth for every UI color.
 *
 * This map exists only because the 3D hero's Three.js materials can't consume CSS custom
 * properties directly and need a plain hex color. Values are hand-tuned to match the CSS
 * `--platform-primary` tokens; if you retune a brand color, update both places.
 */
export const PLATFORM_ACCENT_HEX: Record<Platform, string> = {
  youtube: "#E5484D",
  instagram: "#D6336C",
  x: "#8B8D98",
  facebook: "#1877F2",
};

/** The neutral core color used when no platform is in scope (homepage). */
export const DEFAULT_ACCENT_HEX = "#3D63E8";
