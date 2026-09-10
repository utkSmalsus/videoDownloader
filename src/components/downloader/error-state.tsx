"use client";

import { motion } from "motion/react";
import { AlertTriangle, WifiOff, Clock3, ServerCrash, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaErrorCode } from "@/types/media";

const ICONS: Record<MediaErrorCode | "invalid_url", typeof AlertTriangle> = {
  invalid_url: AlertTriangle,
  unsupported_platform: AlertTriangle,
  provider_error: ServerCrash,
  rate_limited: Clock3,
  network_error: WifiOff,
  not_configured: ServerCrash,
};

/** Short, human framing per failure kind. The provider's own message still shows
 *  underneath — this only adds the "what kind of problem is this" line that a raw
 *  message can't carry on its own. */
const HEADINGS: Record<MediaErrorCode | "invalid_url", string> = {
  invalid_url: "That link doesn't look right",
  unsupported_platform: "Platform not supported yet",
  provider_error: "Couldn't resolve this media",
  rate_limited: "Slow down for a moment",
  network_error: "Connection lost",
  not_configured: "Temporarily unavailable",
};

export function ErrorState({
  code,
  message,
  onRetry,
}: {
  code: MediaErrorCode | "invalid_url";
  message: string;
  onRetry: () => void;
}) {
  const Icon = ICONS[code];
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface/90 px-6 py-10 text-center backdrop-blur-xl"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-50"
        style={{ background: "radial-gradient(50% 100% at 50% 0%, var(--danger-soft), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative flex flex-col items-center gap-3">
        <span className="relative inline-flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          {/* One soft ring, not a looping alarm — enough to draw the eye, then it settles. */}
          <span className="absolute inset-0 animate-[var(--animate-pulse-soft)] rounded-full bg-danger/10" aria-hidden />
          <Icon className="relative size-5" aria-hidden />
        </span>
        <div>
          <p className="text-base font-semibold text-foreground">{HEADINGS[code]}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-1">
          <RotateCcw className="size-3.5" aria-hidden />
          Try again
        </Button>
      </div>
    </motion.div>
  );
}
