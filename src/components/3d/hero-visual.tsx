"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "@/lib/utils/use-media-query";
import { PLATFORM_ACCENT_HEX, DEFAULT_ACCENT_HEX } from "@/lib/config/platform-theme";
import type { Platform } from "@/types/media";

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false });

/** CSS-only orb — the fallback for reduced motion, small/touch screens, and while the 3D chunk
 *  loads. Tinted to match the same accent as the real scene so the fallback never looks
 *  unintentional. */
function StaticOrb({ accent }: { accent: string }) {
  return (
    <div className="relative flex size-full items-center justify-center">
      <div
        className="size-28 rounded-full sm:size-36"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${accent}, #24399e 100%)`,
          boxShadow: `0 30px 80px -20px ${accent}73`,
        }}
      />
    </div>
  );
}

const SIZE_CLASSES = {
  // The homepage standalone hero — the strongest, largest presentation.
  full: "relative mx-auto h-[280px] w-full max-w-[420px] sm:h-[340px]",
  // Composed directly behind the downloader input — sized to halo around it without
  // encroaching on the content above/below.
  inline: "relative mx-auto h-[200px] w-full max-w-[280px] sm:h-[240px] sm:max-w-[320px]",
  // A corner accent on platform pages — present, not competing with the page content.
  compact: "relative mx-auto size-[130px] shrink-0",
} as const;

interface HeroVisualProps {
  /** Tints the core to match the current downloader page. Omit for the neutral homepage core. */
  platform?: Platform;
  size?: keyof typeof SIZE_CLASSES;
}

export function HeroVisual({ platform, size = "full" }: HeroVisualProps) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isSmallOrTouch = useMediaQuery("(max-width: 767px), (pointer: coarse)");
  const useStatic = reducedMotion || isSmallOrTouch;
  const accent = platform ? PLATFORM_ACCENT_HEX[platform] : DEFAULT_ACCENT_HEX;

  return (
    // Fixed footprint regardless of which branch renders — zero layout shift.
    <div className={SIZE_CLASSES[size]}>
      <div
        className="absolute inset-0 rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--platform-glow), transparent 70%)" }}
        aria-hidden
      />
      {useStatic ? <StaticOrb accent={accent} /> : <HeroScene accent={accent} reducedMotion={false} />}
    </div>
  );
}
