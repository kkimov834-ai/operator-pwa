import { createContext, useContext, useState, useEffect } from "react";
import { useAccountsTheme } from "../pages/accounts/useAccountsTheme";

const NavBarContext = createContext(null);

export function NavBarProvider({ children }) {
  const { theme, isDark, setTheme, toggleTheme, themeStyles } =
    useAccountsTheme("light");

  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [showBack, setShowBack] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const toggleSearch = () => setShowSearch((prev) => !prev);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = theme;
      root.style.colorScheme = isDark ? "dark" : "light";

      root.style.setProperty("--primary", themeStyles.navBg || "#06264d");

      root.style.setProperty("--nav-bg", themeStyles.navBg || "#06264d");
      root.style.setProperty("--nav-text", themeStyles.navText || "#ffffff");
      root.style.setProperty(
        "--nav-button-bg",
        themeStyles.navButtonBg || "#f3f4f6",
      );
      root.style.setProperty(
        "--nav-button-text",
        themeStyles.navButtonText || "#111827",
      );
      root.style.setProperty(
        "--nav-button-border",
        themeStyles.navButtonBorder || "rgba(17, 24, 39, 0.08)",
      );

      root.style.setProperty("--app-bg", themeStyles.pageBg || "#ffffff");
      root.style.setProperty("--app-text", themeStyles.text || "#000000");
      root.style.setProperty(
        "--muted-text",
        themeStyles.mutedText || "#6b7280",
      );
      root.style.setProperty("--border", themeStyles.border || "#11182714");

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
      root.style.setProperty(
        "--surface-bg",
        themeStyles.surfaceBg || "#eef2f7",
      );

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

      // Ant Design Mobile Theme Sync
      root.style.setProperty(
        "--adm-color-background",
        themeStyles.cardBg || themeStyles.pageBg || "#ffffff"
      );
      root.style.setProperty(
        "--adm-color-box",
        themeStyles.surfaceBg || "#eef2f7"
      );
      root.style.setProperty(
        "--adm-color-text",
        themeStyles.text || "#000000"
      );
      root.style.setProperty(
        "--adm-color-text-secondary",
        themeStyles.mutedText || "#6b7280"
      );
      root.style.setProperty(
        "--adm-border-color",
        themeStyles.border || "#11182714"
      );
      root.style.setProperty(
        "--adm-color-border",
        themeStyles.border || "#11182714"
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
        showSearch,
        setShowSearch,
        title,
        setTitle,
        showBack,
        setShowBack,
        toggleSearch,
      }}
    >
      {children}
    </NavBarContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNavBarContext() {
  const ctx = useContext(NavBarContext);
  if (!ctx)
    throw new Error("useNavBarContext must be used within NavBarProvider");
  return ctx;
}
