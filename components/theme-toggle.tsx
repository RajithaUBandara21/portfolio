"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid rendering theme-dependent UI until mounted, since the server can't know the
  // client's preferred/stored theme and mismatching would trigger a hydration warning.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // This is the mount-flag pattern next-themes' own docs recommend for exactly this case:
    // there is no external system to synchronize with here, just a one-time "we're on the
    // client now, so resolvedTheme is trustworthy" flip that can't be derived any other way.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* Both icons are always mounted and cross-fade/rotate via CSS, rather than swapping which
          icon renders — an abrupt swap reads as a glitch, a transition reads as a switch. */}
      <span className="relative size-4">
        <Sun
          className={`absolute inset-0 size-4 transition-all motion-safe:duration-300 ${
            isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
        />
        <Moon
          className={`absolute inset-0 size-4 transition-all motion-safe:duration-300 ${
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
          }`}
        />
      </span>
    </Button>
  );
}
