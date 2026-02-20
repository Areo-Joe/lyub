import { atomWithStorage } from "jotai/utils";

export type TimeUnit = "seconds" | "minutes" | "hours";

export const timeUnitAtom = atomWithStorage<TimeUnit>("lyub-time-unit", "minutes");

// Theme settings
export type Theme = "light" | "dark" | "system";

export const themeAtom = atomWithStorage<Theme>("lyub-theme", "system");

export const TIME_UNIT_OPTIONS: { value: TimeUnit; label: string }[] = [
  { value: "seconds", label: "Sec" },
  { value: "minutes", label: "Min" },
  { value: "hours", label: "Hour" },
];

// Format duration (in seconds) based on unit preference
export function formatDuration(secs: number, unit: TimeUnit): string {
  if (unit === "seconds") {
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (unit === "hours") {
    const hrs = secs / 3600;
    return `${hrs.toFixed(2)}h`;
  }
  // minutes (default)
  const mins = Math.round(secs / 60);
  if (mins === 0) return "0m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

