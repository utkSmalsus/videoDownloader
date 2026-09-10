"use client";

import { useSyncExternalStore } from "react";
import { preferencesStore, type Preferences } from "@/lib/storage/preferences";

const FORMATS: Preferences["preferredFormat"][] = ["mp4", "mp3"];
const QUALITIES: Preferences["preferredQuality"][] = ["highest", "1080p", "720p", "480p"];

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-11 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "highest" ? "Highest available" : o.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PreferencesForm() {
  const prefs = useSyncExternalStore(preferencesStore.subscribe, preferencesStore.getSnapshot, preferencesStore.getServerSnapshot);

  function update(next: Partial<Preferences>) {
    preferencesStore.set({ ...prefs, ...next });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Select
        label="Preferred format"
        value={prefs.preferredFormat}
        options={FORMATS}
        onChange={(v) => update({ preferredFormat: v })}
      />
      <Select
        label="Preferred quality"
        value={prefs.preferredQuality}
        options={QUALITIES}
        onChange={(v) => update({ preferredQuality: v })}
      />
    </div>
  );
}
