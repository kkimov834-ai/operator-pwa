import { useState, useMemo } from "react";

export function useAccountsTheme(initial = "light") {
  const [theme, setTheme] = useState(initial);
  const isDark = theme === "dark";

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const themeStyles = useMemo(
    () => ({
      pageBg: isDark ? "#071025" : "#ffffff",
      text: isDark ? "#e6eef8" : "#0f1724",
      cardBg: isDark ? "#071728" : "#ffffff",
      cardText: isDark ? "#e6eef8" : "#0f1724",
      serviceBg: isDark ? "#0b1220" : "#f8fafc",
      serviceText: isDark ? "#cbd5e1" : "#0f1724",
      popupBg: isDark ? "#071025" : "#ffffff",
      isDark,
    }),
    [isDark],
  );

  return { theme, isDark, toggleTheme, themeStyles };
}
