"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const next = () => {
    const order = ["light", "dark", "system"] as const;
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label = theme === "dark" ? "Koyu" : theme === "light" ? "Acik" : "Sistem";

  return (
    <button
      onClick={next}
      className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      title={`Tema: ${label}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs hidden sm:inline">{label}</span>
    </button>
  );
}
