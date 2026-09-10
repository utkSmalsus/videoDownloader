import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PLATFORM_LIST } from "@/lib/config/platforms";
import { PLATFORM_ENVIRONMENTS } from "@/lib/config/platform-environment";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";
import { SpotlightCard } from "@/components/visual/spotlight-card";

export function PlatformSelector() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PLATFORM_LIST.map((platform) => {
        const Icon = PLATFORM_ICONS[platform.id];
        const env = PLATFORM_ENVIRONMENTS[platform.id];
        return (
          // data-platform scopes the accent tokens, so the hover glow, icon tint and
          // border all shift to that platform's colour with no per-platform CSS.
          <SpotlightCard
            key={platform.id}
            className="platform-transition group relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface/70 backdrop-blur-sm hover:border-platform-primary/40 hover:shadow-[var(--shadow-lg)]"
          >
            <div data-platform={platform.id} className="relative">
              <Link
                href={`/${platform.path}`}
                className="flex min-h-44 flex-col justify-between p-5 transition-transform duration-300 ease-[var(--ease-out-quint)] group-hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="platform-transition inline-flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-platform-soft text-platform-primary transition-transform duration-300 ease-[var(--ease-spring)] group-hover:scale-110">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-platform-primary"
                    aria-hidden
                  />
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">{platform.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{env.subhead}</p>
                  <span className="platform-transition mt-3 inline-block rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground group-hover:bg-platform-soft group-hover:text-platform-primary">
                    {platform.contentType}
                  </span>
                </div>
              </Link>
            </div>
          </SpotlightCard>
        );
      })}
    </div>
  );
}
