"use client";

import { useCallback, useState } from "react";
import { detectPlatform } from "@/lib/validation/url";
import { addHistoryEntry } from "@/lib/storage/history";
import type { MediaErrorCode, Platform, ResolvedMedia } from "@/types/media";

export type ResolverState =
  | { status: "idle" }
  | { status: "processing" }
  | { status: "success"; data: ResolvedMedia }
  | { status: "error"; code: MediaErrorCode | "invalid_url"; message: string };

const INVALID_MESSAGE = "That doesn't look like a supported URL.";
const UNSUPPORTED_MESSAGE = "This platform isn't supported yet.";
const NETWORK_MESSAGE = "Connection failed. Please try again.";

/**
 * Drives the whole paste → validate → process → result flow. Used identically by the
 * homepage's universal panel and every platform page — only `fixedPlatform` differs.
 */
export function useMediaResolver(fixedPlatform?: Platform) {
  const [state, setState] = useState<ResolverState>({ status: "idle" });

  const reset = useCallback(() => setState({ status: "idle" }), []);

  const submit = useCallback(
    async (rawUrl: string) => {
      const url = rawUrl.trim();
      const detected = detectPlatform(url);

      if (fixedPlatform) {
        if (detected !== fixedPlatform) {
          setState({ status: "error", code: "invalid_url", message: INVALID_MESSAGE });
          return;
        }
      } else if (!detected) {
        // Recognizable URL, just not one of our supported platforms — vs. outright garbage.
        const looksLikeUrl = /^https?:\/\//i.test(url);
        setState({
          status: "error",
          code: looksLikeUrl ? "unsupported_platform" : "invalid_url",
          message: looksLikeUrl ? UNSUPPORTED_MESSAGE : INVALID_MESSAGE,
        });
        return;
      }

      setState({ status: "processing" });

      try {
        const res = await fetch("/api/media/resolve", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const body = (await res.json()) as ResolvedMedia | { success: false; code: MediaErrorCode; message: string };

        if (body.success) {
          setState({ status: "success", data: body });
          addHistoryEntry(body);
        } else {
          setState({ status: "error", code: body.code, message: body.message });
        }
      } catch {
        setState({ status: "error", code: "network_error", message: NETWORK_MESSAGE });
      }
    },
    [fixedPlatform],
  );

  return { state, submit, reset };
}
