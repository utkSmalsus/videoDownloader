"use client";

import { AnimatePresence, motion } from "motion/react";
import { UrlInputForm } from "./url-input";
import { ProcessingState } from "./processing-state";
import { MediaResult } from "./media-result";
import { ErrorState } from "./error-state";
import { useMediaResolver } from "./use-media-resolver";
import type { Platform } from "@/types/media";

interface DownloaderShellProps {
  platform?: Platform;
  placeholder: string;
  /** "hero" renders the larger homepage treatment of the input. Presentation only —
   *  the resolve flow underneath is identical either way. */
  size?: "default" | "hero";
}

/** The one downloader UI, reused verbatim by the homepage and every platform page. */
export function DownloaderShell({ platform, placeholder, size = "default" }: DownloaderShellProps) {
  const { state, submit, reset } = useMediaResolver(platform);

  // Fixed platform pages always keep their own accent. The homepage has none until a result
  // resolves — at that point we know the *actual* platform (from the server), which is more
  // accurate than guessing from whatever was last typed.
  const scopePlatform = platform ?? (state.status === "success" ? state.data.platform : undefined);

  return (
    <div className="platform-transition flex flex-col gap-5" data-platform={scopePlatform}>
      <UrlInputForm
        platform={platform}
        placeholder={placeholder}
        pending={state.status === "processing"}
        onSubmit={submit}
        size={size}
      />

      <AnimatePresence mode="wait">
        {state.status === "processing" && (
          <motion.div key="processing" exit={{ opacity: 0 }}>
            <ProcessingState />
          </motion.div>
        )}
        {state.status === "success" && (
          <motion.div key="success">
            <MediaResult media={state.data} onReset={reset} />
          </motion.div>
        )}
        {state.status === "error" && (
          <motion.div key="error" exit={{ opacity: 0 }}>
            <ErrorState code={state.code} message={state.message} onRetry={reset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
