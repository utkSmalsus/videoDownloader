"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Inbox, Search, Trash2, RefreshCw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";
import { PLATFORM_LIST, PLATFORMS } from "@/lib/config/platforms";
import { historyStore, clearHistory, removeHistoryEntry } from "@/lib/storage/history";
import { cn } from "@/lib/utils/cn";
import type { Platform } from "@/types/media";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function HistoryList() {
  const entries = useSyncExternalStore(historyStore.subscribe, historyStore.getSnapshot, historyStore.getServerSnapshot);
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (platformFilter !== "all" && e.media.platform !== platformFilter) return false;
      if (q && !e.media.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, query, platformFilter]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-border px-6 py-16 text-center">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-medium text-foreground">No download history yet.</p>
        <p className="max-w-xs text-sm text-muted-foreground">Your downloaded media will appear here.</p>
        <Link href="/" className="mt-1">
          <Button variant="secondary" size="sm">
            Start downloading
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history…"
            aria-label="Search history"
            className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={clearHistory} className="self-end sm:self-auto">
          <Trash2 className="size-3.5" aria-hidden />
          Clear history
        </Button>
      </div>

      <div className="scroll-slim flex gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setPlatformFilter("all")}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
            platformFilter === "all"
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>
        {PLATFORM_LIST.map((p) => {
          const Icon = PLATFORM_ICONS[p.id];
          const active = platformFilter === p.id;
          return (
            <button
              key={p.id}
              type="button"
              data-platform={p.id}
              onClick={() => setPlatformFilter(active ? "all" : p.id)}
              className={cn(
                "platform-transition inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                active
                  ? "border-platform-primary bg-platform-soft text-platform-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {p.name}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-border px-6 py-12 text-center">
          <SearchX className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">No downloads match your search.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map(({ id, resolvedAt, media }) => {
            const Icon = PLATFORM_ICONS[media.platform];
            return (
              <li
                key={id}
                data-platform={media.platform}
                className="platform-transition group flex items-center gap-4 rounded-[var(--radius-md)] border border-border bg-surface p-3 hover:border-border-strong"
              >
                <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted sm:w-28">
                  {media.thumbnail && (
                    <Image src={media.thumbnail} alt="" fill sizes="112px" className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{media.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Icon className="size-3 text-platform-primary" aria-hidden />
                      {PLATFORMS[media.platform].name}
                    </span>
                    <span aria-hidden>·</span>
                    {formatDate(resolvedAt)}
                    {media.formats[0] && (
                      <>
                        <span aria-hidden>·</span>
                        {media.formats[0].quality} {media.formats[0].format.toUpperCase()}
                      </>
                    )}
                  </div>
                </div>
                <Link href={`/${PLATFORMS[media.platform].path}`} className="shrink-0">
                  <Button variant="secondary" size="sm">
                    <RefreshCw className="size-3.5" aria-hidden />
                    <span className="hidden sm:inline">Download again</span>
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
      )}
    </div>
  );
}
