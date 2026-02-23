
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
    <button
      onClick={toggleTheme}
      className="px-3 py-1 rounded border border-gray-400 dark:border-gray-600"
    >
      {theme !== "light" ? "🌙 Modo oscuro" : "☀️ Modo claro"}
    </button>
  );
}
