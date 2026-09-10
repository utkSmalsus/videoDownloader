"use client";

import { useRef } from "react";
import { useCursorParallax } from "@/lib/utils/use-cursor-parallax";
import { cn } from "@/lib/utils/cn";

interface AmbientBackgroundProps {
  /** "hero" is the full-strength homepage treatment; "page" is the quieter
   *  version platform pages sit on so it never competes with the content. */
  variant?: "hero" | "page";
  /** Adds the faint blueprint grid. Off for content pages. */
  grid?: boolean;
  className?: string;
}

/**
 * The atmosphere layer: two slow aurora blobs, an optional grid, and film grain.
 *
 * Colour is inherited, never hardcoded — the blobs paint with `--platform-glow`
 * / `--platform-primary`, so the same component glows Fetchpoint-indigo on the
 * homepage and platform-red inside a `[data-platform="youtube"]` scope.
 *
 * Cursor parallax is deliberately cheap: ONE passive pointermove listener,
 * coalesced into a single rAF, writing two CSS custom properties. No React
 * state, so moving the mouse never re-renders the tree. Skipped entirely on
 * touch/small screens and under prefers-reduced-motion.
 */
export function AmbientBackground({ variant = "page", grid = false, className }: AmbientBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  useCursorParallax(ref);

  const strong = variant === "hero";

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "noise-overlay pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{ "--px": 0, "--py": 0 } as React.CSSProperties}
    >
      {grid && (
        <div
          className="surface-grid absolute inset-0 opacity-70"
          // Fades the grid out toward the edges so it reads as depth, not wallpaper.
          style={{
            maskImage: "radial-gradient(78% 62% at 50% 30%, #000 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(78% 62% at 50% 30%, #000 30%, transparent 100%)",
          }}
        />
      )}

      {/* Outer div carries cursor parallax, inner carries the keyframe drift —
          two separate transforms, so neither fights the other. */}
      <div
        className="absolute -top-[18%] left-[8%] transition-transform duration-700 ease-[var(--ease-out-quint)] will-change-transform"
        style={{ transform: "translate3d(calc(var(--px) * 26px), calc(var(--py) * 18px), 0)" }}
      >
        <div
          className="aurora-blob animate-[var(--animate-aurora-a)]"
          style={{
            width: strong ? "42rem" : "30rem",
            height: strong ? "34rem" : "24rem",
            background:
              "radial-gradient(circle at 40% 40%, var(--platform-glow), transparent 68%)",
            opacity: strong ? 0.95 : 0.6,
          }}
        />
      </div>

      <div
        className="absolute -top-[6%] right-[4%] transition-transform duration-700 ease-[var(--ease-out-quint)] will-change-transform"
        style={{ transform: "translate3d(calc(var(--px) * -32px), calc(var(--py) * -14px), 0)" }}
      >
        <div
          className="aurora-blob animate-[var(--animate-aurora-b)]"
          style={{
            width: strong ? "36rem" : "26rem",
            height: strong ? "30rem" : "22rem",
            background: "radial-gradient(circle at 60% 40%, var(--glow-b), transparent 70%)",
            opacity: strong ? 0.8 : 0.45,
          }}
        />
      </div>

      {/* Grounding wash: keeps the top of the page bright and lets content
          below settle onto the base background instead of a hard gradient edge. */}
      <div
        className="absolute inset-x-0 top-0 h-[min(70vh,640px)]"
        style={{
          background:
            "radial-gradient(70% 100% at 50% 0%, var(--platform-glow), transparent 72%)",
          opacity: strong ? 0.6 : 0.4,
        }}
      />
    </div>
  );
}
