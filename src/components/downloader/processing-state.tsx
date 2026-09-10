"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";

const STEPS = ["Analyzing link", "Fetching media", "Preparing formats"];

/** No fake progress bars — a rotating status label plus a real (indeterminate) skeleton. */
export function ProcessingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6" aria-live="polite">
      <div className="mb-5 flex items-center gap-2.5 text-sm font-medium text-foreground">
        <Loader2 className="size-4 animate-spin text-platform-primary" aria-hidden />
        <AnimatePresence mode="wait">
          <motion.span
            key={step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {STEPS[step]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex gap-4">
        <div className="aspect-video w-32 shrink-0 animate-pulse rounded-[var(--radius-md)] bg-muted sm:w-40" />
        <div className="flex flex-1 flex-col gap-2.5 py-1">
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded-full bg-muted" />
          <div className="mt-3 flex gap-2">
            <div className="h-8 w-20 animate-pulse rounded-[var(--radius-sm)] bg-muted" />
            <div className="h-8 w-20 animate-pulse rounded-[var(--radius-sm)] bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
