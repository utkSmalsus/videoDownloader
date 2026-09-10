import { createLocalStore } from "@/lib/utils/local-store";

export const sidebarStore = createLocalStore<boolean>("fp:sidebar-collapsed", false);
