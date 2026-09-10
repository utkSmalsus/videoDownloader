import { Clapperboard, Camera, X as XIcon, Users, type LucideIcon } from "lucide-react";
import type { Platform } from "@/types/media";

/**
 * Content-shape glyphs, not brand logos — Lucide dropped official brand marks, and the
 * product spec forbids using real platform logos as our own UI anyway. `X` gets Lucide's
 * generic "x" mark, which happens to match the platform's own name without being its logo.
 */
export const PLATFORM_ICONS: Record<Platform, LucideIcon> = {
  youtube: Clapperboard,
  instagram: Camera,
  x: XIcon,
  facebook: Users,
};
