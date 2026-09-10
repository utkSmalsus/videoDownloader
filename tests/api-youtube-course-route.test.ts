import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

function postRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/media/youtube-course", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/media/youtube-course", () => {
  beforeEach(() => {
    vi.stubEnv("YOUTUBE_DATA_API_KEY", "test-key");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("returns the normalized course for a YouTube playlist URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input));
        if (url.pathname.endsWith("/playlistItems")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ items: [{ snippet: { title: "Lesson 1", position: 0, resourceId: { videoId: "abc123" } } }] }),
          };
        }
        if (url.pathname.endsWith("/videos")) return { ok: true, status: 200, json: async () => ({ items: [] }) };
        if (url.pathname.endsWith("/playlists")) return { ok: true, status: 200, json: async () => ({ items: [{ snippet: { title: "Full Course" } }] }) };
        throw new Error(`unexpected call: ${url}`);
      }),
    );

    const { POST } = await import("@/app/api/media/youtube-course/route");
    const res = await POST(postRequest({ url: "https://www.youtube.com/playlist?list=PLexample1234567890" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.title).toBe("Full Course");
    expect(json.lessons).toHaveLength(1);
  });

  it("accepts a video URL that also carries &list=", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input));
        if (url.pathname.endsWith("/playlistItems")) {
          return { ok: true, status: 200, json: async () => ({ items: [{ snippet: { title: "Lesson 1", position: 0, resourceId: { videoId: "abc123" } } }] }) };
        }
        if (url.pathname.endsWith("/videos")) return { ok: true, status: 200, json: async () => ({ items: [] }) };
        if (url.pathname.endsWith("/playlists")) return { ok: true, status: 200, json: async () => ({ items: [] }) };
        throw new Error(`unexpected call: ${url}`);
      }),
    );

    const { POST } = await import("@/app/api/media/youtube-course/route");
    const res = await POST(postRequest({ url: "https://www.youtube.com/watch?v=AjKFApDdffA&list=PLexample1234567890" }));
    expect(res.status).toBe(200);
  });

  it("rejects a plain video URL with no playlist — tells the user a playlist URL is required", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const { POST } = await import("@/app/api/media/youtube-course/route");
    const res = await POST(postRequest({ url: "https://www.youtube.com/watch?v=AjKFApDdffA" }));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.message).toMatch(/playlist/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a channel URL", async () => {
    const { POST } = await import("@/app/api/media/youtube-course/route");
    const res = await POST(postRequest({ url: "https://www.youtube.com/channel/UCsomeChannelId" }));
    expect(res.status).toBe(422);
  });

  it("rejects a non-YouTube URL without calling the YouTube Data API", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const { POST } = await import("@/app/api/media/youtube-course/route");
    const res = await POST(postRequest({ url: "https://www.instagram.com/reel/abc123/" }));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe("unsupported_platform");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a malformed request body", async () => {
    const { POST } = await import("@/app/api/media/youtube-course/route");
    const res = await POST(postRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns a clean, actionable error when YOUTUBE_DATA_API_KEY is missing — never calls the API", async () => {
    vi.unstubAllEnvs();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const { POST } = await import("@/app/api/media/youtube-course/route");
    const res = await POST(postRequest({ url: "https://www.youtube.com/playlist?list=PLexample1234567890" }));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.code).toBe("not_configured");
    expect(json.message).toBe("YouTube Course downloads are temporarily unavailable.");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns a safe error without leaking internals when the YouTube Data API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED at node:_http_client")));

    const { POST } = await import("@/app/api/media/youtube-course/route");
    const res = await POST(postRequest({ url: "https://www.youtube.com/playlist?list=PLexample1234567890" }));
    expect(res.status).toBe(504);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).not.toMatch(/ECONNREFUSED|node:_http_client/);
  });
});
