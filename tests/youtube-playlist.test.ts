import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractPlaylistId, fetchYouTubePlaylist } from "@/lib/youtube/playlist";
import { ProviderError } from "@/lib/providers/types";

describe("extractPlaylistId", () => {
  it("extracts the ID from a dedicated playlist URL", () => {
    expect(extractPlaylistId("https://www.youtube.com/playlist?list=PLillGF-RfqbYE6Ik_EuXA2iZFcE082B3s")).toBe(
      "PLillGF-RfqbYE6Ik_EuXA2iZFcE082B3s",
    );
  });

  it("extracts the ID from a video URL that also carries &list=", () => {
    expect(extractPlaylistId("https://www.youtube.com/watch?v=AjKFApDdffA&list=PLillGF-RfqbYE6Ik_EuXA2iZFcE082B3s")).toBe(
      "PLillGF-RfqbYE6Ik_EuXA2iZFcE082B3s",
    );
  });

  it("works on the youtu.be short domain too", () => {
    expect(extractPlaylistId("https://youtu.be/AjKFApDdffA?list=PLillGF-RfqbYE6Ik_EuXA2iZFcE082B3s")).toBe(
      "PLillGF-RfqbYE6Ik_EuXA2iZFcE082B3s",
    );
  });

  it("rejects a plain video URL with no list param", () => {
    expect(extractPlaylistId("https://www.youtube.com/watch?v=AjKFApDdffA")).toBeNull();
  });

  it("rejects a channel URL", () => {
    expect(extractPlaylistId("https://www.youtube.com/channel/UCsomeChannelId")).toBeNull();
    expect(extractPlaylistId("https://www.youtube.com/@somehandle")).toBeNull();
  });

  it("rejects a search URL", () => {
    expect(extractPlaylistId("https://www.youtube.com/results?search_query=cats")).toBeNull();
  });

  it("rejects a non-YouTube URL", () => {
    expect(extractPlaylistId("https://www.instagram.com/reel/abc/?list=PLillGF-RfqbYE6Ik_EuXA2iZFcE082B3s")).toBeNull();
  });

  it("rejects a malformed list value", () => {
    expect(extractPlaylistId("https://www.youtube.com/playlist?list=%00%00")).toBeNull();
    expect(extractPlaylistId("https://www.youtube.com/playlist?list=")).toBeNull();
  });
});

function pageResponse(items: unknown[], nextPageToken?: string) {
  return { items, ...(nextPageToken ? { nextPageToken } : {}) };
}

function mockYouTubeFetch(handler: (url: URL) => { status: number; body: unknown }) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      const result = handler(url);
      return { ok: result.status >= 200 && result.status < 300, status: result.status, json: async () => result.body };
    }),
  );
}

