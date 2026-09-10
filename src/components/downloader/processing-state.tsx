"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";

const STEPS = ["Analyzing link", "Fetching media", "Preparing formats"];

/**
 * No fake progress bars — the provider gives us no progress signal, so inventing a
 * percentage would be a lie. What this shows instead is real: a rotating status label
 * and a skeleton whose geometry exactly matches the result that replaces it (same
 * thumbnail aspect, same widths, same grid), so the swap is a cross-fade rather than
 * a layout jump.
 */
export function ProcessingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1300);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface/90 p-5 shadow-[var(--shadow-md)] backdrop-blur-xl sm:p-6"
      aria-live="polite"
      aria-busy
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-60"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, var(--platform-glow), transparent 70%)" }}
        aria-hidden
      />

      <div className="relative mb-5 flex items-center gap-2.5 text-sm font-medium text-foreground">
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

      <div className="relative flex flex-col gap-4 sm:flex-row">
        <div className="skeleton aspect-video w-full shrink-0 rounded-[var(--radius-md)] sm:w-52" />
        <div className="flex flex-1 flex-col gap-2.5 py-1">
          <div className="skeleton h-5 w-24 rounded-full" />
          <div className="skeleton h-5 w-3/4 rounded-full" />
          <div className="skeleton h-3.5 w-1/3 rounded-full" />
        </div>
      </div>

      <div className="rule-fade my-5" />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-24 rounded-[var(--radius-md)]" />
        ))}
      </div>
    </div>
  );
}
