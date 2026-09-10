import type { Platform, ResolvedMedia } from "@/types/media";

/** Everything the rest of the app knows about a downloader provider. */
export interface MediaProvider {
  resolve(url: string, platform: Platform): Promise<ResolvedMedia>;
}

/** Thrown by adapters; MediaService maps this to a MediaError, never a raw stack trace. */
export class ProviderError extends Error {
  constructor(
    message: string,
    public code: "provider_error" | "rate_limited" | "network_error" = "provider_error",
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
