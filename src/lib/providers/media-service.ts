import { detectPlatform } from "@/lib/validation/url";
import type { MediaResult, Platform } from "@/types/media";
import type { MediaProvider } from "./types";
import { ProviderError } from "./types";
import { mockProvider } from "./mock-provider";
import { youtubeProvider } from "./adapters/youtube";
import { instagramProvider } from "./adapters/instagram";
import { xProvider } from "./adapters/x";
import { facebookProvider } from "./adapters/facebook";

/** AllDL is the only media download provider — no self-hosted/VPS component required. */
const allDLProviders: Record<Platform, MediaProvider> = {
  youtube: youtubeProvider,
  instagram: instagramProvider,
  x: xProvider,
  facebook: facebookProvider,
};

/** MEDIA_PROVIDER=mock (dev only, refused in production below) → built-in sample data.
 *  Anything else → AllDL. */
function isMockMode(): boolean {
  return process.env.MEDIA_PROVIDER === "mock";
}

/** The one entry point the API route calls. URL in, normalized result out, no leaks either way. */
export async function resolveMedia(url: string): Promise<MediaResult> {
  const platform = detectPlatform(url);
  if (!platform) {
    return { success: false, code: "unsupported_platform", message: "This platform isn't supported yet." };
  }

  const mock = isMockMode();
  if (mock && process.env.NODE_ENV === "production") {
    // Refuse to silently fake data in production, per product rule.
    return { success: false, code: "provider_error", message: "We couldn't process this link right now." };
  }

  try {
    if (mock) return await mockProvider.resolve(url, platform);
    return await allDLProviders[platform].resolve(url, platform);
  } catch (err) {
    if (err instanceof ProviderError) {
      const message =
        err.code === "rate_limited"
          ? "Too many requests. Please try again shortly."
          : err.code === "network_error"
            ? "Connection failed. Please try again."
            : "We couldn't process this link right now.";
      return { success: false, code: err.code, message };
    }
    return { success: false, code: "provider_error", message: "We couldn't process this link right now." };
  }
}
