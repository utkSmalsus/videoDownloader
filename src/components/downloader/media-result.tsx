"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Check, Copy, RotateCcw, User, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormatSelector } from "./format-selector";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";
import { PLATFORMS } from "@/lib/config/platforms";
import { formatDuration } from "@/lib/utils/format";
import type { ResolvedMedia } from "@/types/media";

/** One shared choreography: the panel lands first, then its parts arrive in reading
 *  order (thumbnail → metadata → formats). Short and overlapping — the whole sequence
 *  finishes in well under half a second, so it reads as "assembling", not "waiting". */
const container = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07, delayChildren: 0.06 },
  },
} as const;

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
} as const;

export function MediaResult({ media, onReset }: { media: ResolvedMedia; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const platform = PLATFORMS[media.platform];
  const PlatformIcon = PLATFORM_ICONS[media.platform];
  const duration = formatDuration(media.duration);

  async function handleCopy() {
    await navigator.clipboard.writeText(media.sourceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface/90 p-5 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-6"
    >
      {/* Accent wash bleeding from the top edge — ties the result panel to the
          platform it came from without tinting the whole surface. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-70"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, var(--platform-glow), transparent 70%)" }}
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 sm:flex-row">
        <motion.div variants={item} className="group relative aspect-video w-full shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-muted sm:w-52">
          {media.thumbnail && (
            <Image
              src={media.thumbnail}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 208px"
              // blur → sharp as it lands: the image feels like it resolved, not popped.
              className="object-cover blur-[6px] scale-105 transition-[filter,transform] duration-500 ease-[var(--ease-out-quint)] group-hover:scale-[1.07]"
              onLoad={(e) => e.currentTarget.classList.remove("blur-[6px]", "scale-105")}
              unoptimized
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/15">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
              <Play className="size-4 translate-x-px fill-current" aria-hidden />
            </span>
          </div>
        </motion.div>

        <motion.div variants={item} className="min-w-0 flex-1">
          <div className="platform-transition mb-2 inline-flex items-center gap-1.5 rounded-full bg-platform-soft px-2.5 py-1 text-xs font-medium text-platform-primary">
            <PlatformIcon className="size-3" aria-hidden />
            {platform.name}
          </div>
          <h3 className="text-lg leading-snug font-semibold tracking-tight text-balance text-foreground">
            {media.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {media.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5" aria-hidden />
                {media.author}
              </span>
            )}
            {duration && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden />
                {duration}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="rule-fade my-5" />

      <motion.div variants={item} className="relative">
        <FormatSelector formats={media.formats} />
      </motion.div>

      <motion.div variants={item} className="relative mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="size-3.5" aria-hidden />
          New download
        </Button>
      </motion.div>
    </motion.div>
  );
}
