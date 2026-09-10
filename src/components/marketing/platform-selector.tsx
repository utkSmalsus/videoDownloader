import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PLATFORM_LIST } from "@/lib/config/platforms";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";

export function PlatformSelector() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PLATFORM_LIST.map((platform) => {
        const Icon = PLATFORM_ICONS[platform.id];
        return (
          <Link
            key={platform.id}
            href={`/${platform.path}`}
            className="group relative flex items-start gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-5 transition-all duration-200 hover:border-border-strong hover:shadow-[var(--shadow-md)]"
          >
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary transition-transform duration-200 group-hover:scale-105">
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{platform.name}</h3>
                <span className="text-xs font-medium text-muted-foreground">{platform.contentType}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{platform.description}</p>
            </div>
            <ArrowUpRight
              className="size-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
              aria-hidden
            />
          </Link>
        );
      })}
    </div>
  );
}
