"use client";

import { Menu } from "lucide-react";
import { Logo, BRAND_NAME } from "@/components/icons/logo";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur md:hidden">
      <button
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)] text-foreground hover:bg-muted"
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <div className="flex items-center gap-2">
        <Logo className="size-6" />
        <span className="text-sm font-semibold tracking-tight">{BRAND_NAME}</span>
      </div>
    </header>
  );
}
