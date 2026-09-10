import { Download, Film, Music } from "lucide-react";
import type { MediaFormat } from "@/types/media";

const GROUP_LABEL = { video: "Video", audio: "Audio", image: "Image" } as const;
const GROUP_ICON = { video: Film, audio: Music, image: Film } as const;

function bytesToLabel(bytes?: number) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export function FormatSelector({ formats }: { formats: MediaFormat[] }) {
  const groups = ["video", "audio", "image"] as const;

  return (
    <div className="flex flex-col gap-4">
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
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <GroupIcon className="size-3.5" aria-hidden />
                {GROUP_LABEL[type]}
              </div>
              <p className="rounded-[var(--radius-sm)] border border-border bg-surface-sunken px-3.5 py-2.5 text-sm text-muted-foreground">
                No video formats available
              </p>
            </div>
          );
        }

        return (
          <div key={type}>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <GroupIcon className="size-3.5" aria-hidden />
              {GROUP_LABEL[type]}
            </div>
            <ul className="flex flex-col gap-1.5">
              {items.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border bg-surface-sunken px-3.5 py-2.5"
                >
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="font-medium text-foreground">{f.quality}</span>
                    <span className="text-muted-foreground uppercase">{f.format}</span>
                    {f.fps && <span className="text-xs text-muted-foreground">{f.fps}fps</span>}
                    {bytesToLabel(f.sizeBytes) && (
                      <span className="text-xs text-muted-foreground">{bytesToLabel(f.sizeBytes)}</span>
                    )}
                    {f.type === "video" && f.hasAudio === false && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                        No audio
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={f.downloadUrl}
                      download
                      className="platform-transition inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2.5 py-1.5 text-sm font-medium text-platform-primary hover:bg-platform-soft"
                    >
                      <Download className="size-3.5" aria-hidden />
                      Download
                    </a>
                    {f.type === "video" && f.hasAudio === false && f.audioUrl && (
                      <a
                        href={f.audioUrl}
                        download
                        className="platform-transition inline-flex items-center gap-1 rounded-[var(--radius-xs)] px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-platform-soft hover:text-platform-primary"
                        title="This video has no audio track — download the matching audio separately."
                      >
                        <Music className="size-3 shrink-0" aria-hidden />+ Audio
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
