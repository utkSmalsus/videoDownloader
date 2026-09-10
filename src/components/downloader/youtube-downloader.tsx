"use client";

import { useState } from "react";
import { motion } from "motion/react";
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
        {(
          [
            { id: "video", icon: Film, label: "Video" },
            { id: "course", icon: ListVideo, label: "Course" },
          ] as const
        ).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 sm:px-3.5",
              mode === id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {/* One shared layoutId means the pill physically slides between tabs
                instead of cross-fading — the motion shows where you went. */}
            {mode === id && (
              <motion.span
                layoutId="downloader-tab"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-[var(--radius-sm)] bg-surface shadow-[var(--shadow-sm)]"
                aria-hidden
              />
            )}
            <Icon className="relative size-3.5" aria-hidden />
            <span className="relative">
              <span className="hidden sm:inline">Download </span>
              {label}
            </span>
          </button>
        ))}
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
