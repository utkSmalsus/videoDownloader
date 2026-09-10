import { createLocalStore } from "@/lib/utils/local-store";

export interface Preferences {
  preferredFormat: "mp4" | "mp3";
  preferredQuality: "highest" | "1080p" | "720p" | "480p";
}

export const DEFAULT_PREFERENCES: Preferences = {
  preferredFormat: "mp4",
  preferredQuality: "highest",
};

export const preferencesStore = createLocalStore<Preferences>("fp:preferences", DEFAULT_PREFERENCES);
