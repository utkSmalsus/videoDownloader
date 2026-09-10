"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";
import { sidebarStore } from "@/lib/storage/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(sidebarStore.subscribe, sidebarStore.getSnapshot, sidebarStore.getServerSnapshot);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => sidebarStore.set(!collapsed)} />
      </div>

      <Header onMenuClick={() => setMobileOpen(true)} />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="scroll-slim min-w-0 flex-1 overflow-y-auto">
        {/* Route transition. Keyed on pathname so each page mounts fresh and fades up.
            Deliberately short (0.22s) and tiny (6px) — it should register as polish,
            never as latency between clicking a nav item and reading the page. */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
