"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes = [
    { value: "light" as const, icon: Sun, label: "라이트" },
    { value: "dark" as const, icon: Moon, label: "다크" },
    { value: "system" as const, icon: Monitor, label: "시스템" },
  ];

  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        aria-label="테마 변경"
      >
        <CurrentIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
          {themes.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
                ${theme === value 
                  ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {theme === value && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

