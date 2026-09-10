"use client";

import { useState, useSyncExternalStore } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";
import { sidebarStore } from "@/lib/storage/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(sidebarStore.subscribe, sidebarStore.getSnapshot, sidebarStore.getServerSnapshot);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => sidebarStore.set(!collapsed)} />
      </div>

      <Header onMenuClick={() => setMobileOpen(true)} />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="scroll-slim min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
