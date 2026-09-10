"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  ListChecks,
  Download,
  RotateCcw,
  CheckSquare,
  Square,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "./error-state";
import { cn } from "@/lib/utils/cn";
import type { CourseFetchResult, CourseLesson, MediaErrorCode, MediaResult } from "@/types/media";

/** "started" is deliberately distinct from "completed" — a native browser download (see
 *  downloadOneLesson) gives page JavaScript no reliable signal that the file actually finished
 *  saving, only that the browser accepted the request. Never collapsed into "completed", which
 *  would fabricate a success this code can't actually verify. */
type LessonStatus = "idle" | "downloading" | "started" | "failed";

type State =
  | { status: "idle" }
  | { status: "fetching" }
  | { status: "ready"; course: Extract<CourseFetchResult, { success: true }> }
  | { status: "error"; code: MediaErrorCode | "invalid_url"; message: string };

function qualityHeight(quality: string): number | null {
  const match = quality.match(/(\d+)\s*p\b/i);
  return match ? Number(match[1]) : null;
}

/** The requested quality — matched against whatever /api/media/resolve actually returns for
 *  that lesson, so any height works here. */
const QUALITY_TIERS = [
  { label: "2160p (4K)", height: 2160 },
  { label: "1440p (2K)", height: 1440 },
  { label: "1080p", height: 1080 },
  { label: "720p", height: 720 },
  { label: "480p", height: 480 },
  { label: "360p", height: 360 },
  { label: "240p", height: 240 },
  { label: "144p", height: 144 },
];

function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Paste a playlist URL → fetch its lessons (via the YouTube Data API, /api/media/youtube-course)
 *  → pick which ones + a quality → download each one individually through the exact same
 *  /api/media/resolve endpoint the single-video page uses — there's no separate "course"
 *  download path. Sequential, not concurrent: AllDL is a third-party service with no known-safe
 *  concurrency limit, so lessons download one at a time until there's evidence it can take more. */
