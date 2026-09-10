import { Download, Film, Music, Image as ImageIcon } from "lucide-react";
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

/** One format = one direct download — clicking the card *is* the download, same as before
 *  (a plain <a href download>), just presented as a selectable-looking card instead of a list
 *  row. No new "pick then confirm" step; the interaction is unchanged. */
function FormatCard({ f }: { f: MediaFormat }) {
  const size = bytesToLabel(f.sizeBytes);
  return (
    <a
      href={f.downloadUrl}
      download
      className="platform-transition group relative flex flex-col gap-1 rounded-[var(--radius-md)] border border-border bg-surface-sunken p-3.5 hover:-translate-y-0.5 hover:border-platform-primary hover:bg-surface hover:shadow-[var(--shadow-sm)] active:translate-y-0 active:scale-[0.98]"
    >
      <Download
        className="absolute top-3 right-3 size-3.5 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:text-platform-primary"
        aria-hidden
      />
      <span className="pr-5 text-[15px] font-semibold text-foreground">{f.quality}</span>
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {f.format}
        {f.fps ? ` · ${f.fps}fps` : ""}
      </span>
      <span className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        {formatMeta(f)}
        {size && (
          <>
            <span aria-hidden>·</span>
            {size}
          </>
        )}
      </span>
      {f.type === "video" && f.hasAudio === false && f.audioUrl && (
        <a
          href={f.audioUrl}
          download
          onClick={(e) => e.stopPropagation()}
          className="platform-transition mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-platform-soft hover:text-platform-primary"
          title="This video has no audio track — download the matching audio separately."
        >
          <Music className="size-3 shrink-0" aria-hidden />+ Audio
        </a>
      )}
    </a>
  );
}

export function FormatSelector({ formats }: { formats: MediaFormat[] }) {
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {items.map((f) => (
                <FormatCard key={f.id} f={f} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
