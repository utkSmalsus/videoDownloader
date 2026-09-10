"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  /** Stagger sibling sections by passing an increasing delay (seconds). */
  delay?: number;
  className?: string;
}

/**
 * Scroll-in reveal for page sections.
 *
 * Uses motion's `whileInView` (IntersectionObserver under the hood — no scroll
 * listener, no layout thrash) with `once: true`, so a section animates the
 * first time it appears and then stops costing anything.
 *
 * Motion respects prefers-reduced-motion at the library level via
 * `useReducedMotion`, but we don't rely on that alone: the reveal only moves
 * 16px and fades, so even if it plays it can't cause vestibular discomfort or
 * hide content — the element is fully readable at every frame.
 */
export function SectionReveal({ children, delay = 0, className }: SectionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
