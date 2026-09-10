import { describe, it, expect } from "vitest";
import { detectPlatform, isSupportedUrl, resolveRequestSchema } from "@/lib/validation/url";

describe("detectPlatform", () => {
  it("recognizes a valid YouTube URL", () => {
    expect(detectPlatform("https://www.youtube.com/watch?v=abc123")).toBe("youtube");
    expect(detectPlatform("https://youtu.be/abc123")).toBe("youtube");
  });

  it("recognizes a valid Instagram URL", () => {
    expect(detectPlatform("https://www.instagram.com/reel/abc123/")).toBe("instagram");
  });

  it("recognizes a valid X URL", () => {
    expect(detectPlatform("https://x.com/user/status/12345")).toBe("x");
    expect(detectPlatform("https://twitter.com/user/status/12345")).toBe("x");
  });

  it("recognizes a valid Facebook URL", () => {
    expect(detectPlatform("https://www.facebook.com/watch/?v=123456789")).toBe("facebook");
    expect(detectPlatform("https://fb.watch/abc123/")).toBe("facebook");
  });

  it("rejects a malformed URL", () => {
    expect(detectPlatform("not a url")).toBeNull();
    expect(detectPlatform("javascript:alert(1)")).toBeNull();
  });

  it("rejects an unsupported platform", () => {
    expect(detectPlatform("https://www.tiktok.com/@user/video/123")).toBeNull();
  });

  it("rejects a private/internal address disguised as a domain path", () => {
    // Not a real threat model here (no domain match), but confirms no accidental match.
    expect(detectPlatform("http://169.254.169.254/latest/meta-data")).toBeNull();
  });
});

describe("isSupportedUrl", () => {
  it("mirrors detectPlatform", () => {
    expect(isSupportedUrl("https://youtube.com/watch?v=1")).toBe(true);
    expect(isSupportedUrl("https://example.com")).toBe(false);
  });
});

describe("resolveRequestSchema", () => {
  it("accepts a well-formed request body", () => {
    const result = resolveRequestSchema.safeParse({ url: "https://youtube.com/watch?v=1" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing url", () => {
    expect(resolveRequestSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an oversized url", () => {
    const huge = "https://youtube.com/" + "a".repeat(3000);
    expect(resolveRequestSchema.safeParse({ url: huge }).success).toBe(false);
  });
});
