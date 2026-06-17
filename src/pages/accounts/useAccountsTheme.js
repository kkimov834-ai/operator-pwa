import { useState, useMemo } from "react";

const THEME_STORAGE_KEY = "operator_pwa_theme";

export function useAccountsTheme(initial = "light") {
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage === "undefined") return initial;
    return localStorage.getItem(THEME_STORAGE_KEY) || initial;
  });
  const isDark = theme === "dark";

  const setThemeMode = (nextTheme) => {
    setTheme(nextTheme);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }
  };

  const toggleTheme = () =>
    setThemeMode(isDark ? "light" : "dark");

  const themeStyles = useMemo(
    () => ({
      navBg: "#06264d",
      navText: "#ffffff",

      pageBg: isDark ? "#0b1120" : "#f6f7fb",
      text: isDark ? "#f8fafc" : "#111827",
      mutedText: isDark ? "#94a3b8" : "#6b7280",
      border: isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(17, 24, 39, 0.08)",

      cardBg: isDark ? "#111827" : "#ffffff",
      cardText: isDark ? "#f8fafc" : "#111827",
      cardTextSecondary: isDark ? "#94a3b8" : "#6b7280",
      popupBg: isDark ? "#111827" : "#ffffff",
      surfaceBg: isDark ? "#1f2937" : "#eef2f7",

      inputBg: isDark ? "#0f172a" : "#ffffff",
      inputText: isDark ? "#f8fafc" : "#111827",

      tabPassiveBg: isDark ? "#1f2937" : "#e5e7eb",
      tabPassiveText: isDark ? "#cbd5e1" : "#374151",
      tabActiveBg: "#2563eb",
      tabActiveText: "#ffffff",

      isDark,
    }),
    [isDark],
  );

  return { theme, isDark, setTheme: setThemeMode, toggleTheme, themeStyles };
}
