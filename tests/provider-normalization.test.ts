import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveViaProvider } from "@/lib/providers/adapters/shared";
import { ProviderError } from "@/lib/providers/types";
import type { Platform } from "@/types/media";

const ORIGINAL_ENV = { ...process.env };

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }),
  );
}

describe("resolveViaProvider (AllDL)", () => {
  beforeEach(() => {
    process.env.MEDIA_PROVIDER_BASE_URL = "https://ahm7xmakki.com/api/alldl";
  });
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.unstubAllGlobals();
  });

  const platforms: Platform[] = ["youtube", "instagram", "x", "facebook"];
  it.each(platforms)("normalizes a successful %s response", async (platform) => {
    mockFetchOnce(200, {
      success: true,
      mediaInfo: {
        title: `A ${platform} video`,
        platform,
        videoUrl: "https://cdn.example.com/video.mp4",
        thumbnail: "https://cdn.example.com/thumb.jpg",
        qualities: [
          { quality: "720p", url: "https://cdn.example.com/720.mp4" },
          { quality: "1080p", url: "https://cdn.example.com/1080.mp4" },
        ],
      },
    });

    const result = await resolveViaProvider(`https://example.com/${platform}`, platform);
    expect(result.title).toBe(`A ${platform} video`);
    expect(result.platform).toBe(platform);
    expect(result.thumbnail).toBe("https://cdn.example.com/thumb.jpg");
  });

  it("handles a response containing only videoUrl", async () => {
    mockFetchOnce(200, { success: true, mediaInfo: { title: "Clip", videoUrl: "https://cdn.example.com/v.mp4" } });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.formats).toEqual([
      { id: "default-video", quality: "Best", format: "mp4", type: "video", downloadUrl: "https://cdn.example.com/v.mp4" },
    ]);
  });

  it("handles a response containing videoUrl + audioUrl", async () => {
    mockFetchOnce(200, {
      success: true,
      mediaInfo: { title: "Clip", videoUrl: "https://cdn.example.com/v.mp4", audioUrl: "https://cdn.example.com/a.mp3" },
    });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.formats).toHaveLength(2);
    expect(result.formats.find((f) => f.type === "audio")).toEqual({
      id: "default-audio",
      quality: "Audio",
      format: "mp3",
      type: "audio",
      downloadUrl: "https://cdn.example.com/a.mp3",
    });
  });

  it("handles a response containing a qualities list", async () => {
    mockFetchOnce(200, {
      success: true,
      mediaInfo: {
        title: "Clip",
        qualities: [
          { quality: "480p", url: "https://cdn.example.com/480.mp4" },
          { quality: "720p", url: "https://cdn.example.com/720.mp4" },
        ],
      },
    });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.formats).toEqual([
      { id: "video-720p", quality: "720p", format: "mp4", type: "video", downloadUrl: "https://cdn.example.com/720.mp4" },
      { id: "video-480p", quality: "480p", format: "mp4", type: "video", downloadUrl: "https://cdn.example.com/480.mp4" },
    ]);
  });

  it("exact spec payload: videoUrl + audioUrl + thumbnail + 4 qualities", async () => {
    mockFetchOnce(200, {
      success: true,
      mediaInfo: {
        title: "Test Video",
        platform: "YouTube",
        videoUrl: "https://example.com/best.mp4",
        audioUrl: "https://example.com/audio.mp3",
        thumbnail: "https://example.com/thumb.jpg",
        qualities: [
          { quality: "1080p", url: "https://example.com/1080.mp4" },
          { quality: "720p", url: "https://example.com/720.mp4" },
          { quality: "480p", url: "https://example.com/480.mp4" },
          { quality: "360p", url: "https://example.com/360.mp4" },
        ],
      },
    });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.thumbnail).toBe("https://example.com/thumb.jpg");
    // qualities take full precedence over the generic "Best" videoUrl label — no default-video.
    const video = result.formats.filter((f) => f.type === "video");
    expect(video.map((f) => f.quality)).toEqual(["1080p", "720p", "480p", "360p"]);
    expect(video.every((f) => f.format === "mp4")).toBe(true);
    const audio = result.formats.filter((f) => f.type === "audio");
    expect(audio).toEqual([
      { id: "default-audio", quality: "Audio", format: "mp3", type: "audio", downloadUrl: "https://example.com/audio.mp3" },
    ]);
  });

  it("qualities present: videoUrl is not shown as a separate 'Best' entry", async () => {
    mockFetchOnce(200, {
      success: true,
      mediaInfo: {
        title: "Full",
        videoUrl: "https://cdn.example.com/best.mp4",
        audioUrl: "https://cdn.example.com/a.mp3",
        qualities: [{ quality: "360p", url: "https://cdn.example.com/360.mp4" }],
      },
    });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.formats.map((f) => f.id)).toEqual(["video-360p", "default-audio"]);
  });

  it("qualities is an empty array: falls back to videoUrl as Best (same as missing)", async () => {
    mockFetchOnce(200, {
      success: true,
      mediaInfo: { title: "Empty qualities", videoUrl: "https://cdn.example.com/v.mp4", qualities: [] },
    });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.formats).toEqual([
      { id: "default-video", quality: "Best", format: "mp4", type: "video", downloadUrl: "https://cdn.example.com/v.mp4" },
    ]);
  });

  it("drops individually malformed quality entries but keeps the valid ones", async () => {
    mockFetchOnce(200, {
      success: true,
      mediaInfo: {
        title: "Mixed validity",
        qualities: [
          { quality: "1080p", url: "https://cdn.example.com/1080.mp4" },
          { quality: "720p" }, // missing url
          { url: "https://cdn.example.com/no-label.mp4" }, // missing quality
          { quality: "480p", url: "not-a-url" }, // invalid url
          "just a string", // not an object at all
          { quality: "360p", url: "https://cdn.example.com/360.mp4" },
        ],
      },
    });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.formats.map((f) => f.quality)).toEqual(["1080p", "360p"]);
  });

  it("only audioUrl, no video at all: succeeds with an empty video format list (CASE C)", async () => {
    mockFetchOnce(200, { success: true, mediaInfo: { title: "Audio only", audioUrl: "https://cdn.example.com/a.mp3" } });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.success).toBe(true);
    expect(result.formats.filter((f) => f.type === "video")).toEqual([]);
    expect(result.formats.filter((f) => f.type === "audio")).toHaveLength(1);
  });

  it("throws when AllDL returns success=false", async () => {
    mockFetchOnce(200, { success: false });
    await expect(resolveViaProvider("https://youtube.com/watch?v=1", "youtube")).rejects.toBeInstanceOf(ProviderError);
  });

  it("throws on a malformed response body", async () => {
    mockFetchOnce(200, { nonsense: true });
    await expect(resolveViaProvider("https://youtube.com/watch?v=1", "youtube")).rejects.toBeInstanceOf(ProviderError);
  });

  it("throws when success=true but mediaInfo is missing", async () => {
    mockFetchOnce(200, { success: true });
    await expect(resolveViaProvider("https://youtube.com/watch?v=1", "youtube")).rejects.toBeInstanceOf(ProviderError);
  });

  it("maps HTTP 429 to a rate_limited ProviderError", async () => {
    mockFetchOnce(429, {});
    await expect(resolveViaProvider("https://youtube.com/watch?v=1", "youtube")).rejects.toMatchObject({ code: "rate_limited" });
  });

  it("maps HTTP 500 to a provider_error", async () => {
    mockFetchOnce(500, {});
    await expect(resolveViaProvider("https://youtube.com/watch?v=1", "youtube")).rejects.toMatchObject({ code: "provider_error" });
  });

  it("maps a timeout to a network_error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(Object.assign(new Error("aborted"), { name: "TimeoutError" })),
    );
    await expect(resolveViaProvider("https://youtube.com/watch?v=1", "youtube")).rejects.toMatchObject({ code: "network_error" });
  });

  it("rejects a response whose media url is not http(s)", async () => {
    mockFetchOnce(200, { success: true, mediaInfo: { title: "Bad", videoUrl: "javascript:alert(1)" } });
    await expect(resolveViaProvider("https://youtube.com/watch?v=1", "youtube")).rejects.toBeInstanceOf(ProviderError);
  });

  it("deduplicates when videoUrl duplicates a quality url, preferring the explicit quality label", async () => {
    mockFetchOnce(200, {
      success: true,
      mediaInfo: {
        title: "Dup",
        videoUrl: "https://cdn.example.com/same.mp4",
        qualities: [{ quality: "1080p", url: "https://cdn.example.com/same.mp4" }],
      },
    });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.formats).toHaveLength(1);
    expect(result.formats[0]).toMatchObject({ quality: "1080p", downloadUrl: "https://cdn.example.com/same.mp4" });
  });

  it("deduplicates two quality entries that share the same download URL", async () => {
    mockFetchOnce(200, {
      success: true,
      mediaInfo: {
        title: "Dup qualities",
        qualities: [
          { quality: "1080p", url: "https://cdn.example.com/same.mp4" },
          { quality: "1080p60", url: "https://cdn.example.com/same.mp4" },
        ],
      },
    });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.formats).toHaveLength(1);
    expect(result.formats[0].quality).toBe("1080p");
  });

  it("sorts numeric qualities descending", async () => {
    mockFetchOnce(200, {
      success: true,
      mediaInfo: {
        title: "Sorted",
        qualities: [
          { quality: "360p", url: "https://cdn.example.com/360.mp4" },
          { quality: "1080p", url: "https://cdn.example.com/1080.mp4" },
          { quality: "720p", url: "https://cdn.example.com/720.mp4" },
        ],
      },
    });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.formats.map((f) => f.quality)).toEqual(["1080p", "720p", "360p"]);
  });

  it("preserves original order entirely when a quality can't be parsed as numeric", async () => {
    mockFetchOnce(200, {
      success: true,
      mediaInfo: {
        title: "Mixed",
        qualities: [
          { quality: "360p", url: "https://cdn.example.com/360.mp4" },
          { quality: "1080p", url: "https://cdn.example.com/1080.mp4" },
          { quality: "original", url: "https://cdn.example.com/orig.mp4" },
          { quality: "720p", url: "https://cdn.example.com/720.mp4" },
        ],
      },
    });

    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.formats.map((f) => f.quality)).toEqual(["360p", "1080p", "original", "720p"]);
  });

  it("CASE C: qualities empty and videoUrl missing — succeeds with no video formats rather than erroring", async () => {
    mockFetchOnce(200, { success: true, mediaInfo: { title: "Empty" } });
    const result = await resolveViaProvider("https://youtube.com/watch?v=1", "youtube");
    expect(result.success).toBe(true);
    expect(result.formats).toEqual([]);
  });

  it("fails clearly when no provider base URL is configured", async () => {
    delete process.env.MEDIA_PROVIDER_BASE_URL;
    await expect(resolveViaProvider("https://youtube.com/watch?v=1", "youtube")).rejects.toBeInstanceOf(ProviderError);
  });
});
