import type { Metadata } from "next";
import { HistoryList } from "@/components/history/history-list";

export const metadata: Metadata = { title: "History", robots: { index: false } };

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">History</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Recent downloads, stored on this device. Nothing here is sent to a server.
      </p>
      <div className="mt-8">
        <HistoryList />
      </div>
    </div>
  );
}
