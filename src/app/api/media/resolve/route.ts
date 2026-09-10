import { NextRequest, NextResponse } from "next/server";
import { resolveRequestSchema } from "@/lib/validation/url";
import { resolveMedia } from "@/lib/providers/media-service";
import { checkRateLimit } from "@/lib/rate-limit";
import type { MediaError } from "@/types/media";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 4096;

function errorResponse(status: number, error: MediaError) {
  return NextResponse.json(error, { status });
}

export async function POST(req: NextRequest) {
  // Abuse protection: identify by IP (behind a proxy in prod, trust the platform's header).
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = await checkRateLimit(ip);
  if (!limit.ok) {
    return errorResponse(429, {
      success: false,
      code: "rate_limited",
      message: "Too many requests. Please try again shortly.",
    });
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return errorResponse(413, { success: false, code: "invalid_url", message: "Request too large." });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, { success: false, code: "invalid_url", message: "That doesn't look like a valid request." });
  }

  const parsed = resolveRequestSchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse(400, {
      success: false,
      code: "invalid_url",
      message: "That doesn't look like a supported URL.",
    });
  }

  try {
    const result = await resolveMedia(parsed.data.url);
    if (!result.success) {
      const status = result.code === "rate_limited" ? 429 : result.code === "unsupported_platform" ? 422 : 502;
      return errorResponse(status, result);
    }
    return NextResponse.json(result, { status: 200 });
  } catch {
    // Never leak internals — logging (without the URL/PII) happens here in production.
    return errorResponse(500, {
      success: false,
      code: "provider_error",
      message: "We couldn't process this link right now. Please try again.",
    });
  }
}
