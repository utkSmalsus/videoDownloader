"use client";

import { useRef } from "react";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";
import { PLATFORMS } from "@/lib/config/platforms";
import { useCursorParallax } from "@/lib/utils/use-cursor-parallax";
import type { Platform } from "@/types/media";

interface Chip {
  platform: Platform;
  label: string;
  /** Percentages, so the constellation scales with the hero instead of drifting off it. */
  top: string;
  left?: string;
  right?: string;
  /** Parallax strength — bigger reads as "closer to the viewer". */
  depth: number;
  delay: string;
  duration: string;
  tilt: string;
  /** Small chips sit further back and stay out of the headline's way. */
  scale: number;
}

/**
 * Media "in flight" around the hero — the visual argument for what Fetchpoint
 * does: links from four platforms converging on one point.
 *
 * Everything is decorative and inert (`pointer-events-none`, `aria-hidden`):
 * it can never intercept a click meant for the URL input behind it. Motion is
 * transform-only (a CSS keyframe float plus a cursor-parallax translate on a
 * separate wrapper element, so the two never overwrite each other), and the
 * cursor layer switches itself off on touch and reduced-motion.
 */
const CHIPS: Chip[] = [
  { platform: "youtube", label: "1080p · MP4", top: "6%", left: "2%", depth: 34, delay: "0s", duration: "9s", tilt: "-6deg", scale: 1 },
  { platform: "instagram", label: "Reel", top: "58%", left: "7%", depth: 22, delay: "1.4s", duration: "11s", tilt: "5deg", scale: 0.9 },
  { platform: "x", label: "Post", top: "20%", right: "3%", depth: 30, delay: "0.7s", duration: "10s", tilt: "7deg", scale: 0.95 },
  { platform: "facebook", label: "720p · MP4", top: "66%", right: "5%", depth: 18, delay: "2.1s", duration: "12s", tilt: "-4deg", scale: 0.88 },
  { platform: "youtube", label: "Course · 8", top: "82%", left: "22%", depth: 12, delay: "3s", duration: "13s", tilt: "3deg", scale: 0.8 },
  { platform: "instagram", label: "Story", top: "3%", right: "22%", depth: 14, delay: "1.9s", duration: "10.5s", tilt: "-8deg", scale: 0.8 },
];

export function FloatingMedia() {
  const ref = useRef<HTMLDivElement>(null);
  useCursorParallax(ref);

  return (
    // xl and up only. Below that the hero column is wide relative to the viewport and the
    // chips collide with the URL input — the one element that must never be crowded.
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block">
      {CHIPS.map((chip, i) => {
        const Icon = PLATFORM_ICONS[chip.platform];
        return (
          <div
            key={i}
            data-platform={chip.platform}
            className="absolute"
            style={{
              top: chip.top,
              left: chip.left,
              right: chip.right,
              // Parallax wrapper: cursor only. The float keyframe lives on the child.
              transform: `translate3d(calc(var(--px, 0) * ${chip.depth}px), calc(var(--py, 0) * ${chip.depth * 0.6}px), 0)`,
              transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "transform",
            }}
          >
            <div
              className="animate-[var(--animate-float)]"
              style={
                {
                  animationDelay: chip.delay,
                  animationDuration: chip.duration,
                  "--tilt": chip.tilt,
                  scale: String(chip.scale),
                } as React.CSSProperties
              }
            >
              <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border/70 bg-surface/70 py-2 pr-3.5 pl-2 shadow-[var(--shadow-md)] backdrop-blur-md">
                <span className="platform-transition inline-flex size-7 items-center justify-center rounded-[var(--radius-xs)] bg-platform-soft text-platform-primary">
                  <Icon className="size-3.5" />
                </span>
                <div className="leading-tight">
                  <div className="text-[11px] font-medium text-foreground">
                    {PLATFORMS[chip.platform].name}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{chip.label}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
