"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-14 h-8" />;

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-14 h-8 rounded-full p-1 transition-all duration-500 ease-in-out border border-border shadow-inner focus:outline-none",
        theme === "dark" ? "bg-slate-800" : "bg-slate-100"
      )}
      aria-label="Toggle theme"
    >
      {/* Knob */}
      <div
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full transition-all duration-500 ease-in-out shadow-sm",
          theme === "dark" 
            ? "translate-x-6 bg-slate-900 text-yellow-400" 
            : "translate-x-0 bg-white text-slate-500"
        )}
      >
        {theme === "dark" ? (
          <Moon className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Sun className="w-3.5 h-3.5 fill-current" />
        )}
      </div>

      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none opacity-20">
        <Sun className={cn("w-3 h-3", theme === "dark" ? "text-slate-400" : "text-slate-600")} />
        <Moon className={cn("w-3 h-3", theme === "dark" ? "text-slate-400" : "text-slate-600")} />
      </div>
    </button>
  );
}
