import React, { createContext, useContext, useState } from "react";
import { useAccountsTheme } from "../pages/accounts/useAccountsTheme";

const NavBarContext = createContext(null);

export function NavBarProvider({ children }) {
  const {
    theme,
    isDark,
    toggleTheme,
    themeStyles: baseStyles,
  } = useAccountsTheme("light");

  const [colorTheme, setColorTheme] = useState("default");
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [showBack, setShowBack] = useState(false);

  const colorOverrides = {
    default: {},
    blue: {},
    green: {},
    pink: {},
    purple: {},
  };

  const themeStyles = {
    ...(baseStyles || {}),
    ...(colorOverrides[colorTheme] || {}),
  };

  return (
    <NavBarContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        themeStyles,
        colorTheme,
        setColorTheme,
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
