"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectPlatform } from "@/lib/validation/url";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";
import { PLATFORMS } from "@/lib/config/platforms";
import { cn } from "@/lib/utils/cn";
import type { Platform } from "@/types/media";

interface UrlInputFormProps {
  platform?: Platform;
  placeholder: string;
  pending: boolean;
  onSubmit: (url: string) => void;
}

export function UrlInputForm({ platform, placeholder, pending, onSubmit }: UrlInputFormProps) {
  const [value, setValue] = useState("");
  const detected = value.trim() ? detectPlatform(value) : null;
  const DetectedIcon = detected ? PLATFORM_ICONS[detected] : null;
  // On a fixed platform page, stay on that platform's accent regardless of what's typed —
  // pasting a wrong-platform link shouldn't flicker the color, the error state handles that.
  // On the homepage (no fixed platform), the accent live-previews whatever was detected.
  const scopePlatform = platform ?? detected ?? undefined;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || pending) return;
    onSubmit(value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-platform={scopePlatform}
      className={cn(
        "platform-transition flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-2 shadow-[var(--shadow-md)] sm:flex-row sm:items-center",
        "transition-shadow duration-200 focus-within:shadow-[0_0_0_1px_var(--platform-primary),0_12px_34px_-10px_var(--platform-glow)]",
      )}
    >
      <div className="relative flex flex-1 items-center">
        <AnimatePresence>
          {DetectedIcon && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              className="absolute left-3 inline-flex size-6 items-center justify-center rounded-[var(--radius-xs)] bg-platform-soft text-platform-primary"
              aria-hidden
            >
              <DetectedIcon className="size-3.5" />
            </motion.span>
          )}
        </AnimatePresence>
        <input
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Media URL"
          className={cn(
            "h-12 w-full rounded-[var(--radius-md)] bg-transparent text-sm text-foreground placeholder:text-muted-foreground",
            "focus-visible:outline-none",
            DetectedIcon ? "pl-11 pr-4" : "px-4",
          )}
        />
        {detected && (
          <span className="sr-only" role="status">
            {PLATFORMS[detected].name} link detected
          </span>
        )}
      </div>
      <Button type="submit" size="lg" loading={pending} disabled={!value.trim()} className="w-full sm:w-auto">
        {!pending && (
          <>
            Get media
            <ArrowRight className="size-4" aria-hidden />
          </>
        )}
        {pending && "Processing"}
      </Button>
    </form>
  );
}
