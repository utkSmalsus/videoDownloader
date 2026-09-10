import { z } from "zod";
import { PLATFORM_LIST } from "@/lib/config/platforms";
import type { Platform } from "@/types/media";

/** Request body shape for POST /api/media/resolve. Client input is never trusted beyond this. */
export const resolveRequestSchema = z.object({
  url: z.string().trim().min(1).max(2048),
});

/**
 * Detects which supported platform a URL belongs to, purely from hostname —
 * no network access, safe to run on the client for instant UI feedback and
 * again on the server as the real gate.
 */
export function detectPlatform(rawUrl: string): Platform | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  for (const platform of PLATFORM_LIST) {
    if (platform.domains.some((d) => host === d || host.endsWith(`.${d}`))) {
      return platform.id;
    }
  }
  return null;
}

export function isSupportedUrl(rawUrl: string): boolean {
  return detectPlatform(rawUrl) !== null;
}
