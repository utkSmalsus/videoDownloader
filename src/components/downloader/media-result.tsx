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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-md)]"
    >
      <div className="flex gap-4">
        <div className="group relative aspect-video w-32 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-muted sm:w-40">
          {media.thumbnail && (
            <Image
              src={media.thumbnail}
              alt=""
              fill
              sizes="160px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/15">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-black/45 text-white opacity-90 backdrop-blur-sm">
              <Play className="size-3.5 translate-x-px fill-current" aria-hidden />
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-platform-soft px-2 py-0.5 text-xs font-medium text-platform-primary">
            <PlatformIcon className="size-3" aria-hidden />
            {platform.name}
          </div>
          <h3 className="truncate text-base font-semibold text-foreground">{media.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {media.author && (
              <span className="inline-flex items-center gap-1">
                <User className="size-3.5" aria-hidden />
                {media.author}
              </span>
            )}
            {duration && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden />
                {duration}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="my-5 border-t border-border" />

      <FormatSelector formats={media.formats} />

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="size-3.5" aria-hidden />
          New download
        </Button>
      </div>
    </motion.div>
  );
}
