
import React from 'react'; 
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // leemos de localStorage o del sistema
    const stored = window.localStorage.getItem("theme");
    if (stored) return stored;

    // si no hay nada guardado, usamos el modo del sistema
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement; // <html>

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
  <div className="absolute top-4 right-4">
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-between h-7 w-16 rounded-full px-2
        bg-gray-300 dark:bg-gray-700 transition-colors"
    >
      <span className="text-sm">☀️</span>
      <span className="text-sm">🌙</span>

      <span
        className={`absolute h-6 w-6 rounded-full bg-white dark:bg-gray-200 shadow transform transition-transform
          ${theme === "light" ? "translate-x-0" : "translate-x-8"}`}
      ></span>
    </button>
  </div>
  );
}
