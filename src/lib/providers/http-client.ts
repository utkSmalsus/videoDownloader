import { ProviderError } from "./types";

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Shared outbound call to the configured AllDL-compatible media resolver. Every platform
 * adapter routes through here so timeout/error handling lives in exactly one place. AllDL
 * takes one GET request with the source URL as a query param — no path, no auth required.
 */
export async function requestAllDL(mediaUrl: string): Promise<unknown> {
  const baseUrl = process.env.MEDIA_PROVIDER_BASE_URL;
  if (!baseUrl) {
    throw new ProviderError("Media provider is not configured", "provider_error");
  }
  const timeoutMs = Number(process.env.MEDIA_PROVIDER_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  const params = new URLSearchParams({ url: mediaUrl });

  let res: Response;
  try {
    res = await fetch(`${baseUrl}?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new ProviderError("Provider timed out", "network_error");
    }
    throw new ProviderError("Provider request failed", "network_error");
  }

  if (res.status === 429) throw new ProviderError("Provider rate limit", "rate_limited");
  if (!res.ok) throw new ProviderError(`Provider responded ${res.status}`, "provider_error");

  try {
    return await res.json();
  } catch {
    throw new ProviderError("Provider returned malformed JSON", "provider_error");
  }
}

