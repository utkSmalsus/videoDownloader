"use client";

import { motion } from "motion/react";
import { Check, Download } from "lucide-react";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";
import type { Platform } from "@/types/media";

/**
 * An illustration of the product's own result list — deliberately generic sample titles,
 * no invented download counts, ratings or testimonials. It shows *what the tool does*,
 * which a paragraph of copy can't, without claiming anything about who uses it.
 */
const ROWS: { platform: Platform; title: string; meta: string; quality: string }[] = [
  { platform: "youtube", title: "Full course — 8 lessons", meta: "Queued sequentially", quality: "1080p" },
  { platform: "instagram", title: "Studio reel", meta: "Reel · 0:38", quality: "1080p" },
  { platform: "x", title: "Product launch clip", meta: "Post video · 1:12", quality: "720p" },
  { platform: "facebook", title: "Community meetup", meta: "Video · 24:06", quality: "1080p" },
];

export function ProductShowcase() {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
      className="relative mx-auto max-w-3xl"
    >
      {/* Ambient pool under the panel so it reads as lit from behind, not pasted on. */}
      <div
        className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0 opacity-70"
        style={{ background: "radial-gradient(60% 60% at 50% 30%, var(--glow-a), transparent 70%)" }}
        aria-hidden
      />

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 22, scale: 0.985 },
          show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
        }}
        className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface/90 shadow-[var(--shadow-lg)] backdrop-blur-xl"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-surface-sunken/70 px-4 py-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
          </div>
          <span className="ml-2 text-xs font-medium text-muted-foreground">Fetchpoint — recent</span>
        </div>

        <div className="divide-y divide-border">
          {ROWS.map((row, i) => {
            const Icon = PLATFORM_ICONS[row.platform];
            const done = i < 2;
            return (
              <motion.div
                key={row.title}
                data-platform={row.platform}
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5"
              >
                <span className="platform-transition inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-platform-soft text-platform-primary">
                  <Icon className="size-4" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{row.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{row.meta}</p>
                </div>

                <span className="hidden shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground sm:block">
                  {row.quality}
                </span>

                <span
                  className={
                    done
                      ? "inline-flex shrink-0 items-center gap-1 text-xs font-medium text-success"
                      : "platform-transition inline-flex shrink-0 items-center gap-1 text-xs font-medium text-platform-primary"
                  }
                >
                  {done ? (
                    <>
                      <Check className="size-3.5" aria-hidden />
                      <span className="hidden sm:inline">Started</span>
                    </>
                  ) : (
                    <>
                      <Download className="size-3.5" aria-hidden />
                      <span className="hidden sm:inline">Ready</span>
                    </>
                  )}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
