import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { themeAtom } from "@/atoms/settings";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAtomValue(themeAtom);
  const [hydrated, setHydrated] = useState(false);

  // Wait for atomWithStorage to load from localStorage
  useEffect(() => {
    // requestAnimationFrame ensures we wait for the next frame,
    // by which time atomWithStorage has loaded from localStorage
    requestAnimationFrame(() => {
      setHydrated(true);
    });
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Also listen for system theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Hide content until theme is applied to prevent flash
  if (!hydrated) {
    return null;
  }

  return <>{children}</>;
}

