import type { Metadata } from "next";
import { HistoryList } from "@/components/history/history-list";
import { AmbientBackground } from "@/components/visual/ambient-background";

export const metadata: Metadata = { title: "History", robots: { index: false } };

export default function HistoryPage() {
  return (
    <div className="relative min-h-full">
      <AmbientBackground variant="page" />
      <div className="relative mx-auto max-w-3xl px-6 pt-14 pb-20 lg:px-8">
        <h1 className="text-section font-semibold tracking-tight">History</h1>
        <p className="mt-2.5 text-[15px] text-muted-foreground">
          Recent downloads, stored on this device. Nothing here is sent to a server.
        </p>
        <div className="mt-8">
          <HistoryList />
        </div>
      </div>
    </div>
  );
}
