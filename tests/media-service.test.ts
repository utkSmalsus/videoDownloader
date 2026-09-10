import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { resolveMedia } from "@/lib/providers/media-service";

describe("resolveMedia (mock provider)", () => {
  beforeEach(() => {
    vi.stubEnv("MEDIA_PROVIDER", "mock");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves a supported YouTube URL", async () => {
    const result = await resolveMedia("https://www.youtube.com/watch?v=abc");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.platform).toBe("youtube");
      expect(result.formats.length).toBeGreaterThan(0);
    }
  });

  it("rejects an unsupported platform", async () => {
    const result = await resolveMedia("https://www.tiktok.com/@user/video/1");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.code).toBe("unsupported_platform");
  });

  it("refuses to fake data in production even if MEDIA_PROVIDER=mock", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const result = await resolveMedia("https://www.youtube.com/watch?v=abc");
    expect(result.success).toBe(false);
  });
});

function mockAllDLFetch(result: { status: number; body: unknown } | "network_error") {
  return vi.fn<(input: RequestInfo | URL) => Promise<unknown>>(async () => {
    if (result === "network_error") throw new Error("ECONNRESET");
    return { ok: result.status >= 200 && result.status < 300, status: result.status, json: async () => result.body };
  });
}

describe("resolveMedia (AllDL — the only download provider)", () => {
  beforeEach(() => {
    vi.stubEnv("MEDIA_PROVIDER", "alldl");
    process.env.MEDIA_PROVIDER_BASE_URL = "https://ahm7xmakki.com/api/alldl";
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    delete process.env.MEDIA_PROVIDER_BASE_URL;
    vi.unstubAllGlobals();
  });

  it("resolves a YouTube URL through AllDL — no yt-dlp/VPS component involved", async () => {
    const fetchSpy = mockAllDLFetch({
      status: 200,
      body: { success: true, mediaInfo: { title: "AllDL result", videoUrl: "https://cdn.example.com/best.mp4" } },
    });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await resolveMedia("https://www.youtube.com/watch?v=abc");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.title).toBe("AllDL result");
      expect(result.provider).toBe("alldl");
    }
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0][0])).toContain("ahm7xmakki.com");
  });

  it("resolves Instagram/X/Facebook through the same AllDL path, unchanged", async () => {
    const fetchSpy = mockAllDLFetch({
      status: 200,
      body: { success: true, mediaInfo: { title: "A reel", videoUrl: "https://cdn.example.com/reel.mp4" } },
    });
    vi.stubGlobal("fetch", fetchSpy);

    for (const url of ["https://www.instagram.com/reel/abc/", "https://x.com/user/status/123", "https://www.facebook.com/watch/?v=123"]) {
      const result = await resolveMedia(url);
      expect(result.success).toBe(true);
    }
  });

  it("returns a clean error when AllDL fails, without leaking internals", async () => {
    vi.stubGlobal("fetch", mockAllDLFetch("network_error"));
    const result = await resolveMedia("https://www.youtube.com/watch?v=abc");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).not.toMatch(/ECONNRESET|stack|at node:/);
    }
  });
});
