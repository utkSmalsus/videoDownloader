"use client";

import { useState } from "react";
import { Film, ListVideo } from "lucide-react";
import { DownloaderShell } from "./downloader-shell";
import { CourseDownloader } from "./course-downloader";
import { cn } from "@/lib/utils/cn";

type Mode = "video" | "course";

/** YouTube-only: adds a "Download Video" / "Download Course" switcher above the usual
 *  DownloaderShell. Every other platform page renders DownloaderShell directly — this wrapper
 *  exists only here, so the shared downloader flow stays untouched for Instagram/X/Facebook.
 *
 *  Both panes stay mounted at all times — only their visibility toggles (`hidden`, not a
 *  conditional `{mode === ... ? <A/> : <B/>}`). Unmounting on tab switch would reset each
 *  component's own state (a resolved video, a fetched course and its per-lesson download
 *  progress), so anything in progress would silently vanish the moment you switched tabs and
 *  switched back. */
export function YoutubeDownloader({ placeholder }: { placeholder: string }) {
  const [mode, setMode] = useState<Mode>("video");

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Download mode"
        className="inline-flex self-center rounded-[var(--radius-md)] border border-border bg-surface-sunken p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "video"}
          onClick={() => setMode("video")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 sm:px-3.5",
            mode === "video"
              ? "bg-surface text-foreground shadow-[var(--shadow-sm)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Film className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Download </span>Video
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "course"}
          onClick={() => setMode("course")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 sm:px-3.5",
            mode === "course"
              ? "bg-surface text-foreground shadow-[var(--shadow-sm)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ListVideo className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Download </span>Course
        </button>
      </div>

      <div hidden={mode !== "video"}>
        <DownloaderShell platform="youtube" placeholder={placeholder} />
      </div>
      <div hidden={mode !== "course"}>
        <CourseDownloader />
      </div>
    </div>
  );
}
