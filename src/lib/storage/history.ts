import type { ResolvedMedia } from "@/types/media";
import { createLocalStore } from "@/lib/utils/local-store";

/**
 * Local-only download history. No auth/database exists yet, so browser storage is the
 * honest choice — swapping this module for a server-backed API later doesn't touch callers.
 */
export interface HistoryEntry {
  id: string;
  resolvedAt: number;
  media: ResolvedMedia;
}

const MAX_ENTRIES = 50;

export const historyStore = createLocalStore<HistoryEntry[]>("fp:history", []);

export function addHistoryEntry(media: ResolvedMedia): void {
  if (typeof window === "undefined") return;
  const entry: HistoryEntry = { id: crypto.randomUUID(), resolvedAt: Date.now(), media };
  historyStore.set([entry, ...historyStore.getSnapshot()].slice(0, MAX_ENTRIES));
}

export function clearHistory(): void {
  historyStore.set([]);
}

export function removeHistoryEntry(id: string): void {
  historyStore.set(historyStore.getSnapshot().filter((e) => e.id !== id));
}
