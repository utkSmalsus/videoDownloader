import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

/** Ranges no server-initiated fetch should ever be allowed to reach. */
function isPrivateIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }
  if (v === 6) {
    const low = ip.toLowerCase();
    return low === "::1" || low.startsWith("fc") || low.startsWith("fd") || low.startsWith("fe80");
  }
  return false;
}

/**
 * Resolves a URL's hostname and rejects it if it points at a private/loopback/link-local
 * address. Call this before any server-side fetch that touches a URL not fully controlled
 * by our own config (e.g. a redirect target or a provider-supplied media URL).
 */
export async function assertPublicHost(rawUrl: string): Promise<void> {
  const { hostname, protocol } = new URL(rawUrl);
  if (protocol !== "https:" && protocol !== "http:") {
    throw new Error("SSRF guard: unsupported protocol");
  }
  if (isIP(hostname) && isPrivateIp(hostname)) {
    throw new Error("SSRF guard: private IP literal");
  }
  const records = await lookup(hostname, { all: true });
  if (records.some((r) => isPrivateIp(r.address))) {
    throw new Error("SSRF guard: hostname resolves to a private address");
  }
}
