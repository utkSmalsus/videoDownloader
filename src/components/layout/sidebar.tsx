"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { Logo, BRAND_NAME } from "@/components/icons/logo";
import { primaryNavItems, secondaryNavItems } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "flex h-full flex-col border-r border-border bg-surface-sunken py-4 transition-[width] duration-200 ease-[var(--ease-out-quint)]",
        collapsed ? "w-[76px] px-2.5" : "w-64 px-3",
      )}
    >
      <Link
        href="/"
        onClick={onNavigate}
        className="mb-5 flex items-center gap-2.5 rounded-[var(--radius-sm)] px-1.5 py-1 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      >
        <Logo className="size-7 shrink-0" />
        {!collapsed && <span className="truncate text-[15px] font-semibold tracking-tight">{BRAND_NAME}</span>}
      </Link>

      <ul className="flex flex-col gap-0.5">
        {primaryNavItems.map(({ href, label, icon: Icon, platform }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                // Scoped per-item (not by the current route) so hovering YouTube always
                // previews YouTube red, even while you're sitting on the Instagram page.
                data-platform={platform}
                className={cn(
                  "group platform-transition relative flex items-center gap-3 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm font-medium",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-platform-soft text-platform-primary"
                    : platform
                      ? "text-muted-foreground hover:bg-platform-soft hover:text-platform-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {active && (
                  <span
                    className="absolute left-0 h-5 w-[3px] rounded-full bg-platform-primary shadow-[0_0_10px_var(--platform-glow)]"
                    aria-hidden
                  />
                )}
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="my-3 border-t border-border" role="separator" />

      <ul className="flex flex-col gap-0.5">
        {secondaryNavItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm font-medium transition-colors duration-150",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex flex-col gap-2 pt-3">
        <ThemeToggle compact={!collapsed} />
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "hidden md:inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150",
              collapsed && "justify-center px-0",
            )}
          >
            <PanelLeft className="size-[18px] shrink-0" aria-hidden />
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </nav>
  );
}
