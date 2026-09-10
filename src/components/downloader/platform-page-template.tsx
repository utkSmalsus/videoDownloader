import { DownloaderShell } from "./downloader-shell";
import { YoutubeDownloader } from "./youtube-downloader";
import { AmbientBackground } from "@/components/visual/ambient-background";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";
import { PLATFORMS } from "@/lib/config/platforms";
import { PLATFORM_ENVIRONMENTS } from "@/lib/config/platform-environment";
import { cn } from "@/lib/utils/cn";
import type { Platform } from "@/types/media";

/** The one bit of per-platform decoration. Everything else on the page is shared —
 *  this is what makes /x feel editorial and /youtube feel cinematic. */
function Motif({ kind }: { kind: PlatformEnvironmentMotif }) {
  if (kind === "timeline") {
    // A scrubber: filled progress, playhead, tick marks. Reads as "video tooling".
    return (
      <div className="mt-7 flex items-center gap-3" aria-hidden>
        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">00:00</span>
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="platform-transition absolute inset-y-0 left-0 w-1/3 rounded-full bg-platform-primary" />
          <div className="absolute inset-y-0 left-1/3 w-px bg-platform-primary shadow-[0_0_10px_var(--platform-glow)]" />
        </div>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-3 w-px bg-border-strong" />
          ))}
        </div>
      </div>
    );
  }

  if (kind === "gradient-ring") {
    // Instagram's multi-hue sweep, used as one thin line rather than a page-wide wash.
    return (
      <div
        className="mt-7 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--platform-gradient-from), var(--platform-gradient-mid), var(--platform-gradient-to), transparent)",
        }}
        aria-hidden
      />
    );
  }

  if (kind === "rule") {
    // Editorial: a plain hairline and nothing else.
    return <div className="mt-7 h-px w-full bg-border" aria-hidden />;
  }

  // social-card: two soft corner brackets suggesting a post frame.
  return (
    <div className="relative mt-7 h-px w-full bg-border" aria-hidden>
      <span className="platform-transition absolute -top-1.5 left-0 size-3 rounded-tl-[var(--radius-xs)] border-t-2 border-l-2 border-platform-primary" />
      <span className="platform-transition absolute -top-1.5 right-0 size-3 rounded-tr-[var(--radius-xs)] border-t-2 border-r-2 border-platform-primary" />
    </div>
  );
}

type PlatformEnvironmentMotif = (typeof PLATFORM_ENVIRONMENTS)[Platform]["motif"];

export function PlatformPageTemplate({ platform }: { platform: Platform }) {
  const config = PLATFORMS[platform];
  const env = PLATFORM_ENVIRONMENTS[platform];
  const Icon = PLATFORM_ICONS[platform];
  const editorial = env.motif === "rule";

  return (
    <div data-platform={platform} className="relative min-h-full">
      <AmbientBackground variant={env.ambient} grid={!editorial} />

      <div className="relative mx-auto max-w-2xl px-6 pt-14 pb-20 sm:pt-20 lg:px-8">
        <div className={cn("flex flex-col", editorial ? "items-start text-left" : "items-center text-center")}>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "platform-transition inline-flex size-11 items-center justify-center rounded-[var(--radius-md)]",
                // Instagram gets the gradient treatment on the badge itself; the rest use
                // the flat soft tint so the accent stays a highlight, not the whole page.
                env.motif === "gradient-ring"
                  ? "bg-[image:linear-gradient(135deg,var(--platform-gradient-from),var(--platform-gradient-mid),var(--platform-gradient-to))] text-platform-primary-foreground shadow-[0_8px_24px_-8px_var(--platform-glow)]"
                  : "bg-platform-soft text-platform-primary",
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="platform-transition text-xs font-medium tracking-[0.14em] text-platform-primary uppercase">
              {env.kicker}
            </span>
          </div>

          <h1
            className={cn(
              "mt-5 text-balance",
              editorial
                ? "text-[clamp(2rem,1.2rem+3.4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.035em]"
                : "text-section font-semibold",
            )}
          >
            {env.headline}
          </h1>
          <p className={cn("mt-3 text-[15px] leading-relaxed text-muted-foreground", !editorial && "max-w-md")}>
            {env.subhead}
          </p>
        </div>

        <Motif kind={env.motif} />

        <div className="relative mt-8">
          {platform === "youtube" ? (
            <YoutubeDownloader placeholder={config.urlPlaceholder} />
          ) : (
            <DownloaderShell platform={platform} placeholder={config.urlPlaceholder} />
          )}
        </div>
      </div>
    </div>
  );
}
