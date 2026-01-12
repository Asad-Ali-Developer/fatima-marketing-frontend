"use client";

import { MoonIcon, SunIcon } from "lucide-react";

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform"
      onClick={() => {
        document.documentElement.classList.toggle("dark");
      }}
      aria-label="Toggle theme"
    >
      <SunIcon className="dark:hidden w-5 h-5" />
      <MoonIcon className="hidden dark:block w-5 h-5" />
    </button>
  );
}