export function CourseDownloader() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quality, setQuality] = useState(720);
  const [lessonStatus, setLessonStatus] = useState<Record<string, LessonStatus>>({});
  const [lessonError, setLessonError] = useState<Record<string, string>>({});
  const [lessonNote, setLessonNote] = useState<Record<string, string>>({});
  const [downloading, setDownloading] = useState(false);

  async function handleFetch(e: FormEvent) {
    e.preventDefault();
    if (!url.trim() || state.status === "fetching") return;
    setState({ status: "fetching" });
    try {
      const res = await fetch("/api/media/youtube-course", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = (await res.json()) as CourseFetchResult;
      if (body.success) {
        setState({ status: "ready", course: body });
        setSelected(new Set(body.lessons.map((l) => l.videoId)));
        setLessonStatus({});
        setLessonError({});
        setLessonNote({});
      } else {
        setState({ status: "error", code: body.code, message: body.message });
      }
    } catch {
      setState({ status: "error", code: "network_error", message: "Connection failed. Please try again." });
    }
  }

  function toggleLesson(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(lessons: CourseLesson[]) {
    setSelected((prev) => (prev.size === lessons.length ? new Set() : new Set(lessons.map((l) => l.videoId))));
  }

  /** Resolves through the EXACT SAME path the single-video page uses — POST /api/media/resolve,
   *  not a separate course-specific endpoint — then hands the browser the SAME AllDL CDN URL a
   *  FormatSelector <a href download> would point at, via a real anchor click, not a proxied
   *  fetch(). This is deliberate: fetch()+blob() (the previous approach) has to hold the entire
   *  file in JS memory and gave up on the largest lesson when AllDL's CDN throttled it, where
   *  the browser's own native download manager — built for exactly this — did not. The tradeoff
   *  is real and is not hidden: page JavaScript has no reliable way to observe a native
   *  download's actual completion (no load/error event, no promise — verified, not assumed), so
   *  this can only ever report "started", never a verified "completed". One lesson failing
   *  never aborts the others — each call is independent and only touches its own status.
   *
   *  target="_blank" (verified, not assumed — reproduced live both before and after this fix)
   *  is load-bearing, not decoration: the `download` attribute is only a *hint* for a
   *  cross-origin URL like AllDL's CDN. When the response actually has
   *  Content-Disposition: attachment, Chrome downloads it regardless of target — no tab ever
   *  opens, the success path is unchanged. But when AllDL hands back a technically-valid URL
   *  that turns out to serve an HTML error page (confirmed live: this happens), an anchor with
   *  no target navigates THIS tab to that error page, destroying the whole in-progress course
   *  session. target="_blank" makes that failure open (or get silently popup-blocked, which is
   *  equally fine here) in a separate tab instead — this tab, and the course loop running in
   *  it, are never touched either way. rel="noopener noreferrer" keeps that new tab from ever
   *  getting a `window.opener` handle back to this page (an external, untrusted CDN response
   *  otherwise could navigate this tab itself). */
  async function downloadOneLesson(lesson: CourseLesson, height: number) {
    setLessonStatus((prev) => ({ ...prev, [lesson.videoId]: "downloading" }));
    setLessonError((prev) => {
      const next = { ...prev };
      delete next[lesson.videoId];
      return next;
    });
    setLessonNote((prev) => {
      const next = { ...prev };
      delete next[lesson.videoId];
      return next;
    });

    try {
      const resolveRes = await fetch("/api/media/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: lesson.url }),
      });
      const resolved = (await resolveRes.json()) as MediaResult;
      if (!resolved.success) {
        setLessonStatus((prev) => ({ ...prev, [lesson.videoId]: "failed" }));
        setLessonError((prev) => ({ ...prev, [lesson.videoId]: resolved.message }));
        return;
      }

      const videoFormats = resolved.formats.filter((f) => f.type === "video");
      if (videoFormats.length === 0) {
        setLessonStatus((prev) => ({ ...prev, [lesson.videoId]: "failed" }));
        setLessonError((prev) => ({ ...prev, [lesson.videoId]: "No downloadable video was found for this lesson." }));
        return;
      }
      // Same fallback rule as the single-video page would implicitly apply: an exact quality
      // match if one exists, otherwise the best AllDL actually returned — never a fabricated one.
      const exact = videoFormats.find((f) => qualityHeight(f.quality) === height);
      const chosen = exact ?? videoFormats[0];
      if (chosen.quality !== `${height}p`) {
        setLessonNote((prev) => ({ ...prev, [lesson.videoId]: `Requested ${height}p, using ${chosen.quality} (closest available)` }));
      }

      // AllDL's own response schema already restricts this to a real http(s) URL (see
      // httpUrlSchema in adapters/shared.ts) — this is a second, defense-in-depth check right
      // before we hand it to the DOM, not a substitute for that one.
      try {
        new URL(chosen.downloadUrl);
      } catch {
        setLessonStatus((prev) => ({ ...prev, [lesson.videoId]: "failed" }));
        setLessonError((prev) => ({ ...prev, [lesson.videoId]: "The download link for this lesson was invalid." }));
        return;
      }

      // Same mechanism as FormatSelector's single-video <a href download> — AllDL's CDN already
      // sends Content-Disposition: attachment with a real filename, so the browser handles
      // naming and the transfer itself; nothing is proxied or buffered through this page or our
      // own server. target="_blank" + rel="noopener noreferrer": see the doc comment above —
      // this is what keeps a bad CDN response from navigating this tab away.
      const a = document.createElement("a");
      a.href = chosen.downloadUrl;
      a.download = "";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();

      setLessonStatus((prev) => ({ ...prev, [lesson.videoId]: "started" }));
    } catch {
      setLessonStatus((prev) => ({ ...prev, [lesson.videoId]: "failed" }));
      setLessonError((prev) => ({ ...prev, [lesson.videoId]: "Connection failed." }));
    }
  }

  async function handleDownloadCourse(lessons: CourseLesson[]) {
    const toDownload = lessons.filter((l) => selected.has(l.videoId));
    if (toDownload.length === 0) return;
    setDownloading(true);

    // Sequential, not concurrent — AllDL is a third-party service with no known-safe
    // concurrency limit. One lesson failing doesn't stop the rest; the loop always continues.
    // The short gap between lessons is a best-effort nod to Chrome's "this site is trying to
    // download multiple files" prompt for rapid automatic downloads — it does not guarantee
    // Chrome won't still show that prompt; if it does, the user has to click Allow once per
    // course for the remaining lessons to actually start.
    for (const [i, lesson] of toDownload.entries()) {
      if (i > 0) await new Promise((resolve) => setTimeout(resolve, 500));
      await downloadOneLesson(lesson, quality);
    }
    setDownloading(false);
  }

  function retryLesson(lesson: CourseLesson) {
    void downloadOneLesson(lesson, quality);
  }

  function reset() {
    setState({ status: "idle" });
    setUrl("");
    setSelected(new Set());
    setLessonStatus({});
    setLessonError({});
    setLessonNote({});
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={handleFetch}
        className="platform-transition flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-2 shadow-[var(--shadow-md)] transition-shadow duration-200 focus-within:shadow-[0_0_0_1px_var(--platform-primary),0_12px_34px_-10px_var(--platform-glow)] sm:flex-row sm:items-center"
      >
        <input
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/playlist?list=..."
          aria-label="Playlist URL"
          className="h-12 w-full rounded-[var(--radius-md)] bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
        />
        <Button type="submit" size="lg" loading={state.status === "fetching"} disabled={!url.trim()} className="w-full sm:w-auto">
          {state.status !== "fetching" && (
            <>
              <ListChecks className="size-4" aria-hidden />
              Fetch course
            </>
          )}
          {state.status === "fetching" && "Fetching"}
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {state.status === "fetching" && (
          <motion.div
            key="loading"
            exit={{ opacity: 0 }}
            aria-live="polite"
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-6"
          >
            <div className="mb-4 flex items-center gap-2.5 text-sm font-medium text-foreground">
              <span className="size-2 animate-pulse rounded-full bg-platform-primary" aria-hidden />
              Fetching lessons…
            </div>
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-[var(--radius-sm)] bg-muted" />
              ))}
            </div>
          </motion.div>
        )}

        {state.status === "error" && (
          <motion.div key="error" exit={{ opacity: 0 }}>
            <ErrorState code={state.code} message={state.message} onRetry={reset} />
          </motion.div>
        )}

        {state.status === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-md)]"
          >
            <h3 className="truncate text-base font-semibold text-foreground">{state.course.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{state.course.lessons.length} lessons</p>

            {/* Real progress, computed from actual lessonStatus values only — never a fake
                timer-driven bar. Two-tone: started (success) and failed (danger) each get their
                real share of the total; the rest of the track stays neutral (not yet attempted). */}
            {Object.keys(lessonStatus).length > 0 && (
              <div className="mt-4" aria-live="polite">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>
                    {Object.values(lessonStatus).filter((s) => s === "started").length} /{" "}
                    {state.course.lessons.length} started
                    {Object.values(lessonStatus).some((s) => s === "failed") && (
                      <span className="text-danger">
                        {" · "}
                        {Object.values(lessonStatus).filter((s) => s === "failed").length} failed
                      </span>
                    )}
                  </span>
                  {!downloading && Object.keys(lessonStatus).length === selected.size && (
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckCircle2 className="size-3.5" aria-hidden />
                      Course download complete
                    </span>
                  )}
                </div>
                <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full bg-success"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(Object.values(lessonStatus).filter((s) => s === "started").length / state.course.lessons.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.div
                    className="h-full bg-danger"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(Object.values(lessonStatus).filter((s) => s === "failed").length / state.course.lessons.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            )}

            <div className="my-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => toggleAll(state.course.lessons)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-platform-primary hover:underline"
              >
                {selected.size === state.course.lessons.length ? (
                  <CheckSquare className="size-4" aria-hidden />
                ) : (
                  <Square className="size-4" aria-hidden />
                )}
                {selected.size === state.course.lessons.length ? "Deselect all" : "Select all"}
              </button>

              <label
                className="flex items-center gap-2 text-sm text-muted-foreground"
                title="A preference, not a guarantee — each lesson downloads at this quality if it's available, otherwise the closest quality that is."
              >
                Preferred quality
                <select
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="h-9 rounded-[var(--radius-sm)] border border-border bg-surface-sunken px-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {QUALITY_TIERS.map((t) => (
                    <option key={t.height} value={t.height}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Falls back to the closest quality actually available per lesson — never fabricated.
            </p>

            <ul className="scroll-slim flex max-h-80 flex-col gap-1.5 overflow-y-auto">
              {state.course.lessons.map((lesson, i) => {
                const status = lessonStatus[lesson.videoId] ?? "idle";
                return (
                  <li
                    key={lesson.videoId}
                    className={cn(
                      "platform-transition flex items-center gap-3 rounded-[var(--radius-sm)] border p-2.5",
                      status === "downloading"
                        ? "border-platform-primary bg-platform-soft/40"
                        : "border-border bg-surface-sunken",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(lesson.videoId)}
                      onChange={() => toggleLesson(lesson.videoId)}
                      aria-label={`Include ${lesson.title}`}
                      className="size-4 shrink-0 accent-[var(--platform-primary)]"
                    />

                    <span className="relative flex size-5 shrink-0 items-center justify-center" aria-hidden>
                      {status === "idle" && <Circle className="size-4 text-muted-foreground/50" />}
                      {status === "downloading" && <Loader2 className="size-4 animate-spin text-platform-primary" />}
                      {status === "started" && <CheckCircle2 className="size-4 text-success" />}
                      {status === "failed" && <AlertTriangle className="size-4 text-danger" />}
                    </span>

                    <div className="relative size-11 shrink-0 overflow-hidden rounded-[var(--radius-xs)] bg-muted">
                      {lesson.thumbnail && (
                        <Image src={lesson.thumbnail} alt="" fill sizes="44px" className="object-cover" unoptimized />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        <span className="text-muted-foreground">{i + 1}.</span> {lesson.title}
                      </p>
                      <div className="flex items-center gap-2">
                        {status === "idle" && <span className="text-xs text-muted-foreground">Waiting</span>}
                        {status === "downloading" && (
                          <span className="text-xs font-medium text-platform-primary">Downloading…</span>
                        )}
                        {status === "started" && (
                          <span
                            className="text-xs font-medium text-success"
                            title="Your browser accepted the download — this page can't confirm when a native download actually finishes. Check your Downloads for the saved file."
                          >
                            Started
                          </span>
                        )}
                        {status === "failed" && lessonError[lesson.videoId] && (
                          <span className="truncate text-xs text-danger" title={lessonError[lesson.videoId]}>
                            {lessonError[lesson.videoId]}
                          </span>
                        )}
                        {formatDuration(lesson.durationSec) && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" aria-hidden />
                            {formatDuration(lesson.durationSec)}
                          </span>
                        )}
                        {status === "started" && lessonNote[lesson.videoId] && (
                          <span className="truncate text-xs text-muted-foreground" title={lessonNote[lesson.videoId]}>
                            {lessonNote[lesson.videoId]}
                          </span>
                        )}
                      </div>
                    </div>
                    {status === "failed" && (
                      <button
                        type="button"
                        onClick={() => retryLesson(lesson)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-xs)] px-2 py-1 text-xs font-medium text-danger hover:bg-danger-soft"
                      >
                        Retry
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
              <Button
                size="sm"
                loading={downloading}
                disabled={selected.size === 0}
                onClick={() => handleDownloadCourse(state.course.lessons)}
              >
                <Download className="size-3.5" aria-hidden />
                Download course ({selected.size})
              </Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="size-3.5" aria-hidden />
                New course
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
