import React, { createContext, useContext, useState, useEffect } from "react";
import { useAccountsTheme } from "../pages/accounts/useAccountsTheme";

const NavBarContext = createContext(null);

export function NavBarProvider({ children }) {
  const {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    themeStyles,
  } = useAccountsTheme("light");

  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = theme;
      root.style.colorScheme = isDark ? "dark" : "light";

      root.style.setProperty("--primary", themeStyles.navBg || "#06264d");

      root.style.setProperty("--nav-bg", themeStyles.navBg || "#06264d");
      root.style.setProperty("--nav-text", themeStyles.navText || "#ffffff");

      root.style.setProperty("--app-bg", themeStyles.pageBg || "#ffffff");
      root.style.setProperty("--app-text", themeStyles.text || "#000000");
      root.style.setProperty("--muted-text", themeStyles.mutedText || "#6b7280");
      root.style.setProperty("--border", themeStyles.border || "rgba(17, 24, 39, 0.08)");

      root.style.setProperty(
        "--card-bg",
        themeStyles.cardBg || themeStyles.pageBg || "#ffffff",
      );
      root.style.setProperty(
        "--card-text",
        themeStyles.cardText || themeStyles.text || "#000000",
      );
      root.style.setProperty(
        "--card-text-secondary",
        themeStyles.cardTextSecondary || themeStyles.mutedText || "#6b7280",
      );
      root.style.setProperty("--surface-bg", themeStyles.surfaceBg || "#eef2f7");

      root.style.setProperty("--input-bg", themeStyles.inputBg || "#ffffff");
      root.style.setProperty(
        "--input-text",
        themeStyles.inputText || "#000000",
      );

      root.style.setProperty(
        "--tab-passive-bg",
        themeStyles.tabPassiveBg || "#2A2740",
      );
      root.style.setProperty(
        "--tab-passive-text",
        themeStyles.tabPassiveText || "#9CA3AF",
      );
      root.style.setProperty(
        "--tab-active-bg",
        themeStyles.tabActiveBg || "#7C3AED",
      );
      root.style.setProperty(
        "--tab-active-text",
        themeStyles.tabActiveText || "#FFFFFF",
      );
    }
  }, [theme, isDark, themeStyles]);

  return (
    <NavBarContext.Provider
      value={{
        theme,
        isDark,
        setTheme,
        toggleTheme,
        themeStyles,
        query,
        setQuery,
        title,
        setTitle,
        showBack,
        setShowBack,
      }}
    >
      {children}
    </NavBarContext.Provider>
  );
}

export function useNavBarContext() {
  const ctx = useContext(NavBarContext);
  if (!ctx)
    throw new Error("useNavBarContext must be used within NavBarProvider");
  return ctx;
}
