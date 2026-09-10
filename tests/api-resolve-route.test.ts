import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const ORIGINAL_ENV = { ...process.env };

function postRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/media/resolve", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/media/resolve (AllDL, end to end)", () => {
  beforeEach(() => {
    vi.stubEnv("MEDIA_PROVIDER", "alldl");
    vi.stubEnv("MEDIA_PROVIDER_BASE_URL", "https://ahm7xmakki.com/api/alldl");
  });
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("validates, calls AllDL, and returns a normalized MediaResult", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          mediaInfo: {
            title: "Rick Astley - Never Gonna Give You Up",
            platform: "YouTube",
            videoUrl: "https://cdn.example.com/best.mp4",
            thumbnail: "https://cdn.example.com/thumb.jpg",
            qualities: [
              { quality: "720p", url: "https://cdn.example.com/720.mp4" },
              { quality: "480p", url: "https://cdn.example.com/480.mp4" },
            ],
          },
        }),
      }),
    );

    const { POST } = await import("@/app/api/media/resolve/route");
    const res = await POST(postRequest({ url: "https://youtu.be/dQw4w9WgXcQ" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.platform).toBe("youtube");
    expect(json.title).toBe("Rick Astley - Never Gonna Give You Up");
    // qualities take precedence over the generic "Best" videoUrl label — no default-video entry.
    expect(json.formats.map((f: { quality: string }) => f.quality)).toEqual(["720p", "480p"]);
    // Never leaks AllDL's own field names/shape to the client.
    expect(json.mediaInfo).toBeUndefined();
  });

  it("rejects an unsupported platform without ever calling AllDL", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const { POST } = await import("@/app/api/media/resolve/route");
    const res = await POST(postRequest({ url: "https://www.tiktok.com/@user/video/123" }));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe("unsupported_platform");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a malformed request body", async () => {
    const { POST } = await import("@/app/api/media/resolve/route");
    const res = await POST(postRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns a safe error when AllDL is unreachable, without leaking internals", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNRESET at node:_http_client")));

    const { POST } = await import("@/app/api/media/resolve/route");
    const res = await POST(postRequest({ url: "https://youtu.be/dQw4w9WgXcQ" }));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).not.toMatch(/ECONNRESET|node:_http_client/);
  });
});
