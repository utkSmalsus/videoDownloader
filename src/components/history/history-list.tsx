"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Inbox, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";
import { PLATFORMS } from "@/lib/config/platforms";
import { historyStore, clearHistory, removeHistoryEntry } from "@/lib/storage/history";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function HistoryList() {
  const entries = useSyncExternalStore(historyStore.subscribe, historyStore.getSnapshot, historyStore.getServerSnapshot);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface px-6 py-16 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-medium text-foreground">No downloads yet.</p>
        <p className="text-sm text-muted-foreground">Resolved links will show up here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
        >
          <Trash2 className="size-3.5" aria-hidden />
          Clear history
        </Button>
      </div>

      <ul className="flex flex-col gap-2">
        {entries.map(({ id, resolvedAt, media }) => {
          const Icon = PLATFORM_ICONS[media.platform];
          return (
            <li
              key={id}
              data-platform={media.platform}
              className="flex items-center gap-4 rounded-[var(--radius-md)] border border-border bg-surface p-3"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted">
                {media.thumbnail && (
                  <Image src={media.thumbnail} alt="" fill sizes="56px" className="object-cover" unoptimized />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{media.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="size-3 text-platform-primary" aria-hidden />
                  {PLATFORMS[media.platform].name}
                  <span aria-hidden>·</span>
                  {formatDate(resolvedAt)}
                  {media.formats[0] && (
                    <>
                      <span aria-hidden>·</span>
                      {media.formats[0].format.toUpperCase()}
                    </>
                  )}
                </div>
              </div>
              <Link href={`/${PLATFORMS[media.platform].path}`} className="shrink-0">
                <Button variant="secondary" size="sm">
                  <RefreshCw className="size-3.5" aria-hidden />
                  Download again
                </Button>
              </Link>
              <button
                onClick={() => removeHistoryEntry(id)}
                aria-label="Remove from history"
                className="shrink-0 rounded-[var(--radius-xs)] p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
