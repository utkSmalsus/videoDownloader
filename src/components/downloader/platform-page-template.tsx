import { DownloaderShell } from "./downloader-shell";
import { YoutubeDownloader } from "./youtube-downloader";
import { HeroVisual } from "@/components/3d/hero-visual";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";
import { PLATFORMS } from "@/lib/config/platforms";
import type { Platform } from "@/types/media";

export function PlatformPageTemplate({ platform }: { platform: Platform }) {
  const config = PLATFORMS[platform];
  const Icon = PLATFORM_ICONS[platform];

  return (
    <div data-platform={platform} className="relative mx-auto max-w-2xl overflow-hidden px-6 py-14 lg:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[380px] opacity-60"
        style={{ background: "radial-gradient(55% 50% at 50% 0%, var(--platform-glow), transparent 70%)" }}
        aria-hidden
      />

      <div className="relative mb-8 flex flex-col items-center text-center">
        <div className="absolute -top-6 right-0 hidden opacity-90 sm:block">
          <HeroVisual platform={platform} size="compact" />
        </div>
        <span className="platform-transition inline-flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-platform-soft text-platform-primary">
          <Icon className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{config.name} Downloader</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{config.description}</p>
      </div>

      <div className="relative">
        {platform === "youtube" ? (
          <YoutubeDownloader placeholder={config.urlPlaceholder} />
        ) : (
          <DownloaderShell platform={platform} placeholder={config.urlPlaceholder} />
        )}
      </div>
    </div>
  );
}
