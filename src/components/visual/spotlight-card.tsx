"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Render as a different element (e.g. Next's Link renders an <a>). */
  as?: "div" | "li" | "article";
}

/**
 * A surface with a soft highlight that tracks the cursor across it.
 *
 * The paint is pure CSS (`.spotlight-surface`, see globals.css) reading
 * `--mx`/`--my`; JS only writes those two custom properties on pointermove.
 * No state, no re-render, and the highlight colour comes from
 * `--platform-glow`, so a card inside a `[data-platform]` scope glows in that
 * platform's accent automatically. Touch devices never fire pointermove over
 * a surface, so they simply get the static card — no dead interaction.
 */
export function SpotlightCard({ children, className, as: Tag = "div" }: SpotlightCardProps) {
  const ref = useRef<HTMLElement>(null);

  function handleMove(e: React.PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      onPointerMove={handleMove}
      className={cn("spotlight-surface", className)}
    >
      {children}
    </Tag>
  );
}
