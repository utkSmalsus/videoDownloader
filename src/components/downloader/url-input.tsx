"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Link2 } from "lucide-react";
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
  /** The homepage hero gets the larger, more prominent treatment. */
  size?: "default" | "hero";
}

export function UrlInputForm({ platform, placeholder, pending, onSubmit, size = "default" }: UrlInputFormProps) {
  const [value, setValue] = useState("");
  const detected = value.trim() ? detectPlatform(value) : null;
  const DetectedIcon = detected ? PLATFORM_ICONS[detected] : null;
  // On a fixed platform page, stay on that platform's accent regardless of what's typed —
  // pasting a wrong-platform link shouldn't flicker the color, the error state handles that.
  // On the homepage (no fixed platform), the accent live-previews whatever was detected.
  const scopePlatform = platform ?? detected ?? undefined;
  const hero = size === "hero";

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
        // conic-ring paints a rotating accent ring while focused (globals.css); the
        // relative/isolate pair keeps it clipped to the field's own rounded box.
        "conic-ring platform-transition relative isolate flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-surface/90 backdrop-blur-xl sm:flex-row sm:items-center",
        "shadow-[var(--shadow-md)] transition-shadow duration-300",
        "focus-within:shadow-[0_0_0_1px_var(--platform-primary),0_18px_50px_-14px_var(--platform-glow)]",
        hero ? "p-2.5" : "p-2",
      )}
    >
      <div className="relative flex flex-1 items-center">
        {/* Detection slot: a neutral link glyph until we recognise the URL, then the
            platform mark springs in. Fixed width so the text never reflows on swap. */}
        <span
          className={cn(
            "platform-transition absolute left-3 inline-flex shrink-0 items-center justify-center rounded-[var(--radius-xs)]",
            hero ? "size-8" : "size-7",
            detected ? "bg-platform-soft text-platform-primary" : "bg-muted text-muted-foreground",
          )}
          aria-hidden
        >
          <AnimatePresence mode="wait" initial={false}>
            {DetectedIcon ? (
              <motion.span
                key={detected}
                initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 12 }}
                transition={{ duration: 0.22, ease: [0.34, 1.4, 0.64, 1] }}
              >
                <DetectedIcon className={hero ? "size-4" : "size-3.5"} />
              </motion.span>
            ) : (
              <motion.span
                key="link"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
              >
                <Link2 className={hero ? "size-4" : "size-3.5"} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>

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
            "w-full rounded-[var(--radius-md)] bg-transparent text-foreground placeholder:text-muted-foreground",
            "focus-visible:outline-none",
            hero ? "h-14 pr-4 pl-13 text-[15px]" : "h-12 pr-4 pl-12 text-sm",
          )}
        />

        {/* Detected-platform label. Desktop only — on mobile the icon alone carries it
            and the extra chip would crowd the field. */}
        <AnimatePresence>
          {detected && (
            <motion.span
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.2 }}
              className="platform-transition mr-2 hidden shrink-0 rounded-full bg-platform-soft px-2.5 py-1 text-[11px] font-medium text-platform-primary sm:block"
            >
              {PLATFORMS[detected].name}
            </motion.span>
          )}
        </AnimatePresence>

        {detected && (
          <span className="sr-only" role="status">
            {PLATFORMS[detected].name} link detected
          </span>
        )}
      </div>

      <Button
        type="submit"
        size={hero ? "lg" : "md"}
        loading={pending}
        disabled={!value.trim()}
        className="w-full sm:w-auto"
      >
        {!pending && (
          <>
            {hero ? "Fetch media" : "Get media"}
            <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" aria-hidden />
          </>
        )}
        {pending && "Processing"}
      </Button>
    </form>
  );
}
