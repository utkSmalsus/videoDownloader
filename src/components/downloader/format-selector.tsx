"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { Check, Download, Film, Music, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { preferencesStore } from "@/lib/storage/preferences";
import type { MediaFormat } from "@/types/media";

const GROUP_LABEL = { video: "Video", audio: "Audio", image: "Image" } as const;
const GROUP_ICON = { video: Film, audio: Music, image: ImageIcon } as const;

function bytesToLabel(bytes?: number) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function formatMeta(f: MediaFormat): string {
  if (f.type === "video") return f.hasAudio === false ? "Video only" : "Video + Audio";
  if (f.type === "audio") return "Audio";
  return "Image";
}

function qualityHeight(quality: string): number | null {
  const match = quality.match(/(\d+)\s*p\b/i);
  return match ? Number(match[1]) : null;
}

/** Picks the initial highlighted format from the user's saved Settings preferences —
 *  which, until now, nothing actually read despite the Settings page promising they
 *  "pre-select your usual pick in the results panel". Falls back to the first format
 *  the provider returned (already sorted best-first), never to a fabricated one. */
function pickDefault(formats: MediaFormat[], preferredFormat: string, preferredQuality: string): string | undefined {
  if (formats.length === 0) return undefined;
  const ofType = formats.filter((f) => (preferredFormat === "mp3" ? f.type === "audio" : f.type === "video"));
  const pool = ofType.length > 0 ? ofType : formats;
  if (preferredQuality !== "highest") {
    const target = qualityHeight(preferredQuality);
    const exact = pool.find((f) => qualityHeight(f.quality) === target);
    if (exact) return exact.id;
  }
  return pool[0].id;
}

function FormatCard({
  format,
  selected,
  onSelect,
}: {
  format: MediaFormat;
  selected: boolean;
  onSelect: () => void;
}) {
  const size = bytesToLabel(format.sizeBytes);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "platform-transition group relative flex flex-col items-start gap-1 overflow-hidden rounded-[var(--radius-md)] border p-3.5 text-left",
        "hover:-translate-y-0.5 active:translate-y-0",
        selected
          ? "border-platform-primary bg-platform-soft/50 shadow-[0_0_0_1px_var(--platform-primary),0_10px_28px_-12px_var(--platform-glow)]"
          : "border-border bg-surface-sunken hover:border-border-strong hover:bg-surface hover:shadow-[var(--shadow-sm)]",
      )}
    >
      {/* Check badge animates in on select rather than just appearing — the state
          change is the moment worth acknowledging. */}
      <span
        className={cn(
          "absolute top-2.5 right-2.5 inline-flex size-5 items-center justify-center rounded-full transition-all duration-200",
          selected
            ? "scale-100 bg-platform-primary text-platform-primary-foreground opacity-100"
            : "scale-75 bg-muted text-muted-foreground opacity-0 group-hover:opacity-60",
        )}
        aria-hidden
      >
        <Check className="size-3" strokeWidth={3} />
      </span>

      <span className="pr-7 text-[15px] font-semibold text-foreground">{format.quality}</span>
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {format.format}
        {format.fps ? ` · ${format.fps}fps` : ""}
      </span>
      <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        {formatMeta(format)}
        {size && (
          <>
            <span aria-hidden>·</span>
            {size}
          </>
        )}
      </span>
    </button>
  );
}

export function FormatSelector({ formats }: { formats: MediaFormat[] }) {
  const prefs = useSyncExternalStore(
    preferencesStore.subscribe,
    preferencesStore.getSnapshot,
    preferencesStore.getServerSnapshot,
  );
  const defaultId = useMemo(
    () => pickDefault(formats, prefs.preferredFormat, prefs.preferredQuality),
    [formats, prefs.preferredFormat, prefs.preferredQuality],
  );
  const [chosenId, setChosenId] = useState<string | undefined>(undefined);
  const [started, setStarted] = useState(false);

  const selectedId = chosenId ?? defaultId;
  const selected = formats.find((f) => f.id === selectedId);
  const groups = ["video", "audio", "image"] as const;

  return (
    <div className="flex flex-col gap-5">
      {groups.map((type) => {
        const items = formats.filter((f) => f.type === type);
        const GroupIcon = GROUP_ICON[type];

        // The provider didn't return any video format for this link (no qualities, no
        // videoUrl) — say so explicitly rather than silently hiding the section. Audio/image
        // sections stay hidden when empty; only "video" gets this treatment, since a video
        // link with literally nothing playable is worth calling out.
        if (items.length === 0) {
          if (type !== "video") return null;
          return (
            <div key={type}>
              <div className="mb-2.5 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <GroupIcon className="size-3.5" aria-hidden />
                {GROUP_LABEL[type]}
              </div>
              <p className="rounded-[var(--radius-sm)] border border-dashed border-border bg-surface-sunken px-3.5 py-2.5 text-sm text-muted-foreground">
                No video formats available
              </p>
            </div>
          );
        }

        return (
          <div key={type}>
            <div className="mb-2.5 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <GroupIcon className="size-3.5" aria-hidden />
              {GROUP_LABEL[type]}
            </div>
            <div role="radiogroup" aria-label={`${GROUP_LABEL[type]} formats`} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {items.map((f) => (
                <FormatCard
                  key={f.id}
                  format={f}
                  selected={f.id === selectedId}
                  onSelect={() => {
                    setChosenId(f.id);
                    setStarted(false);
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}

      {selected && (
        <motion.a
          key={selected.id}
          href={selected.downloadUrl}
          download
          onClick={() => setStarted(true)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "platform-transition group/dl relative flex h-13 items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-md)]",
            "bg-platform-primary bg-[image:linear-gradient(135deg,var(--platform-gradient-from),var(--platform-gradient-mid),var(--platform-gradient-to))]",
            "text-base font-medium text-platform-primary-foreground",
            "shadow-[0_0_0_1px_var(--platform-primary),0_12px_34px_-10px_var(--platform-glow)]",
            "hover:-translate-y-px hover:brightness-[1.06] active:translate-y-0 active:scale-[0.99]",
            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
            "after:pointer-events-none after:absolute after:inset-0 after:-translate-x-full",
            "after:bg-[linear-gradient(90deg,transparent,oklch(1_0_0/0.25),transparent)]",
            "hover:after:translate-x-full after:transition-transform after:duration-700 after:ease-[var(--ease-out-quint)]",
          )}
        >
          {started ? (
            <>
              <Check className="size-4 animate-[var(--animate-pop)]" aria-hidden />
              Download started
            </>
          ) : (
            <>
              <Download className="size-4 transition-transform duration-200 group-hover/dl:translate-y-0.5" aria-hidden />
              Download {selected.quality} {selected.format.toUpperCase()}
            </>
          )}
        </motion.a>
      )}

      {/* Honest about what a native browser download can actually tell us — the click
          hands off to the browser's download manager, which never reports back to the page. */}
      {started && (
        <p className="-mt-2 text-center text-xs text-muted-foreground">
          Handed to your browser — check your downloads for the file.
        </p>
      )}
    </div>
  );
}
