import { Home, History, Settings2 } from "lucide-react";
import { PLATFORM_LIST } from "@/lib/config/platforms";
import { PLATFORM_ICONS } from "@/components/icons/platform-icon";
import type { Platform } from "@/types/media";

export const primaryNavItems: { href: string; label: string; icon: (typeof PLATFORM_ICONS)[Platform]; platform?: Platform }[] = [
  { href: "/", label: "Home", icon: Home },
  ...PLATFORM_LIST.map((p) => ({ href: `/${p.path}`, label: p.name, icon: PLATFORM_ICONS[p.id], platform: p.id })),
];

export const secondaryNavItems = [
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings2 },
];
