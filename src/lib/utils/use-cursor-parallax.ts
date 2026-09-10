"use client";

import { useEffect, type RefObject } from "react";
import { useMediaQuery } from "./use-media-query";

/**
 * Writes the pointer's position, normalised to -1..1 around the viewport
 * centre, onto the given element as the `--px` / `--py` custom properties.
 *
 * Deliberately not React state: children read the values through CSS, so
 * moving the mouse costs one property write per frame and zero re-renders.
 * The listener is passive and rAF-coalesced (many pointermove events collapse
 * into one write per paint), and it isn't attached at all on touch/small
 * screens or under prefers-reduced-motion — those users get the static layout
 * with no wasted work.
 */
export function useCursorParallax(ref: RefObject<HTMLElement | null>) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isCoarse = useMediaQuery("(max-width: 767px), (pointer: coarse)");
  const enabled = !reducedMotion && !isCoarse;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let px = 0;
    let py = 0;

    function onMove(e: PointerEvent) {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        el?.style.setProperty("--px", px.toFixed(3));
        el?.style.setProperty("--py", py.toFixed(3));
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, ref]);

  return enabled;
}