describe("fetchYouTubePlaylist", () => {
  beforeEach(() => {
    process.env.YOUTUBE_DATA_API_KEY = "test-key";
  });
  afterEach(() => {
    delete process.env.YOUTUBE_DATA_API_KEY;
    vi.unstubAllGlobals();
  });

  it("retrieves a playlist's lessons in order with duration and thumbnail", async () => {
    mockYouTubeFetch((url) => {
      if (url.pathname.endsWith("/playlistItems")) {
        return {
          status: 200,
          body: pageResponse([
            {
              snippet: {
                title: "Lesson 2",
                position: 1,
                resourceId: { videoId: "vid2" },
                thumbnails: { medium: { url: "https://i.ytimg.com/vi/vid2/mqdefault.jpg" } },
              },
            },
            {
              snippet: {
                title: "Lesson 1",
                position: 0,
                resourceId: { videoId: "vid1" },
                thumbnails: { medium: { url: "https://i.ytimg.com/vi/vid1/mqdefault.jpg" } },
              },
            },
          ]),
        };
      }
      if (url.pathname.endsWith("/videos")) {
        return {
          status: 200,
          body: { items: [{ id: "vid1", contentDetails: { duration: "PT5M30S" } }, { id: "vid2", contentDetails: { duration: "PT1H2M3S" } }] },
        };
      }
      if (url.pathname.endsWith("/playlists")) {
        return { status: 200, body: { items: [{ snippet: { title: "My Course" } }] } };
      }
      throw new Error(`unexpected call: ${url}`);
    });

    const result = await fetchYouTubePlaylist("PLexample");
    expect(result.title).toBe("My Course");
    // Returned out of position order by the API — sorted back into playlist order.
    expect(result.lessons.map((l) => l.videoId)).toEqual(["vid1", "vid2"]);
    expect(result.lessons[0].durationSec).toBe(330);
    expect(result.lessons[1].durationSec).toBe(3723);
    expect(result.lessons[0].thumbnail).toBe("https://i.ytimg.com/vi/vid1/mqdefault.jpg");
    expect(result.lessons[0].url).toBe("https://www.youtube.com/watch?v=vid1");
  });

  it("follows nextPageToken until every item is retrieved — not just the first 50", async () => {
    let page1Called = false;
    let page2Called = false;
    mockYouTubeFetch((url) => {
      if (url.pathname.endsWith("/playlistItems")) {
        const token = url.searchParams.get("pageToken");
        if (!token) {
          page1Called = true;
          return {
            status: 200,
            body: pageResponse([{ snippet: { title: "Lesson 1", position: 0, resourceId: { videoId: "vid1" } } }], "PAGE2"),
          };
        }
        if (token === "PAGE2") {
          page2Called = true;
          return { status: 200, body: pageResponse([{ snippet: { title: "Lesson 2", position: 1, resourceId: { videoId: "vid2" } } }]) };
        }
      }
      if (url.pathname.endsWith("/videos")) return { status: 200, body: { items: [] } };
      if (url.pathname.endsWith("/playlists")) return { status: 200, body: { items: [] } };
      throw new Error(`unexpected call: ${url}`);
    });

    const result = await fetchYouTubePlaylist("PLexample");
    expect(page1Called).toBe(true);
    expect(page2Called).toBe(true);
    expect(result.lessons.map((l) => l.videoId)).toEqual(["vid1", "vid2"]);
  });

  it("skips deleted/private/unavailable items instead of failing the whole course", async () => {
    mockYouTubeFetch((url) => {
      if (url.pathname.endsWith("/playlistItems")) {
        return {
          status: 200,
          body: pageResponse([
            { snippet: { title: "Lesson 1", position: 0, resourceId: { videoId: "vid1" } } },
            { snippet: { title: "Private video", position: 1, resourceId: { videoId: "vid2" } } },
            { snippet: { title: "Deleted video", position: 2, resourceId: { videoId: "vid3" } } },
            { snippet: { title: "Lesson 4", position: 3, resourceId: {} } }, // no videoId at all
          ]),
        };
      }
      if (url.pathname.endsWith("/videos")) return { status: 200, body: { items: [] } };
      if (url.pathname.endsWith("/playlists")) return { status: 200, body: { items: [] } };
      throw new Error(`unexpected call: ${url}`);
    });

    const result = await fetchYouTubePlaylist("PLexample");
    expect(result.lessons.map((l) => l.videoId)).toEqual(["vid1"]);
  });

  it("falls back to \"Untitled course\" when the playlist metadata call fails", async () => {
    mockYouTubeFetch((url) => {
      if (url.pathname.endsWith("/playlistItems")) {
        return { status: 200, body: pageResponse([{ snippet: { title: "Lesson 1", position: 0, resourceId: { videoId: "vid1" } } }]) };
      }
      if (url.pathname.endsWith("/videos")) return { status: 200, body: { items: [] } };
      if (url.pathname.endsWith("/playlists")) return { status: 500, body: {} };
      throw new Error(`unexpected call: ${url}`);
    });

    const result = await fetchYouTubePlaylist("PLexample");
    expect(result.title).toBe("Untitled course");
    expect(result.lessons).toHaveLength(1);
  });

  it("throws when the playlist has no available videos", async () => {
    mockYouTubeFetch((url) => {
      if (url.pathname.endsWith("/playlistItems")) return { status: 200, body: pageResponse([]) };
      throw new Error(`unexpected call: ${url}`);
    });
    await expect(fetchYouTubePlaylist("PLexample")).rejects.toBeInstanceOf(ProviderError);
  });

  it("throws a clean provider_error when the playlist doesn't exist", async () => {
    mockYouTubeFetch(() => ({ status: 404, body: { error: { errors: [{ reason: "playlistNotFound" }] } } }));
    await expect(fetchYouTubePlaylist("PLdoesnotexist")).rejects.toMatchObject({ code: "provider_error" });
  });

  it("maps a quota-exceeded response to rate_limited", async () => {
    mockYouTubeFetch(() => ({ status: 403, body: { error: { errors: [{ reason: "quotaExceeded" }] } } }));
    await expect(fetchYouTubePlaylist("PLexample")).rejects.toMatchObject({ code: "rate_limited" });
  });

  it("maps a private/inaccessible playlist to a clean provider_error", async () => {
    mockYouTubeFetch(() => ({ status: 403, body: { error: { errors: [{ reason: "forbidden" }] } } }));
    await expect(fetchYouTubePlaylist("PLprivate")).rejects.toMatchObject({ code: "provider_error" });
  });

  it("maps a network failure to network_error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNRESET")));
    await expect(fetchYouTubePlaylist("PLexample")).rejects.toMatchObject({ code: "network_error" });
  });

  it("fails clearly when YOUTUBE_DATA_API_KEY is not configured", async () => {
    delete process.env.YOUTUBE_DATA_API_KEY;
    await expect(fetchYouTubePlaylist("PLexample")).rejects.toBeInstanceOf(ProviderError);
  });
});
